import {
  ICreateSessionPayment,
  IPaymentSessionResult,
} from './createSession.interface';

export interface IPaymentService {
  createSession(data: ICreateSessionPayment): Promise<IPaymentSessionResult>;
  verifyWebhook(rawBody: Buffer | string, signature: string): unknown;
  handleRefund(paymentId: string, amount: number): Promise<void>;
  createUser(
    email: string,
    userId: string,
    idempotencyKey: string,
  ): Promise<string>;
}
