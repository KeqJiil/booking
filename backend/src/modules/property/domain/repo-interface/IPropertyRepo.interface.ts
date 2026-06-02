import { PropertyEntity } from '../entities/Property.entity';

export const orderBy = {
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
  maxGuests?: number;
}

interface IPropertyViewBase {
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
  hostId: string;
}

export interface IPropertyListView extends IPropertyViewBase {
  coverImage: string | null;
}

export interface IPropertyDetailView extends IPropertyViewBase {
  images: string[];
}

export interface IPropertyRepo {
  checkBookings(id: string, date: Date, tx?: unknown): Promise<boolean>;
  getEntityById(id: string, tx?: unknown): Promise<PropertyEntity>;
  save(property: PropertyEntity, tx?: unknown): Promise<void>;
}

export interface IPaginatedResponse<T> {
  data: T[];
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextCursor: string | null;
}

export interface IPropertyQueryRepo {
  getById(id: string): Promise<IPropertyDetailView>;
  getList(
    searchParams: IPropertySearchParams,
  ): Promise<IPaginatedResponse<IPropertyListView>>;
}
