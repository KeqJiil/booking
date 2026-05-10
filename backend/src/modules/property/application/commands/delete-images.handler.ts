import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteImagesCommand } from './property.commands';
import { ForbiddenException, Inject } from '@nestjs/common';
import type { IPropertyRepo } from '../../domain/repo-interface/IPropertyRepo.interface';

@CommandHandler(DeleteImagesCommand)
export class DeleteImagesCommandHandler implements ICommandHandler<DeleteImagesCommand> {
  constructor(@Inject('IPropertyRepo') private repository: IPropertyRepo) {}

  async execute(command: DeleteImagesCommand): Promise<any> {
    const entity = await this.repository.getEntityById(command.propertyId);
    if (!entity.isHost(command.userId)) throw new ForbiddenException();
    const urlsToRemove = new Set(command.urls);
    const newUrls = entity.images
      .filter((el) => !urlsToRemove.has(el.data.url))
      .map((el) => ({ url: el.data.url }));
    entity.updateImages(newUrls);
    await this.repository.save(entity);
  }
}
