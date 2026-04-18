export const bookingStatuses = {
  PENDING: 'PENDING',
  PAID: 'PAID',

  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED',
  REJECTED: 'REJECTED',

  CONFIRMED: 'CONFIRMED',
  COMPLETED: 'COMPLETED',
} as const;

export type TBookingStatus =
  (typeof bookingStatuses)[keyof typeof bookingStatuses];
