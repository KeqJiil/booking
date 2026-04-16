import { Roles } from 'src/common/constants/roleLevels';
import { IPlainProperty } from '../mappers/property.mapper';

type ICreateProperty = Readonly<Omit<IPlainProperty, 'id' | 'status'>>;

type IChangeProperty = Readonly<
  Partial<Omit<IPlainProperty, 'status' | 'id'>>
> & { id: string };

export class CreatePropertyCommand {
  constructor(public readonly data: ICreateProperty) {}
}

export class EditPropertyCommand {
  constructor(
    public readonly userId: string,
    public readonly changeProperty: IChangeProperty,
  ) {}
}

export class DeletePropertyCommand {
  constructor(
    public readonly propertyId: string,
    public readonly userId: string,
    public readonly role: Roles,
  ) {}
}
