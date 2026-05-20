import {
  IPlainProperty,
  PropertyEntity,
} from '../../domain/entities/Property.entity';
import { Address } from '../../domain/value-objects/address.value';

export class PropertyMapper {
  static toEntity(data: Omit<IPlainProperty, 'id' | 'status'>): PropertyEntity {
    const { address, country, city, ...props } = data;
    const valueAddress = new Address(city, country, address);
    return PropertyEntity.create(
      { ...props, address: valueAddress },
      data.images,
    );
  }

  static toEntityDb(data: IPlainProperty): PropertyEntity {
    return PropertyEntity.createFromDb(data);
  }

  static toAnemic(data: PropertyEntity): IPlainProperty {
    const address = data.props.address;
    const props = { ...data.props, ...address };
    const images = data.images.map((el) => ({ url: el.data.url, id: el.id }));
    return { id: data.id, ...props, status: data.status, images };
  }
}
