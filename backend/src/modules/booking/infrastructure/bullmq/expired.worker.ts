import { Processor, WorkerHost } from '@nestjs/bullmq';
import { CommandBus } from '@nestjs/cqrs';
import { Job } from 'bullmq';
import { ChangeBookingStatusCommand } from '../../application/commands/booking.commands';

@Processor('booking')
export class BookingWorker extends WorkerHost {
  constructor(private readonly commandBus: CommandBus) {
    super();
  }

  async process(job: Job, token?: string): Promise<any> {
    await this.commandBus.execute(
      new ChangeBookingStatusCommand(job.data.id, 'EXPIRED'),
    );
  }
}
