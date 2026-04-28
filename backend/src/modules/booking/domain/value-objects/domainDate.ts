import { BadRequestException } from '@nestjs/common';
import { differenceInCalendarDays, isBefore, isEqual } from 'date-fns';
export class BookingDate {
  public readonly days: number;

  constructor(
    public readonly startDate: Date,
    public readonly endDate: Date,
  ) {
    if (isBefore(endDate, startDate) || isEqual(startDate, endDate))
      throw new BadRequestException('Wrong dates');
    this.days = differenceInCalendarDays(endDate, startDate);
  }
}
