import { IProperty } from '../entities/Property.entity';

export class PropertyCreated {
  constructor(
    public readonly hostId: string,
    public readonly id: string,
  ) {}
}

export class PropertyChanged {
  constructor(
    public readonly id: string,
    public readonly newData: IProperty,
  ) {}
}
export class PropertyDeleted {
  constructor(
    public readonly id: string,
    public readonly hostId: string,
  ) {}
}
