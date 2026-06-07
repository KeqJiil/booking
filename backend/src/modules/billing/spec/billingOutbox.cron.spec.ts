import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { getQueueToken } from '@nestjs/bullmq';
import type { Job } from 'bullmq';
import { Queue } from 'bullmq';
import { Logger } from 'nestjs-pino';
import { BillingRefundPending } from '../infrastructure/cron/billingOutbox.cron';
import { OutboxRepository } from 'src/infrastructure/repo/outbox/repo/outbox.repository';
import type { ITransactionRepo } from 'src/infrastructure/repo/transactions/interfaces/TransactionRepo.interface';
import {
  BILLING_OUTBOX_REPO,
  PRISMA_TRANSACTION_CLIENT,
} from 'src/common/constants/providerConstants';
import { PaymentId } from '../domain/typedId/paymentId';
import { PaymentIntendId } from '../domain/typedId/paymentIntend.id';
import type { IOutboxBillingViewData } from '../infrastructure/repository/billingOutbox.types';

const makeTask = (
  overrides: Partial<IOutboxBillingViewData> = {},
): IOutboxBillingViewData => ({
  id: 'outbox-1',
  type: 'REFUND_REQUEST',
  itemId: new PaymentId('payment-1'),
  payload: {
    paymentId: new PaymentId('payment-1'),
    paymentIntendId: new PaymentIntendId('pi_stripe_1'),
    idempotencyKey: 'idem-key',
  },
  status: 'PROCESSING',
  retries: 0,
  ...overrides,
});

describe('BillingRefundPending', () => {
  let cron: BillingRefundPending;
  let outbox: jest.Mocked<OutboxRepository<any, any, any>>;
  let transaction: jest.Mocked<ITransactionRepo>;
  let billingQueue: jest.Mocked<Queue>;
  let logger: { log: jest.Mock; error: jest.Mock };

  const mockTx = {} as any;

  beforeEach(async () => {
    logger = { log: jest.fn(), error: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingRefundPending,
        { provide: Logger, useValue: logger },
        {
          provide: BILLING_OUTBOX_REPO,
          useValue: createMock<OutboxRepository<any, any, any>>(),
        },
        {
          provide: PRISMA_TRANSACTION_CLIENT,
          useValue: createMock<ITransactionRepo>(),
        },
        { provide: getQueueToken('billing'), useValue: createMock<Queue>() },
      ],
    }).compile();

    cron = module.get(BillingRefundPending);
    outbox = module.get(BILLING_OUTBOX_REPO);
    transaction = module.get(PRISMA_TRANSACTION_CLIENT);
    billingQueue = module.get(getQueueToken('billing'));

    jest.clearAllMocks();
    transaction.startTransaction.mockImplementation(async (cb) => cb(mockTx));
  });

  describe('handlePendingOutboxed', () => {
    it('for each PENDING-task: markProcessing + add to queue', async () => {
      const tasks = [
        makeTask({ id: 'outbox-1' }),
        makeTask({ id: 'outbox-2' }),
      ];
      outbox.getOutbox.mockResolvedValue(tasks);

      await cron.handlePendingOutboxed();

      expect(outbox.getOutbox).toHaveBeenCalledWith('PENDING');
      expect(outbox.markProcessing).toHaveBeenCalledTimes(2);
      expect(billingQueue.add).toHaveBeenCalledTimes(2);
    });

    it('empty list → does nothing', async () => {
      outbox.getOutbox.mockResolvedValue([]);

      await cron.handlePendingOutboxed();

      expect(billingQueue.add).not.toHaveBeenCalled();
    });

    it('error on first task → logging, next task is handled', async () => {
      const tasks = [
        makeTask({ id: 'outbox-1' }),
        makeTask({ id: 'outbox-2' }),
      ];
      outbox.getOutbox.mockResolvedValue(tasks);

      transaction.startTransaction
        .mockRejectedValueOnce(new Error('DB error'))
        .mockImplementation(async (cb) => cb(mockTx));

      await cron.handlePendingOutboxed();

      expect(logger.error).toHaveBeenCalledTimes(1);
      expect(billingQueue.add).toHaveBeenCalledTimes(1);
    });

    it('add to queue with right data type', async () => {
      const task = makeTask();
      outbox.getOutbox.mockResolvedValue([task]);

      await cron.handlePendingOutboxed();

      expect(billingQueue.add).toHaveBeenCalledWith(
        expect.any(String),
        task,
        expect.objectContaining({ jobId: task.id, attempts: 5 }),
      );
    });
  });

  describe('handleProcessingOutboxes', () => {
    it('retries < 5 → markProcessing + incrementRetries + add to a queue', async () => {
      const task = makeTask({ retries: 2 });
      outbox.getExpiredProcessing.mockResolvedValue([task]);

      await cron.handleProcessingOutboxes();

      expect(outbox.markProcessing).toHaveBeenCalledWith(task.id, mockTx);
      expect(outbox.incrementRetries).toHaveBeenCalledWith(task.id, mockTx);
      expect(outbox.markFailed).not.toHaveBeenCalled();
      expect(billingQueue.add).toHaveBeenCalledTimes(1);
    });

    it('retries >= 5 → markFailed, is not in queue', async () => {
      const task = makeTask({ retries: 5 });
      outbox.getExpiredProcessing.mockResolvedValue([task]);

      await cron.handleProcessingOutboxes();

      expect(outbox.markFailed).toHaveBeenCalledWith(task.id, mockTx);
      expect(outbox.markProcessing).not.toHaveBeenCalled();
      expect(billingQueue.add).not.toHaveBeenCalled(); // ключевая проверка исправленного бага
    });

    it('mixed list: retryable go to queue, failed do not', async () => {
      const retryable = makeTask({ id: 'outbox-retry', retries: 1 });
      const failed = makeTask({ id: 'outbox-fail', retries: 5 });
      outbox.getExpiredProcessing.mockResolvedValue([retryable, failed]);

      await cron.handleProcessingOutboxes();

      expect(billingQueue.add).toHaveBeenCalledTimes(1);
      expect(billingQueue.add).toHaveBeenCalledWith(
        expect.any(String),
        retryable,
        expect.anything(),
      );
      expect(outbox.markFailed).toHaveBeenCalledWith(failed.id, mockTx);
    });

    it('empty list - does nothing', async () => {
      outbox.getExpiredProcessing.mockResolvedValue([]);

      await cron.handleProcessingOutboxes();

      expect(billingQueue.add).not.toHaveBeenCalled();
    });

    it('error during processTask → logging, else retryable keep handling', async () => {
      const task1 = makeTask({ id: 'outbox-1', retries: 0 });
      const task2 = makeTask({ id: 'outbox-2', retries: 0 });
      outbox.getExpiredProcessing.mockResolvedValue([task1, task2]);

      billingQueue.add
        .mockRejectedValueOnce(new Error('queue error'))
        .mockResolvedValue(undefined as unknown as Job);

      await cron.handleProcessingOutboxes();

      expect(logger.error).toHaveBeenCalledTimes(1);
      expect(billingQueue.add).toHaveBeenCalledTimes(2);
    });
  });
});
