import {
  ILiveStatus,
  PropertyEntity,
} from '../../domain/entities/Property.entity';
import { Address } from '../../domain/value-objects/address.value';

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

export class PropertyMapper {
  static toEntity(data: IPlainProperty): PropertyEntity {
    const { address, country, city, id, ...props } = data;
    const valueAddress = new Address(city, country, address);
    return new PropertyEntity({ ...props, address: valueAddress }, id);
  }

  static toAnemic(data: PropertyEntity): IPlainProperty | null {
    if (!data.id) return null;
    const address = data.props.address;
    const props = { ...data.props, ...address };
    return { id: data.id, ...props };
  }
}
