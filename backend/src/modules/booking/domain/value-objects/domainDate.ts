import { differenceInCalendarDays, isBefore, isEqual } from 'date-fns';
import { WrongInputDataError } from 'src/common/exceptions/entityDomain.exceptions';
export class BookingDate {
  public readonly days: number;

  constructor(
    public readonly startDate: Date,
    public readonly endDate: Date,
  ) {
    if (isBefore(endDate, startDate) || isEqual(startDate, endDate))
      throw new WrongInputDataError('Conflict dates were choosed');
    this.days = differenceInCalendarDays(endDate, startDate);
  }
}
