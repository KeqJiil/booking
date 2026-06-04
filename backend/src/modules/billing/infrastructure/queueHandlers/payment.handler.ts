import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { IJobWebhookData } from 'src/infrastructure/payments/interfaces/data.interfaces';
import { IPaymentConsts } from 'src/common/constants/paymentConsts';
import { CommandBus } from '@nestjs/cqrs';
import { PayBookingStatusCommand } from 'src/modules/booking/application/commands/booking.commands';
import { BillingService } from '../../billing.service';

@Processor('payments')
export class PaymentsQueueHandler extends WorkerHost {
  constructor(
    private readonly billingService: BillingService,
    private readonly commandBus: CommandBus,
  ) {
    super();
  }

  async process(job: Job) {
    const data = job.data as IJobWebhookData;
    switch (job.name as IPaymentConsts) {
      case 'payment_success': {
        await this.billingService.successPayment(
          data.bookingId,
          data.paymentIntentId,
        );
        await this.commandBus.execute(
          new PayBookingStatusCommand(data.userId, data.bookingId),
        );
        break;
      }
      case 'payment_failed': {
        await this.billingService.failPayment(data.bookingId);
        break;
      }
    }
  }
}
