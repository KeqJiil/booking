import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AddImagesCommand } from './property.commands';
import { ForbiddenException, Inject } from '@nestjs/common';
import type { IPropertyRepo } from '../../domain/repo-interface/IPropertyRepo.interface';
import type { ITransactionRepo } from 'src/infrastructure/repo/transactions/interfaces/TransactionRepo.interface';

@CommandHandler(AddImagesCommand)
export class AddImagesCommandHandler implements ICommandHandler<AddImagesCommand> {
  constructor(
    @Inject('TransactionRepo') private readonly transactions: ITransactionRepo,
    @Inject('IPropertyRepo') private repository: IPropertyRepo,
  ) {}

  async execute(command: AddImagesCommand): Promise<any> {
    return await this.transactions.startTransaction(async (tx: unknown) => {
      const entity = await this.repository.getEntityById(
        command.propertyId,
        tx,
      );
      if (!entity.isHost(command.userId)) throw new ForbiddenException();
      const newUrls = command.urls.map((el) => ({ url: el }));
      const oldUrls = entity.images.map((el) => ({ url: el.data.url }));
      entity.updateImages(newUrls.concat(oldUrls));
      await this.repository.save(entity, tx);
    });
  }
}
