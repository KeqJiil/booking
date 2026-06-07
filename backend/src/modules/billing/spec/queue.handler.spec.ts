import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { Job } from 'bullmq';
import { BillingQueueHandler } from '../infrastructure/queueHandlers/queue.handler';
import type { IPaymentService } from 'src/infrastructure/payments/interfaces/paymentService.interface';
import { OutboxRepository } from 'src/infrastructure/repo/outbox/repo/outbox.repository';
import type { ITransactionRepo } from 'src/infrastructure/repo/transactions/interfaces/TransactionRepo.interface';
import {
  BILLING_OUTBOX_REPO,
  PRISMA_TRANSACTION_CLIENT,
  STRIPE_PAYMENT_CLIENT,
} from 'src/common/constants/providerConstants';
import { PaymentId } from '../domain/typedId/paymentId';
import { PaymentIntendId } from '../domain/typedId/paymentIntend.id';
import type { IOutboxBillingViewData } from '../infrastructure/repository/billingOutbox.types';
import { IOutboxDataView } from '../../../infrastructure/repo/outbox/interfaces/outbox.interface';

describe('BillingQueueHandler', () => {
  let handler: BillingQueueHandler;
  let paymentService: jest.Mocked<IPaymentService>;
  let outbox: jest.Mocked<OutboxRepository<any, any, any>>;
  let transaction: jest.Mocked<ITransactionRepo>;

  const mockTx = {} as any;

  const refundJob: IOutboxBillingViewData = {
    id: 'outbox-1',
    type: 'REFUND_REQUEST',
    itemId: new PaymentId('payment-uuid-local'),
    payload: {
      paymentId: new PaymentId('payment-uuid-local'),
      paymentIntendId: new PaymentIntendId('pi_stripe_real_id'),
      idempotencyKey: 'idem-key',
    },
    status: 'PROCESSING',
    retries: 0,
  };

  const makeJob = (data: object) => ({ data }) as Job;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingQueueHandler,
        {
          provide: STRIPE_PAYMENT_CLIENT,
          useValue: createMock<IPaymentService>(),
        },
        {
          provide: BILLING_OUTBOX_REPO,
          useValue: createMock<OutboxRepository<any, any, any>>(),
        },
        {
          provide: PRISMA_TRANSACTION_CLIENT,
          useValue: createMock<ITransactionRepo>(),
        },
      ],
    }).compile();

    handler = module.get(BillingQueueHandler);
    paymentService = module.get(STRIPE_PAYMENT_CLIENT);
    outbox = module.get(BILLING_OUTBOX_REPO);
    transaction = module.get(PRISMA_TRANSACTION_CLIENT);

    jest.clearAllMocks();
    transaction.startTransaction.mockImplementation(async (cb) => cb(mockTx));
  });

  describe('REFUND_REQUEST', () => {
    it('handleRefund is called with payload.paymentIntendId, not with itemId', async () => {
      paymentService.handleRefund.mockResolvedValue(undefined);
      outbox.markSucceeded.mockResolvedValue(
        undefined as unknown as IOutboxDataView<any, any, any>,
      );

      await handler.process(makeJob(refundJob));

      expect(paymentService.handleRefund).toHaveBeenCalledWith(
        refundJob.payload.paymentIntendId.toString(),
        refundJob.id,
      );
      expect(paymentService.handleRefund).not.toHaveBeenCalledWith(
        refundJob.itemId.toString(),
        expect.anything(),
      );
    });

    it('after handleRefund outbox.markSucceeded is called with outbox id', async () => {
      paymentService.handleRefund.mockResolvedValue(undefined);
      outbox.markSucceeded.mockResolvedValue(
        undefined as unknown as IOutboxDataView<any, any, any>,
      );

      await handler.process(makeJob(refundJob));

      expect(outbox.markSucceeded).toHaveBeenCalledWith(refundJob.id, mockTx);
    });

    it('handleRefund → markSucceeded handled in a row', async () => {
      const callOrder: string[] = [];
      paymentService.handleRefund.mockImplementation(() => {
        callOrder.push('refund');
        return Promise.resolve();
      });
      outbox.markSucceeded.mockImplementation(() => {
        callOrder.push('markSucceeded');
        return undefined as any;
      });

      await handler.process(makeJob(refundJob));

      expect(callOrder).toEqual(['refund', 'markSucceeded']);
    });

    it('idempotency key for handleRefund — it is outbox.id, not paymentId', async () => {
      paymentService.handleRefund.mockResolvedValue(undefined);
      outbox.markSucceeded.mockResolvedValue(
        undefined as unknown as IOutboxDataView<any, any, any>,
      );

      await handler.process(makeJob(refundJob));

      const [, idempotencyArg] = paymentService.handleRefund.mock.calls[0];
      expect(idempotencyArg).toBe(refundJob.id);
    });
  });
});
