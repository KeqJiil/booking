import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { CreatePropertyCommand } from './property.commands';
import { Inject } from '@nestjs/common';
import type { IPropertyRepo } from '../../domain/repo-interface/IPropertyRepo.interface';
import {
  IProperty,
  PropertyEntity,
} from '../../domain/entities/Property.entity';

@CommandHandler(CreatePropertyCommand)
export class CreatePropertyHandler implements ICommandHandler<CreatePropertyCommand> {
  constructor(
    @Inject('IPropertyRepo') private repository: IPropertyRepo,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(command: CreatePropertyCommand): Promise<any> {
    const { address, city, country, ...restData } = command.data;
    const createObj: IProperty = {
      ...restData,
      address: { address, city, country },
    };
    const property = PropertyEntity.create(createObj);
    const propertyWithEvents = this.publisher.mergeObjectContext(property);
    await this.repository.save(property);
    propertyWithEvents.commit();
  }
}
