import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { EditPropertyCommand } from './property.commands';
import type { IPropertyRepo } from '../../domain/repo-interface/IPropertyRepo.interface';
import { Inject } from '@nestjs/common';
import { NotAllowedError } from 'src/common/exceptions/entityDomain.exceptions';

@CommandHandler(EditPropertyCommand)
export class EditPropertyHandler implements ICommandHandler<EditPropertyCommand> {
  constructor(
    @Inject('IPropertyRepo') private repository: IPropertyRepo,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(command: EditPropertyCommand): Promise<any> {
    const property = await this.repository.getEntityById(
      command.changeProperty.id,
    );
    if (!property.isHost(command.userId))
      throw new NotAllowedError('You are not the host of the property');
    property.edit(command.changeProperty);
    const propertyWithEvents = this.publisher.mergeObjectContext(property);
    await this.repository.save(property);
    propertyWithEvents.commit();
  }
}
