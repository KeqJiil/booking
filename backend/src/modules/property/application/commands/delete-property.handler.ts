import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { DeletePropertyCommand } from './property.commands';
import type { IPropertyRepo } from '../../domain/repo-interface/IPropertyRepo.interface';
import { ConflictException, Inject } from '@nestjs/common';

@CommandHandler(DeletePropertyCommand)
export class DeletePropertyHandler implements ICommandHandler<DeletePropertyCommand> {
  constructor(
    @Inject('IPropertyRepo') private repository: IPropertyRepo,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(command: DeletePropertyCommand): Promise<any> {
    const property = await this.repository.getEntityById(command.propertyId);
    const isBookingsAfter = await this.repository.checkBookings(
      property.id,
      new Date(Date.now()),
    );
    if (isBookingsAfter) throw new ConflictException();
    property.deleteProperty(command.userId, command.role === 'ADMIN');
    const propertyWithEvents = this.publisher.mergeObjectContext(property);
    await this.repository.save(property);
    propertyWithEvents.commit();
  }
}
