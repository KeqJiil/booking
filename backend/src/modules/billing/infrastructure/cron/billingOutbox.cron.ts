import { Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Logger } from 'nestjs-pino';
import type {
  IOutboxDataView,
  IOutboxRepository,
} from 'src/infrastructure/repo/outbox/interfaces/outbox.interface';
import type {
  ITransactionRepo,
  Tx,
} from 'src/infrastructure/repo/transactions/interfaces/TransactionRepo.interface';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { eventNames } from 'src/common/constants/eventnames';

@Injectable()
export class BillingRefundPending {
  constructor(
    private readonly logger: Logger,
    @Inject('OUTBOX_SERVICE') private outbox: IOutboxRepository<Tx>,
    private readonly transaction: ITransactionRepo,
    @InjectQueue('billing') private billingQueue: Queue,
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async handlePendingOutboxed() {
    this.logger.log('Billing Refund cron started');
    const outboxes = await this.outbox.getOutbox('PENDING');
    for (const task of outboxes) {
      try {
        await this.processTask(task);
        await this.transaction.startTransaction(async (tx: Tx) => {
          await this.outbox.markProcessing(task.id, tx);
        });
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
    const outboxes = await this.outbox.getExpiredProcessing();
    for (const task of outboxes) {
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

  private async processTask(task: IOutboxDataView) {
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
