export const eventNames = {
  forgot_password: 'forgot_password',
  accound_need_confirmation: 'accound_need_confirmation',
  account_created: 'account_created',
  password_changed: 'password_changed',
  new_role_received: 'new_role_received',
  property_created: 'property_created',
  property_changed: 'property_changed',
  property_deleted: 'property_deleted',
  able_to_leave_review: 'able_to_leave_review',
  new_review_received: 'new_review_received',
  new_review_created: 'new_review_created',
  review_edited: 'review_edited',
  booking_created: 'booking_created',
  booking_paid: 'booking_paid',
  booking_expired: 'booking_expired',
  booking_rejected: 'booking_rejected',
  booking_cancelled: 'booking_cancelled',
  booking_confirmed: 'booking_confirmed',
  booking_completed: 'booking_completed',
  chat_created: 'chat_created',
} as const;

export const eventBookingMap: Record<string, keyof typeof eventNames> = {
  PAID: 'booking_paid',
  EXPIRED: 'booking_expired',
  REJECTED: 'booking_rejected',
  CANCELLED: 'booking_cancelled',
  CONFIRMED: 'booking_confirmed',
  COMPLETED: 'booking_completed',
};

export type IEventNames = (typeof eventNames)[keyof typeof eventNames];
