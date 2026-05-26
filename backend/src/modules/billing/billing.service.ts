import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IPaymentService } from 'src/infrastructure/payments/interfaces/paymentService.interface';
import type {
  IBillingRepo,
  IPaymentData,
} from './infrastructure/repository/billingRepository.interface';
import { UserService } from '../user/user.service';
import { IdempotencyService } from '../idempotency/idempotency.service';
import type {
  ITransactionRepo,
  Tx,
} from 'src/infrastructure/repo/transactions/interfaces/TransactionRepo.interface';
import { BookingProviderAdapter } from './infrastructure/adapters/booking.adapter';
import type { IOutboxRepository } from 'src/infrastructure/repo/outbox/interfaces/outbox.interface';
import {
  PRISMA_TRANSACTION_CLIENT,
  STRIPE_PAYMENT_CLIENT,
} from 'src/common/constants/providerConstants';

@Injectable()
export class BillingService {
  constructor(
    @Inject(STRIPE_PAYMENT_CLIENT) private paymentService: IPaymentService,
    @Inject('BILLING_REPOSITORY') private billingRepo: IBillingRepo,
    @Inject('OUTBOX_SERVICE') private outbox: IOutboxRepository<Tx>,
    private readonly userService: UserService,
    private readonly idempotency: IdempotencyService,
    @Inject(PRISMA_TRANSACTION_CLIENT)
    private readonly transaction: ITransactionRepo,
    private readonly bookingAdapter: BookingProviderAdapter,
  ) {}

  async getPayments(userId: string) {
    return await this.billingRepo.getUserPayments(userId);
  }

  async getPaymentById(userId: string, id: string) {
    const payment = await this.billingRepo.getPaymentById(id);
    if (!payment || payment?.userId !== userId) throw new NotFoundException();
    return payment;
  }

  async createPaymentAccount(
    email: string,
    userId: string,
    idempotencyKey: string,
  ) {
    const paymentAccId = await this.paymentService.createUser(email, userId);
    await this.transaction.startTransaction(async (tx: Tx) => {
      const idempotencyId = await this.idempotency.createOrGet(
        idempotencyKey,
        tx,
        userId,
      );
      if (idempotencyId?.isDuplicate) return idempotencyId.response;
      await this.userService.addPaymentAccount(userId, paymentAccId, tx);
      await this.idempotency.complete(idempotencyKey, tx, idempotencyId, 200);
    });
    return paymentAccId;
  }

  async createPayment(
    bookingId: string,
    userId: string,
    clientId: string,
    idempotencyKey: string,
  ) {
    const { amount } = await this.bookingAdapter.getData(bookingId);
    const payment = await this.paymentService.createSession({
      amount,
      customerId: clientId,
      bookingId,
      userId,
      idempotencyKey,
    });
    await this.transaction.startTransaction(async (tx: Tx) => {
      const idempotencyId = await this.idempotency.createOrGet(
        idempotencyKey,
        tx,
        userId,
      );
      if (idempotencyId?.isDuplicate) return idempotencyId.response;
      const paymentData: IPaymentData = {
        userId,
        bookingId,
        providerPaymentId: clientId,
        amount,
      };
      const paymentDb = await this.billingRepo.createPayment(paymentData, tx);
      await this.idempotency.complete(idempotencyKey, tx, paymentDb, 200);
    });
    return payment;
  }

  async failPayment(bookingId: string) {
    await this.transaction.startTransaction(async (tx: Tx) => {
      await this.billingRepo.paymentFail(bookingId, tx);
    });
  }

  async successPayment(bookingId: string, providerAccountId: string) {
    await this.transaction.startTransaction(async (tx: Tx) => {
      await this.billingRepo.paymentSuccess(bookingId, providerAccountId, tx);
    });
  }

  async refundPayment(
    userId: string,
    bookingId: string,
    paymentId: string,
    providerPaymentId: string,
    idempotencyKey: string,
  ) {
    await this.transaction.startTransaction(async (tx: Tx) => {
      const idempotencyId = await this.idempotency.createOrGet(
        idempotencyKey,
        tx,
        userId,
      );
      if (idempotencyId.isDuplicate) return idempotencyId.response;
      const data = await this.billingRepo.getPaymentById(paymentId, tx);
      if (!data) throw new NotFoundException();
      const refundData = await this.billingRepo.paymentRefund(bookingId, tx);
      await this.outbox.createOutbox(
        {
          type: 'REFUND_REQUEST',
          itemId: paymentId,
          status: 'PENDING',
          retries: 0,
          payload: {
            providerPaymentId,
            idempotencyKey,
            bookingId,
          },
        },
        tx,
      );
      await this.idempotency.complete(idempotencyKey, tx, refundData, 200);
    });
  }
}
