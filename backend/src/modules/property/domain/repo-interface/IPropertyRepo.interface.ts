import { PropertyEntity } from '../entities/Property.entity';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const orderBy = {
  price: 'price',
  name: 'name',
} as const;

export type IOrderByProperty = (typeof orderBy)[keyof typeof orderBy];

export interface IPropertySearchParams {
  name?: string;
  typeId?: string;
  minPrice?: number;
  maxPrice?: number;
  hostId?: string;
  country?: string;
  city?: string;
  orderBy?: IOrderByProperty;
  limit?: number;
  cursor?: string;
}

export interface IPropertyView {
  id: string;
  name: string;
  description: string;
  price: number;
  maxGuests: number;
  address: string;
  city: string;
  country: string;
  host: string;
  types?: string;
}

export interface IPropertyRepo {
  getEntityById(id: string): Promise<PropertyEntity>;
  save(property: PropertyEntity): Promise<void>;
}

export interface IPropertyQueryRepo {
  getById(id: string): Promise<IPropertyView>;
  getList(searchParams: IPropertySearchParams): Promise<IPropertyView[]>;
}
