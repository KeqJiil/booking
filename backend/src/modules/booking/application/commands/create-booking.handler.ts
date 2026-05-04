import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateBookingCommand } from './booking.commands';
import { ConflictException, Inject } from '@nestjs/common';
import type { ITransactionRepo } from '../../../../infrastructure/repo/transactions/interfaces/TransactionRepo.interface';
import type { IBookingRepo } from '../../domain/repo-interfaces/IBookingRepo.interface';
import { BookingEntity } from '../../domain/entities/booking.entity';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import type { IPropertyAdapterToBooking } from '../../domain/repo-interfaces/IPropertyAdapter.interface';

@CommandHandler(CreateBookingCommand)
export class CreateBookingHandler implements ICommandHandler<CreateBookingCommand> {
  constructor(
    @Inject('TransactionRepo') private readonly transactions: ITransactionRepo,
    @Inject('BookingRepo') private readonly repo: IBookingRepo,
    @InjectQueue('booking') private queue: Queue,
    @Inject('PropertyAdapter')
    private readonly PropertyProviderAdapter: IPropertyAdapterToBooking,
  ) {}

  async execute(command: CreateBookingCommand): Promise<void> {
    await this.transactions.startTransaction(async (tx) => {
      const additionalData = await this.PropertyProviderAdapter.getData(
        command.data.propertyId,
      );
      const entity = BookingEntity.create({
        ...command.data,
        priceAtMoment: additionalData.price,
        hostId: additionalData.hostId,
      });
      if (
        await this.repo.getOverlapping(
          entity.data.dateData.startDate,
          entity.data.dateData.endDate,
          entity.data.propertyId,
          tx,
        )
      )
        throw new ConflictException('Overlap dates');
      await this.repo.save(entity, tx);
      await this.queue.add(
        'expire',
        { id: entity.id },
        {
          delay: 10 * 60 * 1000,
        },
      );
      entity.commit();
    });
  }
}
