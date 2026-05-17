export interface IBookingDataForBilling {
  amount: number;
}

export interface IBookingBillingAdapter {
  getData(bookingId: string): Promise<IBookingDataForBilling>;
}
