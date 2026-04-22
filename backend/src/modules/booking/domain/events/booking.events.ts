import { TBookingStatus } from 'src/common/constants/bookingStatuses';

export class BookingStatusChanges {
  constructor(
    public readonly oldStatus: TBookingStatus,
    public readonly newStatus: TBookingStatus,
  ) {}
}

export class BookingCreated {
  constructor(
    public readonly propertyId: string,
    public readonly userId: string,
    public readonly startDate: Date,
    public readonly endDate: Date,
  ) {}
}

export class BookingCompletedStatus {
  constructor(
    public readonly userId: string,
    public readonly propertyId: string,
    public readonly bookingId: string,
  ) {}
}
