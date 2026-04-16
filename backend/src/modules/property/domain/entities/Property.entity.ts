import { AggregateRoot } from '@nestjs/cqrs';
import { Address } from '../value-objects/address.value';
import {
  PropertyAddressChanged,
  PropertyCreated,
  PropertyDeleted,
  PropertyPriceChanged,
} from '../../application/events/property.events';
import { randomUUID } from 'crypto';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const LiveStatus = {
  ALIVE: 'ALIVE',
  DELETED: 'DELETED',
} as const;

export type ILiveStatus = keyof typeof LiveStatus;

interface IProperty {
  name: string;
  description: string;
  price: number;
  maxGuests: number;
  status: ILiveStatus;
  hostId: string;
  typeId: string;
  address: Address;
}

interface IPropertyProps {
  address: Address;
  name: string;
  description: string;
  price: number;
  maxGuests: number;
  status: 'ALIVE' | 'DELETED';
  hostId: string;
  typeId: string;
}

export class PropertyEntity extends AggregateRoot {
  constructor(
    private _props: IProperty,
    private readonly _id: string,
  ) {
    super();
  }

  static create(data: IPropertyProps, id?: string) {
    if (data.name.length < 4 || data.description.length < 20) throw new Error();
    const entity = new PropertyEntity(data, id ? id : randomUUID());
    this.apply(new PropertyCreated(entity._props.hostId, entity._id));
    return entity;
  }

  changeName(newName: string) {
    if (newName === this._props.name || newName.length < 4) throw new Error();
    this._props.name = newName;
  }

  changeDescription(newDescription: string) {
    if (newDescription.length < 20) throw new Error();
    this._props.description = newDescription;
  }

  changeAddress(newAddress: Address) {
    this._props.address = newAddress;
    this.apply(
      new PropertyAddressChanged(this.id, newAddress, this._props.hostId),
    );
  }

  changeMaxGuests(newNumber: number) {
    if (newNumber < 1) throw new Error();
    this._props.maxGuests = newNumber;
  }

  changePrice(newPrice: number) {
    if (newPrice < 1) throw new Error();
    this._props.price = newPrice;
    this.apply(
      new PropertyPriceChanged(this._id, newPrice, this._props.hostId),
    );
  }

  changeType(type: string) {
    this._props.typeId = type;
  }

  deleteProperty() {
    this._props.status = 'DELETED';
    this.apply(new PropertyDeleted(this._id, this._props.hostId));
  }

  get props() {
    return this._props;
  }

  get id() {
    return this._id;
  }
}
