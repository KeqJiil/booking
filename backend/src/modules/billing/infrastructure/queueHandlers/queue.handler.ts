import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject } from '@nestjs/common';
import { Job } from 'bullmq';
import {
  BILLING_OUTBOX_REPO,
  PRISMA_TRANSACTION_CLIENT,
  STRIPE_PAYMENT_CLIENT,
} from 'src/common/constants/providerConstants';
import type { IPaymentService } from 'src/infrastructure/payments/interfaces/paymentService.interface';
import type {
  ITransactionRepo,
  Tx,
} from 'src/infrastructure/repo/transactions/interfaces/TransactionRepo.interface';
import {
  IBillingOutboxTypes,
  IOutboxBillingPayload,
  IOutboxBillingViewData,
} from '../repository/billingOutbox.types';
import { PaymentId } from '../../domain/typedId/paymentId';
import { OutboxRepository } from '../../../../infrastructure/repo/outbox/repo/outbox.repository';

@Processor('billing')
export class BillingQueueHandler extends WorkerHost {
  constructor(
    @Inject(STRIPE_PAYMENT_CLIENT) private paymentService: IPaymentService,
    @Inject(BILLING_OUTBOX_REPO)
    private outbox: OutboxRepository<
      IBillingOutboxTypes,
      IOutboxBillingPayload,
      PaymentId
    >,
    @Inject(PRISMA_TRANSACTION_CLIENT)
    private readonly transaction: ITransactionRepo,
  ) {
    super();
  }

  async process(job: Job) {
    const data = job.data as IOutboxBillingViewData;
    switch (data.type) {
      case 'REFUND_REQUEST': {
        await this.paymentService.handleRefund(data.itemId.toString(), data.id);
        await this.transaction.startTransaction(async (tx: Tx) => {
          await this.outbox.markSucceeded(data.id, tx);
        });
      }
    }
  }
}
