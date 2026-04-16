import { Address } from '../../domain/value-objects/address.value';

export class PropertyCreated {
  constructor(
    public readonly hostId: string,
    public readonly id: string,
  ) {}
}

export class PropertyAddressChanged {
  constructor(
    public readonly id: string,
    public readonly newAddress: Address,
    public readonly hostId: string,
  ) {}
}

export class PropertyPriceChanged {
  constructor(
    public readonly id: string,
    public readonly newPrice: number,
    public readonly hostId: string,
  ) {}
}

export class PropertyDeleted {
  constructor(
    public readonly id: string,
    public readonly hostId: string,
  ) {}
}
