import { PaymentId } from '../../domain/typedId/paymentId';
import { PaymentIntendId } from '../../domain/typedId/paymentIntend.id';
import { IOutboxDataView } from '../../../../infrastructure/repo/outbox/interfaces/outbox.interface';

export interface IOutboxBillingPayload {
  paymentId: PaymentId;
  paymentIntendId: PaymentIntendId;
  idempotencyKey: string;
}

export const BillingOutboxTypes = {
  REFUND_REQUEST: 'REFUND_REQUEST',
} as const;

export type IBillingOutboxTypes =
  (typeof BillingOutboxTypes)[keyof typeof BillingOutboxTypes];

export type IOutboxBillingViewData = IOutboxDataView<
  IBillingOutboxTypes,
  IOutboxBillingPayload,
  PaymentId
>;
