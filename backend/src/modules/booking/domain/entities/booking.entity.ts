import { randomUUID } from 'crypto';
import {
  badStatuses,
  TBookingStatus,
} from 'src/common/constants/bookingStatuses';
import {
  BookingCompletedStatus,
  BookingConfirmStatus,
  BookingCreated,
  BookingStatusChanges,
} from '../events/booking.events';
import { AggregateRoot } from '@nestjs/cqrs';
import { BookingDate } from '../value-objects/domainDate';

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
  hostId: string;
}

export interface IBookingEntityCreateProps {
  priceAtMoment: number;
  propertyId: string;
  userId: string;
  startDate: Date;
  endDate: Date;
  hostId: string;
}

export interface IBookingEntity {
  priceAtMoment: number;
  hostId: string;
  propertyId: string;
  userId: string;
  dateData: BookingDate;
}

export interface IBookingEntityData extends IBookingEntity {
  totalPrice: number;
}

export class BookingEntity extends AggregateRoot {
  constructor(
    private _status: TBookingStatus,
    private _bookingData: IBookingEntityData,
    private readonly _id: string,
  ) {
    super();
  }

  static create(rawData: IBookingEntityCreateProps) {
    const dateData = new BookingDate(rawData.startDate, rawData.endDate);
    const totalPrice = dateData.days * rawData.priceAtMoment;
    const entity = new BookingEntity(
      'PENDING',
      { ...rawData, totalPrice, dateData },
      randomUUID(),
    );
    entity.apply(
      new BookingCreated(
        rawData.propertyId,
        rawData.userId,
        rawData.startDate,
        rawData.endDate,
      ),
    );
    return entity;
  }

  static fromDB(rawData: IBookingDbData) {
    const { status, id, ...data } = rawData;
    if (badStatuses[status]) {
      throw new Error('Wrong data type');
    }
    const dateData = new BookingDate(data.startDate, data.endDate);
    return new BookingEntity(status, { ...data, dateData }, id);
  }

  public pay() {
    if (this._status !== 'CONFIRMED') throw new Error();
    this.apply(
      new BookingStatusChanges(this._status, 'PAID', this._bookingData.hostId),
    );
    this._status = 'PAID';
  }

  public reject() {
    if (this._status !== 'PENDING') throw new Error();
    this.apply(
      new BookingStatusChanges(
        this._status,
        'REJECTED',
        this._bookingData.hostId,
      ),
    );
    this._status = 'REJECTED';
  }

  public cancel() {
    if (this._status !== 'PENDING') throw new Error();
    this.apply(
      new BookingStatusChanges(
        this._status,
        'CANCELLED',
        this._bookingData.hostId,
      ),
    );
    this._status = 'CANCELLED';
  }

  public expire() {
    if (this._status !== 'PENDING') throw new Error();
    this.apply(
      new BookingStatusChanges(
        this._status,
        'EXPIRED',
        this._bookingData.hostId,
      ),
    );
    this._status = 'EXPIRED';
  }

  public confirm() {
    if (this._status !== 'PENDING') throw new Error();
    this.apply(
      new BookingConfirmStatus(
        this._bookingData.userId,
        this._bookingData.hostId,
        this._id,
        this._bookingData.propertyId,
      ),
    );
    this.apply(
      new BookingStatusChanges(
        this._status,
        'CONFIRMED',
        this._bookingData.hostId,
      ),
    );
    this._status = 'CONFIRMED';
  }

  public complete() {
    if (this._status !== 'CONFIRMED') throw new Error();
    this.apply(
      new BookingCompletedStatus(
        this._bookingData.userId,
        this._bookingData.propertyId,
        this._id,
      ),
    );
    this.apply(
      new BookingStatusChanges(
        this._status,
        'COMPLETED',
        this._bookingData.hostId,
      ),
    );
    this._status = 'COMPLETED';
  }

  public isBooker(id: string) {
    return this._bookingData.userId === id;
  }

  public isOwner(id: string) {
    return this._bookingData.hostId === id;
  }

  get status() {
    return this._status;
  }

  get data() {
    return { ...this._bookingData };
  }

  get id() {
    return this._id;
  }
}
