export interface ICreateSessionPayment {
  userId: string;
  bookingId: string;
  amount: number;
  idempotencyKey: string;
  customerId: string;
}

export interface IPaymentSessionResult {
  sessionId: string;
  paymentUrl: string;
}
