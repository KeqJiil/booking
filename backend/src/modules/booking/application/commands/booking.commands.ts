import { IBookingEntityCreateProps } from '../../domain/entities/booking.entity';

export class CreateBookingCommand {
  constructor(public readonly data: IBookingEntityCreateProps) {}
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
