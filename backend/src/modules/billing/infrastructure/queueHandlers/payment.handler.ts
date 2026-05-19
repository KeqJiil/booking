import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject } from '@nestjs/common';
import type { IBillingRepo } from '../repository/billingRepository.interface';
import { Job } from 'bullmq';
import { IJobWebhookData } from 'src/infrastructure/payments/interfaces/data.interfaces';
import { IPaymentConsts } from 'src/common/constants/paymentConsts';
import { CommandBus } from '@nestjs/cqrs';
import { PayBookingStatusCommand } from 'src/modules/booking/application/commands/booking.commands';

@Processor('payments')
export class PaymentsQueueHandler extends WorkerHost {
  constructor(
    @Inject('BILLING_REPOSITORY') private billingRepo: IBillingRepo,
    private readonly commandBus: CommandBus,
  ) {
    super();
  }

  async process(job: Job) {
    const data = job.data as IJobWebhookData;
    switch (job.name as IPaymentConsts) {
      case 'payment_success': {
        await this.billingRepo.paymentSuccess(
          data.bookingId,
          data.paymentIntentId,
        );
        await this.commandBus.execute(
          new PayBookingStatusCommand(data.userId, data.bookingId),
        );
        break;
      }
      case 'payment_failed': {
        await this.billingRepo.paymentFail(data.bookingId);
        break;
      }
    }
  }
}
