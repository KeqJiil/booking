import { TBookingStatus } from 'src/common/constants/bookingStatuses';

export class BookingStatusChanges {
  constructor(
    public readonly oldStatus: TBookingStatus,
    public readonly newStatus: TBookingStatus,
    public readonly userId: string,
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

export class BookingConfirmStatus {
  constructor(
    public readonly userId: string,
    public readonly hostId: string,
    public readonly bookingId: string,
    public readonly name: string,
  ) {}
}
