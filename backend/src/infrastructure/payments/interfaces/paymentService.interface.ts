import {
  ICreateSessionPayment,
  IPaymentSessionResult,
} from './createSession.interface';

export interface IPaymentService {
  createSession(data: ICreateSessionPayment): Promise<IPaymentSessionResult>;
  verifyWebhook(rawBody: Buffer | string, signature: string): unknown;
  handleRefund(paymentId: string, idempotencyKey: string): Promise<void>;
  createUser(email: string, userId: string): Promise<string>;
  getUser(email: string): Promise<string | null>;
}
