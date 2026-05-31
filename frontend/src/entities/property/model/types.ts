export interface IPropertyType {
  id: string;
  name: string;
}

export interface IProperty {
  id: string;
  title: string;
  description: string;
  pricePerNight: number;
  address: string;
  city: string;
  country: string;
  maxGuests: number;
  rooms: number;
  beds: number;
  bathrooms: number;
  images: string[];
  propertyType: IPropertyType;
  hostId: string;
  rating: number;
  reviewCount: number;
  isAvailable: boolean;
  createdAt: string;
}

export interface IPropertySearchParams {
  city?: string;
  country?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  minPrice?: number;
  maxPrice?: number;
  propertyTypeId?: string;
  page?: number;
  limit?: number;
}

export interface ICreatePropertyData {
  title: string;
  description: string;
  pricePerNight: number;
  address: string;
  city: string;
  country: string;
  maxGuests: number;
  rooms: number;
  beds: number;
  bathrooms: number;
  propertyTypeId: string;
}

export type IUpdatePropertyData = Partial<ICreatePropertyData>

export type ICreatePropertyAllData = ICreatePropertyData & {idempotencyKey: string};