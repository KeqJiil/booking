import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ExpireBookingStatusCommand } from './booking.commands';
import { Inject, NotFoundException } from '@nestjs/common';
import type { ITransactionRepo } from '../interfaces.ts/TransactionRepo.interface';
import type { IBookingRepo } from '../../domain/repo-interfaces/IBookingRepo.interface';

@CommandHandler(ExpireBookingStatusCommand)
export class ChangeBookingHandler implements ICommandHandler<ExpireBookingStatusCommand> {
  constructor(
    @Inject('TransactionRepo') private readonly transactions: ITransactionRepo,
    @Inject('BookingRepo') private readonly repo: IBookingRepo,
  ) {}

  async execute(command: ExpireBookingStatusCommand): Promise<void> {
    await this.transactions.startTransaction(async (tx) => {
      const entity = await this.repo.getEntityById(command.id, tx);
      if (!entity) throw new NotFoundException();
      entity.expire();
      await this.repo.save(entity, tx);
      entity.commit();
    });
  }
}
