import {
  IReviewChangeData,
  IReviewData,
  IReviewViewData,
} from './review.interfaces';

export interface IReviewRepo {
  save(data: IReviewData): Promise<void>;
  changeReveiew(data: IReviewChangeData, userId: string): Promise<void>;
  deleteReview(id: string, userId: string): Promise<void>;
  getMyReviews(userId: string): Promise<IReviewViewData[]>;
  getReviewsByProperty(propertyId: string): Promise<IReviewViewData[]>;
}
