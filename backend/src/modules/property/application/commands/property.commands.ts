import { Roles } from 'src/common/constants/roleLevels';
import {
  IChangeProperty,
  IPlainProperty,
} from '../../domain/entities/Property.entity';

type ICreateProperty = Readonly<Omit<IPlainProperty, 'id' | 'status'>>;

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

export class AddImagesCommand {
  constructor(
    public readonly urls: string[],
    public readonly propertyId: string,
    public readonly userId: string,
  ) {}
}

export class DeleteImagesCommand {
  constructor(
    public readonly urls: string[],
    public readonly propertyId: string,
    public readonly userId: string,
  ) {}
}
