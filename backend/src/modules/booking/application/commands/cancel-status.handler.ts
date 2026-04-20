import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CancelBookingStatusCommand } from './booking.commands';
import type { ITransactionRepo } from '../interfaces.ts/TransactionRepo.interface';
import type { IBookingRepo } from '../../domain/repo-interfaces/IBookingRepo.interface';

@CommandHandler(CancelBookingStatusCommand)
export class CancelBookingHandler implements ICommandHandler<CancelBookingStatusCommand> {
  constructor(
    @Inject('TransactionRepo') private readonly transactions: ITransactionRepo,
    @Inject('BookingRepo') private readonly repo: IBookingRepo,
  ) {}

  async execute(command: CancelBookingStatusCommand): Promise<any> {
    await this.transactions.startTransaction(async (tx) => {
      const entity = await this.repo.getEntityById(command.bookingId, tx);
      if (!entity || !entity.isBooker(command.userId)) throw new Error();
      entity.cancel();
      await this.repo.save(entity, tx);
      entity.commit();
    });
  }
}
