import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AddImagesCommand } from './property.commands';
import { ForbiddenException, Inject } from '@nestjs/common';
import type { IPropertyRepo } from '../../domain/repo-interface/IPropertyRepo.interface';
import type { ITransactionRepo } from 'src/infrastructure/repo/transactions/interfaces/TransactionRepo.interface';
import { TRANSACTION_REPO } from 'src/common/constants/providerConstants';
import { IImage } from '../../domain/entities/Image.entity';

@CommandHandler(AddImagesCommand)
export class AddImagesCommandHandler implements ICommandHandler<AddImagesCommand> {
  constructor(
    @Inject(TRANSACTION_REPO) private readonly transactions: ITransactionRepo,
    @Inject('IPropertyRepo') private repository: IPropertyRepo,
  ) {}

  async execute(command: AddImagesCommand): Promise<void> {
    return await this.transactions.startTransaction(async (tx: unknown) => {
      const entity = await this.repository.getEntityById(
        command.propertyId,
        tx,
      );
      if (!entity.isHost(command.userId)) throw new ForbiddenException();
      const newUrls: IImage[] = command.urls.map((el) => ({ url: el }));
      const oldUrls: IImage[] = entity.images.map((el) => ({
        url: el.data.url,
        id: el.id,
      }));
      const urls = oldUrls.concat(newUrls);
      entity.updateImages(urls);
      await this.repository.save(entity, tx);
    });
  }
}
