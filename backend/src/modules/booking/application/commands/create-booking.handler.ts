import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateBookingCommand } from './booking.commands';
import { Inject } from '@nestjs/common';
import type { ITransactionRepo } from '../interfaces.ts/TransactionRepo.interface';
import type { IBookingRepo } from '../../domain/repo-interfaces/IBookingRepo.interface';
import { BookingEntity } from '../../domain/entities/booking.entity';

@CommandHandler(CreateBookingCommand)
export class CreateBookingHandler implements ICommandHandler<CreateBookingCommand> {
  constructor(
    @Inject('TransactionRepo') private readonly transactions: ITransactionRepo,
    @Inject('BookingRepo') private readonly repo: IBookingRepo,
  ) {}

  async execute(command: CreateBookingCommand): Promise<void> {
    await this.transactions.startTransaction(async (tx) => {
      const entity = BookingEntity.create(command.data);
      await this.repo.save(entity, tx);
    });
  }
}
