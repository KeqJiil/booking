import { Injectable, Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Cron } from '@nestjs/schedule';
import { CompleteBookingStatusCommand } from '../../application/commands/booking.commands';
import type { IBookingRepo } from '../../domain/repo-interfaces/IBookingRepo.interface';

@Injectable()
export class CompleteBookingCron {
  private readonly logger = new Logger('Completed Bookings');

  constructor(
    private readonly commandBus: CommandBus,
    private readonly repo: IBookingRepo,
  ) {}

  @Cron('0 0 * * * *')
  async handleCompletedBookings() {
    this.logger.log('Starting hourly booking complete status check');
    let isMoreIds = true;
    while (isMoreIds) {
      const idsArr = await this.repo.getIdsToComplete();
      if (idsArr.length === 0) isMoreIds = false;
      await this.commandBus.execute(new CompleteBookingStatusCommand(idsArr));
    }
  }
}
