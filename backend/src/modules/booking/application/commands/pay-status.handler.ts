import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PayBookingStatusCommand } from './booking.commands';
import type { ITransactionRepo } from '../interfaces.ts/TransactionRepo.interface';
import type { IBookingRepo } from '../../domain/repo-interfaces/IBookingRepo.interface';

@CommandHandler(PayBookingStatusCommand)
export class PayBookingStatusHandler implements ICommandHandler<PayBookingStatusCommand> {
  constructor(
    @Inject('TransactionRepo') private readonly transactions: ITransactionRepo,
    @Inject('BookingRepo') private readonly repo: IBookingRepo,
  ) {}

  async execute(command: PayBookingStatusCommand): Promise<any> {
    await this.transactions.startTransaction(async (tx) => {
      const entity = await this.repo.getEntityById(command.bookingId, tx);
      if (!entity || !entity.isBooker(command.userId)) throw new Error();
      entity.pay();
      await this.repo.save(entity, tx);
      entity.commit();
    });
  }
}
