import { Injectable } from '@nestjs/common';
import {
  IBillingRepo,
  IPaymentData,
  IPaymentDbData,
  IPaymentView,
} from './billingRepository.interface';
import { Tx } from 'src/infrastructure/repo/transactions/interfaces/TransactionRepo.interface';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class BillingRepository implements IBillingRepo {
  constructor(private readonly prisma: PrismaService) {}

  private getDb(tx?: unknown) {
    return (tx ? tx : this.prisma) as Tx;
  }

  private getDataType(data: IPaymentDbData) {
    return {
      bookingId: data.bookingId,
      providerPaymentId: data.providerPaymentId!,
      userId: data.userId,
      amount: data.amount,
    };
  }

  private getViewType(data: IPaymentDbData) {
    return {
      userId: data.userId,
      bookingId: data.bookingId,
      amount: data.amount,
      currency: data.currency,
      id: data.id,
    };
  }

  async getUserPayments(userId: string): Promise<IPaymentView[]> {
    const data = await this.prisma.payment.findMany({ where: { userId } });
    return data.map((el) => this.getViewType(el));
  }

  async getPaymentById(id: string): Promise<IPaymentView | null> {
    const data = await this.prisma.payment.findUnique({ where: { id } });
    if (!data) return null;
    return this.getViewType(data);
  }

  async createPayment(paymentData: IPaymentData, tx: Tx): Promise<string> {
    const data = await tx.payment.create({
      data: {
        userId: paymentData.userId,
        amount: paymentData.amount,
        bookingId: paymentData.bookingId,
      },
    });
    return data.id;
  }

  async paymentSuccess(
    bookingId: string,
    providerPaymentId: string,
    tx?: Tx,
  ): Promise<IPaymentData> {
    const db = this.getDb(tx);
    const data = await db.payment.update({
      where: { bookingId },
      data: {
        providerPaymentId,
        status: 'SUCCEEDED',
      },
    });
    return this.getDataType(data);
  }

  async paymentFail(bookingId: string, tx?: Tx): Promise<IPaymentData> {
    const db = this.getDb(tx);
    const data = await db.payment.update({
      where: { bookingId },
      data: { status: 'FAILED' },
    });
    return this.getDataType(data);
  }

  async paymentRefund(bookingId: string, tx: Tx): Promise<IPaymentData> {
    const data = await tx.payment.update({
      where: { bookingId },
      data: { status: 'REFUNDED' },
    });
    return this.getDataType(data);
  }
}
