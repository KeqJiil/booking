import { Address } from '../value-objects/address.value';

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

export class PropertyEntity {
  constructor(
    private _props: IProperty,
    public readonly id?: string,
  ) {}

  static create(data: IPropertyProps, id?: string) {
    if (data.name.length < 4 || data.description.length < 20) throw new Error();

    return new PropertyEntity(data, id);
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
  }

  changeMaxGuests(newNumber: number) {
    if (newNumber < 1) throw new Error();
    this._props.maxGuests = newNumber;
  }

  changePrice(number: number) {
    if (number < 1) throw new Error();
    this._props.price = number;
  }

  get props() {
    return this._props;
  }
}
