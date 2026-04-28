import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CompleteBookingStatusCommand } from './booking.commands';
import type { IBookingRepo } from '../../domain/repo-interfaces/IBookingRepo.interface';
import { Logger } from 'nestjs-pino';

@CommandHandler(CompleteBookingStatusCommand)
export class CompleteBookingStatusHandler implements ICommandHandler<CompleteBookingStatusCommand> {
  constructor(
    @Inject('BookingRepo') private readonly repo: IBookingRepo,
    private readonly logger: Logger,
  ) {}

  async execute(command: CompleteBookingStatusCommand): Promise<any> {
    for (const id of command.idsArr) {
      try {
        const entity = await this.repo.getEntityById(id.id);
        if (!entity) continue;
        entity.complete();
        await this.repo.save(entity);
        entity.commit();
      } catch (err) {
        this.logger.error(
          { err, bookingId: id },
          `Error during complete booking in id ${id.id}`,
        );
      }
    }
  }
}
