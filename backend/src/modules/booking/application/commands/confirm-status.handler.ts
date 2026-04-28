import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import type { ITransactionRepo } from '../interfaces.ts/TransactionRepo.interface';
import type { IBookingRepo } from '../../domain/repo-interfaces/IBookingRepo.interface';
import { ConfirmBookingStatusCommand } from './booking.commands';

@CommandHandler(ConfirmBookingStatusCommand)
export class ConfirmBookingStatusHandler implements ICommandHandler<ConfirmBookingStatusCommand> {
  constructor(
    @Inject('TransactionRepo') private readonly transactions: ITransactionRepo,
    @Inject('BookingRepo') private readonly repo: IBookingRepo,
  ) {}

  async execute(command: ConfirmBookingStatusCommand): Promise<any> {
    await this.transactions.startTransaction(async (tx) => {
      const entity = await this.repo.getEntityById(command.bookingId, tx);
      if (!entity || !entity.isOwner(command.hostId))
        throw new NotFoundException();
      entity.confirm();
      await this.repo.save(entity, tx);
      entity.commit();
    });
  }
}
