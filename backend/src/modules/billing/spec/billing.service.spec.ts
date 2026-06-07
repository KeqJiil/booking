import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { BillingService } from '../billing.service';
import type { IPaymentService } from 'src/infrastructure/payments/interfaces/paymentService.interface';
import type {
  IBillingRepo,
  IPaymentData,
} from '../infrastructure/repository/billingRepository.interface';
import { UserService } from 'src/modules/user/user.service';
import { IdempotencyService } from 'src/modules/idempotency/idempotency.service';
import type { ITransactionRepo } from 'src/infrastructure/repo/transactions/interfaces/TransactionRepo.interface';
import { BookingProviderAdapter } from '../infrastructure/adapters/booking.adapter';
import { OutboxRepository } from 'src/infrastructure/repo/outbox/repo/outbox.repository';
import {
  BILLING_OUTBOX_REPO,
  PRISMA_TRANSACTION_CLIENT,
  STRIPE_PAYMENT_CLIENT,
} from 'src/common/constants/providerConstants';
import { IOutboxDataView } from '../../../infrastructure/repo/outbox/interfaces/outbox.interface';

describe('BillingService', () => {
  let service: BillingService;
  let paymentService: jest.Mocked<IPaymentService>;
  let billingRepo: jest.Mocked<IBillingRepo>;
  let outbox: jest.Mocked<OutboxRepository<any, any, any>>;
  let userService: jest.Mocked<UserService>;
  let idempotency: jest.Mocked<IdempotencyService>;
  let transaction: jest.Mocked<ITransactionRepo>;
  let bookingAdapter: jest.Mocked<BookingProviderAdapter>;

  const mockTx = {} as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingService,
        {
          provide: STRIPE_PAYMENT_CLIENT,
          useValue: createMock<IPaymentService>(),
        },
        { provide: 'BILLING_REPOSITORY', useValue: createMock<IBillingRepo>() },
        {
          provide: BILLING_OUTBOX_REPO,
          useValue: createMock<OutboxRepository<any, any, any>>(),
        },
        { provide: UserService, useValue: createMock<UserService>() },
        {
          provide: IdempotencyService,
          useValue: createMock<IdempotencyService>(),
        },
        {
          provide: PRISMA_TRANSACTION_CLIENT,
          useValue: createMock<ITransactionRepo>(),
        },
        {
          provide: BookingProviderAdapter,
          useValue: createMock<BookingProviderAdapter>(),
        },
      ],
    }).compile();

    service = module.get(BillingService);
    paymentService = module.get(STRIPE_PAYMENT_CLIENT);
    billingRepo = module.get('BILLING_REPOSITORY');
    outbox = module.get(BILLING_OUTBOX_REPO);
    userService = module.get(UserService);
    idempotency = module.get(IdempotencyService);
    transaction = module.get(PRISMA_TRANSACTION_CLIENT);
    bookingAdapter = module.get(BookingProviderAdapter);

    jest.clearAllMocks();
    transaction.startTransaction.mockImplementation(async (cb) => cb(mockTx));
  });

  describe('getPaymentById', () => {
    it('payment was not found → NotFoundException', async () => {
      billingRepo.getPaymentById.mockResolvedValue(null);
      await expect(
        service.getPaymentById('user-1', 'payment-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('payment.userId !== userId → NotFoundException', async () => {
      billingRepo.getPaymentById.mockResolvedValue({
        id: 'p1',
        userId: 'other-user',
        amount: 100,
        bookingId: 'b1',
        currency: 'usd',
      });
      await expect(service.getPaymentById('user-1', 'p1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('happy path → returns payment', async () => {
      const payment = {
        id: 'p1',
        userId: 'user-1',
        amount: 100,
        bookingId: 'b1',
        currency: 'usd',
      };
      billingRepo.getPaymentById.mockResolvedValue(payment);
      const result = await service.getPaymentById('user-1', 'p1');
      expect(result).toEqual(payment);
    });
  });

  describe('createPaymentAccount', () => {
    it('happy path → creates account and bind in to user', async () => {
      paymentService.createUser.mockResolvedValue('stripe-acc-id');
      idempotency.createOrGet.mockResolvedValue({
        id: 'idem-1',
        isDuplicate: false,
      });
      userService.addPaymentAccount.mockResolvedValue(undefined);
      idempotency.complete.mockResolvedValue(undefined);

      const result = await service.createPaymentAccount(
        'email@test.com',
        'user-1',
        'idem-key',
      );

      expect(paymentService.createUser).toHaveBeenCalledWith(
        'email@test.com',
        'user-1',
      );
      expect(userService.addPaymentAccount).toHaveBeenCalledWith(
        'user-1',
        'stripe-acc-id',
        mockTx,
      );
      expect(result).toBe('stripe-acc-id');
    });

    it('isDuplicate → addPaymentAccount and complete was not called', async () => {
      paymentService.createUser.mockResolvedValue('stripe-acc-id');
      idempotency.createOrGet.mockResolvedValue({
        response: { cached: true },
        isDuplicate: true,
      });

      await service.createPaymentAccount(
        'email@test.com',
        'user-1',
        'idem-key',
      );

      expect(userService.addPaymentAccount).not.toHaveBeenCalled();
      expect(idempotency.complete).not.toHaveBeenCalled();
    });
  });

  describe('createPayment', () => {
    it('happy path → create Stripe session and db record', async () => {
      bookingAdapter.getData.mockResolvedValue({ amount: 500 });
      paymentService.createSession.mockResolvedValue({
        sessionId: 'sess-1',
        paymentUrl: 'https://stripe.com/pay',
      });
      idempotency.createOrGet.mockResolvedValue({
        id: 'idem-1',
        isDuplicate: false,
      });
      billingRepo.createPayment.mockResolvedValue('db-payment-1');
      idempotency.complete.mockResolvedValue(undefined);

      const result = await service.createPayment(
        'booking-1',
        'user-1',
        'stripe-cus-1',
        'idem-key',
      );

      expect(bookingAdapter.getData).toHaveBeenCalledWith('booking-1');
      expect(paymentService.createSession).toHaveBeenCalledWith({
        amount: 500,
        customerId: 'stripe-cus-1',
        bookingId: 'booking-1',
        userId: 'user-1',
        idempotencyKey: 'idem-key',
      });
      expect(billingRepo.createPayment).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          bookingId: 'booking-1',
          amount: 500,
        }),
        mockTx,
      );
      expect(result).toEqual({
        sessionId: 'sess-1',
        paymentUrl: 'https://stripe.com/pay',
      });
    });

    it('isDuplicate → billingRepo.createPayment was not called, Stripe session is created', async () => {
      bookingAdapter.getData.mockResolvedValue({ amount: 500 });
      paymentService.createSession.mockResolvedValue({
        sessionId: 'sess-1',
        paymentUrl: 'stripe-url',
      });
      idempotency.createOrGet.mockResolvedValue({
        response: { cached: true },
        isDuplicate: true,
      });

      await service.createPayment(
        'booking-1',
        'user-1',
        'stripe-cus-1',
        'idem-key',
      );

      expect(paymentService.createSession).toHaveBeenCalled();
      expect(billingRepo.createPayment).not.toHaveBeenCalled();
    });
  });

  describe('failPayment', () => {
    it('calls billingRepo.paymentFail(bookingId) inside tx', async () => {
      billingRepo.paymentFail.mockResolvedValue({} as unknown as IPaymentData);

      await service.failPayment('booking-1');

      expect(billingRepo.paymentFail).toHaveBeenCalledWith('booking-1', mockTx);
      expect(transaction.startTransaction).toHaveBeenCalledTimes(1);
    });
  });

  describe('successPayment', () => {
    it('calls billingRepo.paymentSuccess(bookingId, providerAccountId) inside tx', async () => {
      billingRepo.paymentSuccess.mockResolvedValue(
        {} as unknown as IPaymentData,
      );

      await service.successPayment('booking-1', 'pi_stripe_123');

      expect(billingRepo.paymentSuccess).toHaveBeenCalledWith(
        'booking-1',
        'pi_stripe_123',
        mockTx,
      );
    });
  });

  describe('refundPayment', () => {
    const payment = {
      id: 'p1',
      userId: 'user-1',
      amount: 100,
      bookingId: 'b1',
      currency: 'usd',
    };

    beforeEach(() => {
      idempotency.createOrGet.mockResolvedValue({
        id: 'idem-1',
        isDuplicate: false,
      });
    });

    it('happy path → paymentRefund and createOutbox called', async () => {
      billingRepo.getPaymentById.mockResolvedValue(payment);
      billingRepo.paymentRefund.mockResolvedValue(
        {} as unknown as IPaymentData,
      );
      outbox.createOutbox.mockResolvedValue(
        undefined as unknown as IOutboxDataView<any, any, any>,
      );
      idempotency.complete.mockResolvedValue(undefined);

      await service.refundPayment('user-1', 'p1', 'pi_stripe_1', 'idem-key');

      expect(billingRepo.paymentRefund).toHaveBeenCalledWith('p1', mockTx);
      expect(outbox.createOutbox).toHaveBeenCalledTimes(1);
      expect(outbox.createOutbox).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'REFUND_REQUEST', status: 'PENDING' }),
        mockTx,
      );
      expect(idempotency.complete).toHaveBeenCalled();
    });

    it('outbox payload contains right PaymentId and PaymentIntendId', async () => {
      billingRepo.getPaymentById.mockResolvedValue(payment);
      billingRepo.paymentRefund.mockResolvedValue(
        {} as unknown as IPaymentData,
      );
      outbox.createOutbox.mockResolvedValue(
        undefined as unknown as IOutboxDataView<any, any, any>,
      );

      await service.refundPayment(
        'user-1',
        'payment-abc',
        'pi_stripe_xyz',
        'idem-key',
      );

      const outboxArg = outbox.createOutbox.mock.calls[0][0];
      expect(outboxArg.payload.paymentId.toString()).toBe('payment-abc');
      expect(outboxArg.payload.paymentIntendId.toString()).toBe(
        'pi_stripe_xyz',
      );
    });

    it('payment was not found → NotFoundException, outbox was not called', async () => {
      billingRepo.getPaymentById.mockResolvedValue(null);

      await expect(
        service.refundPayment('user-1', 'p1', 'pi_1', 'idem-key'),
      ).rejects.toThrow(NotFoundException);
      expect(outbox.createOutbox).not.toHaveBeenCalled();
    });

    it('payment.userId !== userId → ForbiddenException, paymentRefund и outbox were not called', async () => {
      billingRepo.getPaymentById.mockResolvedValue({
        ...payment,
        userId: 'other-user',
      });

      await expect(
        service.refundPayment('user-1', 'p1', 'pi_1', 'idem-key'),
      ).rejects.toThrow(ForbiddenException);
      expect(billingRepo.paymentRefund).not.toHaveBeenCalled();
      expect(outbox.createOutbox).not.toHaveBeenCalled();
    });

    it('isDuplicate → early return, all repo methods were not called', async () => {
      idempotency.createOrGet.mockResolvedValue({
        response: { cached: true },
        isDuplicate: true,
      });

      await service.refundPayment('user-1', 'p1', 'pi_1', 'idem-key');

      expect(billingRepo.getPaymentById).not.toHaveBeenCalled();
      expect(billingRepo.paymentRefund).not.toHaveBeenCalled();
      expect(outbox.createOutbox).not.toHaveBeenCalled();
    });
  });
});
