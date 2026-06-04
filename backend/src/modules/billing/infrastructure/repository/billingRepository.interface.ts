export interface IPaymentData {
  userId: string;
  bookingId: string;
  amount: number;
  providerPaymentId?: string;
}

export interface IPaymentView {
  userId: string;
  bookingId: string;
  amount: number;
  currency: string;
  id: string;
}

export interface IBillingRepo {
  getUserPayments(userId: string, tx?: unknown): Promise<IPaymentView[]>;
  getPaymentById(id: string, tx?: unknown): Promise<IPaymentView | null>;
  createPayment(paymentData: IPaymentData, tx?: unknown): Promise<string>;
  paymentSuccess(
    paymentId: string,
    providerPaymentId: string,
    tx?: unknown,
  ): Promise<IPaymentData>;
  paymentFail(paymentId: string, tx?: unknown): Promise<IPaymentData>;
  paymentRefund(paymentId: string, tx?: unknown): Promise<IPaymentData>;
}

export interface IPaymentDbData {
  id: string;
  status: 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'REFUNDED';
  amount: number;
  currency: 'usd';
  providerPaymentId: string | null;
  updatedAt: Date;
  createdAt: Date;
  userId: string;
  bookingId: string;
}
