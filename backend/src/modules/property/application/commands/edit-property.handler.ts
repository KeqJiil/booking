import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { EditPropertyCommand } from './property.commands';
import type { IPropertyRepo } from '../../domain/repo-interface/IPropertyRepo.interface';
import { ForbiddenException, Inject } from '@nestjs/common';
import { Address } from '../../domain/value-objects/address.value';

@CommandHandler(EditPropertyCommand)
export class EditPropertyHandler implements ICommandHandler<EditPropertyCommand> {
  constructor(
    @Inject('IPropertyRepo') private repository: IPropertyRepo,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(command: EditPropertyCommand): Promise<any> {
    const {
      city,
      address,
      country,
      name,
      description,
      price,
      maxGuests,
      typeId,
    } = command.changeProperty;
    const property = await this.repository.getEntityById(
      command.changeProperty.id,
    );
    if (property.props.hostId !== command.userId)
      throw new ForbiddenException();
    if (city && address && country) {
      const newAddress = new Address(city, country, address);
      property.changeAddress(newAddress);
    }
    if (description) property.changeDescription(description);
    if (maxGuests) property.changeMaxGuests(maxGuests);
    if (name) property.changeName(name);
    if (price) property.changePrice(price);
    if (typeId) property.changeType(typeId);
    const propertyWithEvents = this.publisher.mergeObjectContext(property);
    await this.repository.save(property);
    propertyWithEvents.commit();
  }
}
