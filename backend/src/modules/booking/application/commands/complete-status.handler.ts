import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CompleteBookingStatusCommand } from './booking.commands';
import type { IBookingRepo } from '../../domain/repo-interfaces/IBookingRepo.interface';

@CommandHandler(CompleteBookingStatusCommand)
export class CompleteBookingStatusHandler implements ICommandHandler<CompleteBookingStatusCommand> {
  private readonly logger = new Logger('Complete service');

  constructor(@Inject('BookingRepo') private readonly repo: IBookingRepo) {}

  async execute(command: CompleteBookingStatusCommand): Promise<any> {
    for (const id of command.idsArr) {
      try {
        const entity = await this.repo.getEntityById(id.id);
        if (!entity) continue;
        entity.complete();
        await this.repo.save(entity);
        entity.commit();
      } catch {
        this.logger.error(`Error during complete service in id ${id.id}`);
      }
    }
  }
}
