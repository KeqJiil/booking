import { Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Logger } from 'nestjs-pino';
import type {
  ITransactionRepo,
  Tx,
} from 'src/infrastructure/repo/transactions/interfaces/TransactionRepo.interface';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { eventNames } from 'src/common/constants/eventnames';
import {
  BILLING_OUTBOX_REPO,
  PRISMA_TRANSACTION_CLIENT,
} from 'src/common/constants/providerConstants';
import {
  IBillingOutboxTypes,
  IOutboxBillingPayload,
  IOutboxBillingViewData,
} from '../repository/billingOutbox.types';
import { OutboxRepository } from '../../../../infrastructure/repo/outbox/repo/outbox.repository';
import { PaymentId } from '../../domain/typedId/paymentId';

@Injectable()
export class BillingRefundPending {
  constructor(
    private readonly logger: Logger,
    @Inject(BILLING_OUTBOX_REPO)
    private readonly outbox: OutboxRepository<
      IBillingOutboxTypes,
      IOutboxBillingPayload,
      PaymentId
    >,
    @Inject(PRISMA_TRANSACTION_CLIENT)
    private readonly transaction: ITransactionRepo,
    @InjectQueue('billing') private billingQueue: Queue,
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async handlePendingOutboxed() {
    this.logger.log('Billing Refund cron started');
    const outboxes = await this.outbox.getOutbox('PENDING');
    for (const task of outboxes) {
      try {
        await this.transaction.startTransaction(async (tx: Tx) => {
          await this.outbox.markProcessing(task.id, tx);
        });
        await this.processTask(task);
      } catch (error) {
        this.logger.error(
          { err: error, taskId: task.id },
          'Failed to move outbox task to BullMQ',
        );
      }
    }
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  async handleProcessingOutboxes() {
    this.logger.log('Billing Refund Processing cron started');
    const retryable: IOutboxBillingViewData[] = [];
    await this.transaction.startTransaction(async (tx: Tx) => {
      const outboxes = await this.outbox.getExpiredProcessing(tx);
      for (const outbox of outboxes) {
        if (outbox.retries < 5) {
          await this.outbox.markProcessing(outbox.id, tx);
          await this.outbox.incrementRetries(outbox.id, tx);
          retryable.push(outbox);
        } else {
          await this.outbox.markFailed(outbox.id, tx);
        }
      }
    });
    for (const task of retryable) {
      try {
        await this.processTask(task);
      } catch (error) {
        this.logger.error(
          { err: error, taskId: task.id },
          'Failed to move outbox task to BullMQ',
        );
      }
    }
  }

  private async processTask(task: IOutboxBillingViewData) {
    await this.billingQueue.add(eventNames.billing_refund, task, {
      jobId: task.id,
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });
  }
}
