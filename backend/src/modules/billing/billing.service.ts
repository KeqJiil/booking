import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
import {
  BILLING_OUTBOX_REPO,
  PRISMA_TRANSACTION_CLIENT,
  STRIPE_PAYMENT_CLIENT,
} from 'src/common/constants/providerConstants';
import { OutboxRepository } from '../../infrastructure/repo/outbox/repo/outbox.repository';
import {
  IBillingOutboxTypes,
  IOutboxBillingPayload,
} from './infrastructure/repository/billingOutbox.types';
import { PaymentId } from './domain/typedId/paymentId';
import { PaymentIntendId } from './domain/typedId/paymentIntend.id';

@Injectable()
export class BillingService {
  constructor(
    @Inject(STRIPE_PAYMENT_CLIENT) private paymentService: IPaymentService,
    @Inject('BILLING_REPOSITORY') private billingRepo: IBillingRepo,
    @Inject(BILLING_OUTBOX_REPO)
    private outbox: OutboxRepository<
      IBillingOutboxTypes,
      IOutboxBillingPayload,
      PaymentId
    >,
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

  async getUserId(userId: string) {
    const data = await this.paymentService.getUser(userId);
    if (!data) throw new NotFoundException();
    return data;
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

  async failPayment(paymentId: string) {
    await this.transaction.startTransaction(async (tx: Tx) => {
      await this.billingRepo.paymentFail(paymentId, tx);
    });
  }

  async successPayment(paymentId: string, providerAccountId: string) {
    await this.transaction.startTransaction(async (tx: Tx) => {
      await this.billingRepo.paymentSuccess(paymentId, providerAccountId, tx);
    });
  }

  async refundPayment(
    userId: string,
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
      if (data.userId !== userId) throw new ForbiddenException();
      const refundData = await this.billingRepo.paymentRefund(paymentId, tx);
      const paymentTypedId = new PaymentId(paymentId);
      const paymentIntendId = new PaymentIntendId(providerPaymentId);
      await this.outbox.createOutbox(
        {
          type: 'REFUND_REQUEST',
          itemId: paymentTypedId,
          status: 'PENDING',
          retries: 0,
          payload: {
            paymentIntendId,
            idempotencyKey,
            paymentId: paymentTypedId,
          },
        },
        tx,
      );
      await this.idempotency.complete(idempotencyKey, tx, refundData, 200);
    });
  }
}
