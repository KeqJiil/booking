import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { CreatePropertyCommand } from './property.commands';
import { Inject } from '@nestjs/common';
import type { IPropertyRepo } from '../../domain/repo-interface/IPropertyRepo.interface';
import { PropertyMapper } from '../mappers/property.mapper';

@CommandHandler(CreatePropertyCommand)
export class CreatePropertyHandler implements ICommandHandler<CreatePropertyCommand> {
  constructor(
    @Inject('IPropertyRepo') private repository: IPropertyRepo,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(command: CreatePropertyCommand): Promise<any> {
    const property = PropertyMapper.toEntity(command.data);
    const propertyWithEvents = this.publisher.mergeObjectContext(property);
    await this.repository.save(property);
    propertyWithEvents.commit();
    return { id: property.id };
  }
}
