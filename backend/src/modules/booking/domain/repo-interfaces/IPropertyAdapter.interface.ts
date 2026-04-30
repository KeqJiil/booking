export interface IPropertyDataForBook {
  price: number;
  hostId: string;
}

export interface IPropertyAdapterToBooking {
  getData(propertyId: string): Promise<IPropertyDataForBook>;
}
