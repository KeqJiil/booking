export interface IPaymentMetadata {
  bookingId: string;
  userId: string;
}

export interface IJobWebhookData {
  userId: string;
  bookingId: string;
  paymentIntentId: string;
}
