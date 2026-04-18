import { TBookingStatus } from 'src/common/constants/bookingStatuses';

export interface IBookingDbData {
  priceAtMoment: number;
  days: number;
  propertyId: string;
  userId: string;
  startDate: Date;
  endDate: Date;
  status: TBookingStatus;
  id: string;
  totalPrice: number;
}

export interface IBookingEntityCreateProps {
  priceAtMoment: number;
  days: number;
  propertyId: string;
  userId: string;
  startDate: Date;
  endDate: Date;
}

export interface IBookingEntityData extends IBookingEntityCreateProps {
  totalPrice: number;
}

export class BookingEntity {
  constructor(
    private _status: TBookingStatus,
    private _bookingData: IBookingEntityData,
  ) {}

  static create(rawData: IBookingEntityCreateProps) {}

  static fromDB(rawData: IBookingDbData) {}

  public pay() {}

  public reject() {}

  public cancel() {}

  public expire() {}

  public confirm() {}

  public complete() {}

  get status() {
    return this._status;
  }

  get data() {
    return this._bookingData;
  }
}
