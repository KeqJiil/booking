import { AggregateRoot } from '@nestjs/cqrs';
import { Address } from '../value-objects/address.value';
import {
  PropertyAddressChanged,
  PropertyCreated,
  PropertyDeleted,
  PropertyPriceChanged,
} from '../events/property.events';
import { randomUUID } from 'crypto';
import { BadRequestException, ConflictException } from '@nestjs/common';

export const LiveStatus = {
  ALIVE: 'ALIVE',
  DELETED: 'DELETED',
} as const;

export type ILiveStatus = keyof typeof LiveStatus;

export interface IProperty {
  name: string;
  description: string;
  price: number;
  maxGuests: number;
  hostId: string;
  typeId: string;
  address: Address;
}

export class PropertyEntity extends AggregateRoot {
  constructor(
    private _props: IProperty,
    private _status: ILiveStatus,
    private readonly _id: string,
  ) {
    super();
  }

  static create(data: IProperty, id?: string, status?: ILiveStatus) {
    if (data.name.length < 4 || data.description.length < 20)
      throw new BadRequestException();
    console.log(data);
    const entity = new PropertyEntity(
      data,
      status ? status : 'ALIVE',
      id ? id : randomUUID(),
    );
    entity.apply(new PropertyCreated(entity._props.hostId, entity._id));
    return entity;
  }

  changeName(newName: string) {
    if (newName.length < 4) throw new ConflictException();
    this._props.name = newName;
  }

  changeDescription(newDescription: string) {
    if (newDescription.length < 20) throw new BadRequestException();
    this._props.description = newDescription;
  }

  changeAddress(newAddress: Address) {
    this._props.address = newAddress;
    this.apply(
      new PropertyAddressChanged(this.id, newAddress, this._props.hostId),
    );
  }

  changeMaxGuests(newNumber: number) {
    if (newNumber < 1) throw new BadRequestException();
    this._props.maxGuests = newNumber;
  }

  changePrice(newPrice: number) {
    if (newPrice < 1) throw new BadRequestException();
    this._props.price = newPrice;
    this.apply(
      new PropertyPriceChanged(this._id, newPrice, this._props.hostId),
    );
  }

  changeType(type: string) {
    this._props.typeId = type;
  }

  deleteProperty() {
    this._status = 'DELETED';
    this.apply(new PropertyDeleted(this._id, this._props.hostId));
  }

  get props() {
    return this._props;
  }

  get id() {
    return this._id;
  }

  get status() {
    return this._status;
  }
}
