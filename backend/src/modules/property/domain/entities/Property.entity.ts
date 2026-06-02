import { AggregateRoot } from '@nestjs/cqrs';
import { Address } from '../value-objects/address.value';
import {
  PropertyChanged,
  PropertyCreated,
  PropertyDeleted,
} from '../events/property.events';
import { v7 as uuidv7 } from 'uuid';
import { IImage, ImageEntity } from './Image.entity';
import {
  NotAllowedError,
  WrongInputDataError,
} from 'src/common/exceptions/entityDomain.exceptions';

export type IChangeProperty = Readonly<
  Partial<Omit<IPlainProperty, 'status' | 'id' | 'images' | 'hostId'>>
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
  images: IImage[];
}

export const LiveStatus = {
  ALIVE: 'ALIVE',
  DELETED: 'DELETED',
  NOT_CONFIRMED: 'NOT_CONFIRMED',
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
    private _images: ImageEntity[],
  ) {
    super();
  }

  static create(data: IProperty, images: IImage[]) {
    if (data.name.length < 4 || data.description.length < 20)
      throw new WrongInputDataError('Description');
    if (images.length > 20) throw new WrongInputDataError('Number of images');
    const imageEntities = this.createImages(images);
    const entity = new PropertyEntity(data, 'ALIVE', uuidv7(), imageEntities);
    entity.apply(new PropertyCreated(entity._props.hostId, entity._id));
    return entity;
  }

  static createFromDb(data: IPlainProperty) {
    const { images, id, status, city, address, country, ...props } = data;
    const addressVO = new Address(city, country, address);
    const imageEntities = this.createImages(images);
    return new PropertyEntity(
      { ...props, address: addressVO },
      status,
      id,
      imageEntities,
    );
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

  private static createImages(data: IImage[]) {
    return data.map((el) => ImageEntity.createImage({ url: el.url }, el.id));
  }

  private changeName(newName: string) {
    if (newName.length < 4) throw new WrongInputDataError(`Name length`);
    this._props.name = newName;
    this.apply(new PropertyChanged(this.id, this._props));
  }

  private changeDescription(newDescription: string) {
    if (newDescription.length < 20)
      throw new WrongInputDataError(`Description length`);
    this._props.description = newDescription;
    this.apply(new PropertyChanged(this.id, this._props));
  }

  private changeAddress(newAddress: Address) {
    if (this._props.address.equals(newAddress)) return;
    this._props.address = newAddress;
    this.apply(new PropertyChanged(this.id, this._props));
  }

  private changeMaxGuests(newNumber: number) {
    if (newNumber < 1) throw new WrongInputDataError(`Number of guests`);
    this._props.maxGuests = newNumber;
    this.apply(new PropertyChanged(this.id, this._props));
  }

  private changePrice(newPrice: number) {
    if (newPrice < 1) throw new WrongInputDataError(`price`);
    this._props.price = newPrice;
    this.apply(new PropertyChanged(this.id, this._props));
  }

  private changeType(type: string) {
    this._props.typeId = type;
    this.apply(new PropertyChanged(this.id, this._props));
  }

  updateImages(data: IImage[]) {
    if (data.length > 20) throw new WrongInputDataError('Number of images');
    const images = data.map((el) =>
      ImageEntity.createImage({ url: el.url }, el.id),
    );
    this._images = images;
  }

  deleteProperty(userId: string, isAdmin: boolean) {
    if (this.isHost(userId) || isAdmin) {
      this._status = 'DELETED';
      this.apply(new PropertyDeleted(this._id, this._props.hostId));
    } else {
      throw new NotAllowedError('You are not a host of property or an admin');
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

  get images() {
    return this._images;
  }
}
