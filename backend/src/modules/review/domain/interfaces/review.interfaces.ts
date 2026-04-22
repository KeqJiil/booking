export interface ICacheReturnValue {
  userId: string;
  propertyId: string;
  bookingId: string;
}

export interface IReviewData extends ICacheReturnValue {
  text: string;
  rate: number;
  id: string;
}

export interface IReviewViewData {
  id: string;
  rating: number;
  description: string;
  reviewerId: string;
  bookingId: string;
  propertyId: string;
  createdAt: Date;
}

export type IReviewChangeData = Partial<Pick<IReviewData, 'rate' | 'text'>> & {
  id: string;
};
