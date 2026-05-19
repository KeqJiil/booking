export const paymentConsts = {
  payment_failed: 'payment_failed',
  payment_success: 'payment_success',
} as const;

export type IPaymentConsts = (typeof paymentConsts)[keyof typeof paymentConsts];
