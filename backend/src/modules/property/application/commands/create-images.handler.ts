import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AddImagesCommand } from './property.commands';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ForbiddenException, Inject } from '@nestjs/common';
import type { IPropertyRepo } from '../../domain/repo-interface/IPropertyRepo.interface';

@CommandHandler(AddImagesCommand)
export class AddImagesCommandHandler implements ICommandHandler<AddImagesCommand> {
  constructor(
    @Inject('IPropertyRepo') private repository: IPropertyRepo,
    @InjectQueue('property') private readonly queue: Queue,
  ) {}

  async execute(command: AddImagesCommand): Promise<any> {
    const entity = await this.repository.getEntityById(command.propertyId);
    if (!entity.isHost(command.userId)) throw new ForbiddenException();
    const newUrls = command.urls.map((el) => ({ url: el }));
    const oldUrls = entity.images.map((el) => ({ url: el.data.url }));
    entity.updateImages(newUrls.concat(oldUrls));
    await this.repository.save(entity);
  }
}
