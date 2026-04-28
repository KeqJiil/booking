import { AggregateRoot } from '@nestjs/cqrs';
import { Address } from '../value-objects/address.value';
import {
  PropertyChanged,
  PropertyCreated,
  PropertyDeleted,
} from '../events/property.events';
import { randomUUID } from 'crypto';
import { BadRequestException, ConflictException } from '@nestjs/common';

export type IChangeProperty = Readonly<
  Partial<Omit<IPlainProperty, 'status' | 'id'>>
> & { id: string };

export interface IPlainProperty {
  id: string;
  name: string;
  description: string;
  price: number;
  maxGuests: number;
  status: ILiveStatus;
  hostId: string;
  typeId: string;
  city: string;
  country: string;
  address: string;
}

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
    const entity = new PropertyEntity(
      data,
      status ? status : 'ALIVE',
      id ? id : randomUUID(),
    );
    entity.apply(new PropertyCreated(entity._props.hostId, entity._id));
    return entity;
  }

  isHost(userId: string) {
    return this.props.hostId === userId;
  }

  edit(data: IChangeProperty) {
    if (data.city && data.address && data.country) {
      const newAddress = new Address(data.city, data.country, data.address);
      this.changeAddress(newAddress);
    }
    if (data.description) this.changeDescription(data.description);
    if (data.maxGuests) this.changeMaxGuests(data.maxGuests);
    if (data.name) this.changeName(data.name);
    if (data.price) this.changePrice(data.price);
    if (data.typeId) this.changeType(data.typeId);
  }

  private changeName(newName: string) {
    if (newName.length < 4) throw new ConflictException();
    this._props.name = newName;
    this.apply(new PropertyChanged(this.id, this._props));
  }

  private changeDescription(newDescription: string) {
    if (newDescription.length < 20) throw new BadRequestException();
    this._props.description = newDescription;
    this.apply(new PropertyChanged(this.id, this._props));
  }

  private changeAddress(newAddress: Address) {
    this._props.address = newAddress;
    this.apply(new PropertyChanged(this.id, this._props));
  }

  private changeMaxGuests(newNumber: number) {
    if (newNumber < 1) throw new BadRequestException();
    this._props.maxGuests = newNumber;
    this.apply(new PropertyChanged(this.id, this._props));
  }

  private changePrice(newPrice: number) {
    if (newPrice < 1) throw new BadRequestException();
    this._props.price = newPrice;
    this.apply(new PropertyChanged(this.id, this._props));
  }

  private changeType(type: string) {
    this._props.typeId = type;
    this.apply(new PropertyChanged(this.id, this._props));
  }

  deleteProperty(userId: string, isAdmin: boolean) {
    if (userId === this._props.hostId || isAdmin) {
      this._status = 'DELETED';
      this.apply(new PropertyDeleted(this._id, this._props.hostId));
    }
  }

  get props() {
    return { ...this._props };
  }

  get id() {
    return this._id;
  }

  get status() {
    return this._status;
  }
}
