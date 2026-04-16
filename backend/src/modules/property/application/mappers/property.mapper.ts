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
    const { address, country, city, id, status, ...props } = data;
    const valueAddress = new Address(city, country, address);
    return PropertyEntity.create(
      { ...props, address: valueAddress },
      id,
      status,
    );
  }

  static toAnemic(data: PropertyEntity): IPlainProperty | null {
    const address = data.props.address;
    const props = { ...data.props, ...address };
    return { id: data.id, ...props, status: data.status };
  }
}
