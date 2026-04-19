import { TBookingStatus } from 'src/common/constants/bookingStatuses';
import { IBookingEntityCreateProps } from '../../domain/entities/booking.entity';

export class CreateBookingCommand {
  constructor(public readonly data: IBookingEntityCreateProps) {}
}

export class ChangeBookingStatusCommand {
  constructor(
    public readonly id: string,
    public readonly status: TBookingStatus,
  ) {}
}
