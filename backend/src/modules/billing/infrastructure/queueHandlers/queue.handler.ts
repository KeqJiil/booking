import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject } from '@nestjs/common';
import { Job } from 'bullmq';
import type { IPaymentService } from 'src/infrastructure/payments/interfaces/paymentService.interface';
import type {
  IOutboxDataView,
  IOutboxRepository,
} from 'src/infrastructure/repo/outbox/interfaces/outbox.interface';
import type {
  ITransactionRepo,
  Tx,
} from 'src/infrastructure/repo/transactions/interfaces/TransactionRepo.interface';

@Processor('billing')
export class BillingQueueHandler extends WorkerHost {
  constructor(
    @Inject('PAYMENT_SERVICE') private paymentService: IPaymentService,
    @Inject('OUTBOX_SERVICE') private outbox: IOutboxRepository<Tx>,
    private readonly transaction: ITransactionRepo,
  ) {
    super();
  }

  async process(job: Job) {
    const data = job.data as IOutboxDataView;
    switch (data.type) {
      case 'REFUND_REQUEST': {
        await this.paymentService.handleRefund(data.itemId, data.id);
        await this.transaction.startTransaction(async (tx: Tx) => {
          await this.outbox.markSucceeded(data.id, tx);
        });
      }
    }
  }
}
