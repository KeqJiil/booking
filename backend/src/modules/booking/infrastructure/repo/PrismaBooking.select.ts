import { Prisma } from '@prisma/client';

export const bookingSelect = Prisma.validator<Prisma.BookingSelect>()({
  id: true,
  amountDue: true,
  days: true,
  priceAtMoment: true,
  status: true,
  userId: true,
  propertyId: true,
  startDate: true,
  endDate: true,
});
