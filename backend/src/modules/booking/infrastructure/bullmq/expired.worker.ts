import { Processor, WorkerHost } from '@nestjs/bullmq';
import { CommandBus } from '@nestjs/cqrs';
import { Job } from 'bullmq';
import { ExpireBookingStatusCommand } from '../../application/commands/booking.commands';
import { eventNames } from 'src/common/constants/eventnames';

@Processor('booking')
export class BookingWorker extends WorkerHost {
  constructor(private readonly commandBus: CommandBus) {
    super();
  }

  async process(job: Job) {
    switch (job.name as keyof typeof eventNames) {
      case 'booking_created': {
        await this.commandBus.execute(
          new ExpireBookingStatusCommand(job.data.id as string),
        );
      }
    }
  }
}
