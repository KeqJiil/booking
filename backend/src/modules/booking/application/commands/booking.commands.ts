import { IBookingEntryData } from '../../domain/entities/booking.entity';

export class CreateBookingCommand {
  constructor(
    public readonly data: IBookingEntryData,
    public readonly idempotencyKey: string,
  ) {}
}

export class CancelBookingStatusCommand {
  constructor(
    public readonly userId: string,
    public readonly bookingId: string,
  ) {}
}

export class PayBookingStatusCommand {
  constructor(
    public readonly userId: string,
    public readonly bookingId: string,
  ) {}
}

export class RejectBookingStatusCommand {
  constructor(
    public readonly hostId: string,
    public readonly bookingId: string,
  ) {}
}

export class ConfirmBookingStatusCommand {
  constructor(
    public readonly hostId: string,
    public readonly bookingId: string,
  ) {}
}

export class CompleteBookingStatusCommand {
  constructor(public readonly idsArr: { id: string }[]) {}
}

export class ExpireBookingStatusCommand {
  constructor(public readonly id: string) {}
}
