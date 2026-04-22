import { SearchParamsReviewsDto } from '../../application/dto/searchParams.dto';
import {
  IReviewChangeData,
  IReviewData,
  IReviewViewData,
} from './review.interfaces';

export interface IReviewRepo {
  save(data: IReviewData): Promise<void>;
  changeReveiew(data: IReviewChangeData, userId: string): Promise<void>;
  deleteReview(id: string, userId: string): Promise<void>;
  getMyReviews(
    userId: string,
    searchParams: SearchParamsReviewsDto,
  ): Promise<IReviewViewData[]>;
  getReviewsByProperty(
    propertyId: string,
    searchParams: SearchParamsReviewsDto,
  ): Promise<IReviewViewData[]>;
}
