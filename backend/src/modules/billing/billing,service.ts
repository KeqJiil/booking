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

@Injectable()
export class BillingService {
  constructor(
    @Inject('PAYMENT_SERVICE') private paymentService: IPaymentService,
    @Inject('BILLING_REPOSITORY') private billingRepo: IBillingRepo,
    private readonly userService: UserService,
    private readonly idempotency: IdempotencyService,
    private readonly transaction: ITransactionRepo,
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
    amount: number,
    clientId: string,
    idempotencyKey: string,
  ) {
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
}
