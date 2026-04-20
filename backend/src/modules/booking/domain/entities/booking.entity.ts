import { randomUUID } from 'crypto';
import {
  badStatuses,
  TBookingStatus,
} from 'src/common/constants/bookingStatuses';
import { BookingCreated, BookingStatusChanges } from '../events/booking.events';
import { AggregateRoot } from '@nestjs/cqrs';

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
  days: number;
  propertyId: string;
  userId: string;
  startDate: Date;
  endDate: Date;
  hostId: string;
}

export interface IBookingEntityData extends IBookingEntityCreateProps {
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
    const totalPrice = rawData.days * rawData.priceAtMoment;
    const entity = new BookingEntity(
      'PENDING',
      { ...rawData, totalPrice },
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
    if (badStatuses[status] || data.startDate > data.endDate) {
      throw new Error();
    }
    return new BookingEntity(status, data, id);
  }

  public pay() {
    if (this._status !== 'CONFIRMED') throw new Error();
    this.apply(new BookingStatusChanges(this._status, 'PAID'));
    this._status = 'PAID';
  }

  public reject() {
    if (this._status !== 'PENDING') throw new Error();
    this.apply(new BookingStatusChanges(this._status, 'REJECTED'));
    this._status = 'REJECTED';
  }

  public cancel() {
    if (this._status !== 'PENDING') throw new Error();
    this.apply(new BookingStatusChanges(this._status, 'CANCELLED'));
    this._status = 'CANCELLED';
  }

  public expire() {
    if (this._status !== 'PENDING') throw new Error();
    this.apply(new BookingStatusChanges(this._status, 'EXPIRED'));
    this._status = 'EXPIRED';
  }

  public confirm() {
    if (this._status !== 'PENDING') throw new Error();
    this.apply(new BookingStatusChanges(this._status, 'CONFIRMED'));
    this._status = 'CONFIRMED';
  }

  public complete() {
    if (this._status !== 'CONFIRMED') throw new Error();
    this.apply(new BookingStatusChanges(this._status, 'COMPLETED'));
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
