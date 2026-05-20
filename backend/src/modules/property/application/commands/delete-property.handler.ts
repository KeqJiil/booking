import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { DeletePropertyCommand } from './property.commands';
import type { IPropertyRepo } from '../../domain/repo-interface/IPropertyRepo.interface';
import { ConflictException, Inject } from '@nestjs/common';
import type { ITransactionRepo } from 'src/infrastructure/repo/transactions/interfaces/TransactionRepo.interface';
import { TRANSACTION_REPO } from 'src/common/constants/providerConstants';

@CommandHandler(DeletePropertyCommand)
export class DeletePropertyHandler implements ICommandHandler<DeletePropertyCommand> {
  constructor(
    @Inject('IPropertyRepo') private repository: IPropertyRepo,
    private readonly publisher: EventPublisher,
    @Inject(TRANSACTION_REPO) private readonly transactions: ITransactionRepo,
  ) {}

  async execute(command: DeletePropertyCommand): Promise<any> {
    await this.transactions.startTransaction(async (tx: unknown) => {
      const property = await this.repository.getEntityById(
        command.propertyId,
        tx,
      );
      const isBookingsAfter = await this.repository.checkBookings(
        property.id,
        new Date(Date.now()),
        tx,
      );
      if (isBookingsAfter) throw new ConflictException();
      property.deleteProperty(command.userId, command.role === 'ADMIN');
      const propertyWithEvents = this.publisher.mergeObjectContext(property);
      await this.repository.save(property, tx);
      propertyWithEvents.commit();
    });
  }
}
