import {
  IPlainProperty,
  PropertyEntity,
} from '../../domain/entities/Property.entity';
import { Address } from '../../domain/value-objects/address.value';

export class PropertyMapper {
  static toEntity(data: IPlainProperty): PropertyEntity {
    const { address, country, city, id, status, ...props } = data;
    const valueAddress = new Address(city, country, address);
    return PropertyEntity.create(
      { ...props, address: valueAddress },
      data.images,
      id,
      status,
    );
  }

  static toAnemic(data: PropertyEntity): IPlainProperty | null {
    const address = data.props.address;
    const props = { ...data.props, ...address };
    const image = data.images.map((el) => ({ url: el.data.url, id: el.id }));
    return { id: data.id, ...props, status: data.status, images: image };
  }
}
