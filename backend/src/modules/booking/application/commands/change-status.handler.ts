import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ChangeBookingStatusCommand } from './booking.commands';
import { Inject } from '@nestjs/common';
import type { ITransactionRepo } from '../interfaces.ts/TransactionRepo.interface';
import type { IBookingRepo } from '../../domain/repo-interfaces/IBookingRepo.interface';

@CommandHandler(ChangeBookingStatusCommand)
export class CreateBookingHandler implements ICommandHandler<ChangeBookingStatusCommand> {
  constructor(
    @Inject('TransactionRepo') private readonly transactions: ITransactionRepo,
    @Inject('BookingRepo') private readonly repo: IBookingRepo,
  ) {}

  async execute(command: ChangeBookingStatusCommand): Promise<void> {
    await this.transactions.startTransaction(async (tx) => {
      const entity = await this.repo.getEntityById(command.id);
      if (!entity) throw new Error();
      switch (command.status) {
        case 'CANCELLED':
          entity.cancel();
          break;
        case 'COMPLETED':
          entity.complete();
          break;
        case 'PAID':
          entity.pay();
          break;
        case 'EXPIRED':
          entity.expire();
          break;
        case 'REJECTED':
          entity.reject();
          break;
        case 'CONFIRMED':
          entity.confirm();
          break;
      }
      await this.repo.save(entity, tx);
    });
  }
}
