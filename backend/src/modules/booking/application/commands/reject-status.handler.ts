import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import type { ITransactionRepo } from '../../../../infrastructure/repo/transactions/interfaces/TransactionRepo.interface';
import type { IBookingRepo } from '../../domain/repo-interfaces/IBookingRepo.interface';
import { RejectBookingStatusCommand } from './booking.commands';

@CommandHandler(RejectBookingStatusCommand)
export class RejectBookingStatusHandler implements ICommandHandler<RejectBookingStatusCommand> {
  constructor(
    @Inject('TransactionRepo') private readonly transactions: ITransactionRepo,
    @Inject('BookingRepo') private readonly repo: IBookingRepo,
  ) {}

  async execute(command: RejectBookingStatusCommand): Promise<any> {
    await this.transactions.startTransaction(async (tx) => {
      const entity = await this.repo.getEntityById(command.bookingId, tx);
      if (!entity || !entity.isOwner(command.hostId))
        throw new NotFoundException();
      entity.reject();
      await this.repo.save(entity, tx);
      entity.commit();
    });
  }
}
