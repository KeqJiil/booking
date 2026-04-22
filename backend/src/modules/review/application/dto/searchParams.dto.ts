import { IsEnum, IsNumber, IsOptional } from 'class-validator';

const orderByReviews = {
  rate: 'rate',
  createdAt: 'createdAt',
} as const;

export type IOrderByReviews = keyof typeof orderByReviews;

export class SearchParamsReviewsDto {
  @IsNumber()
  @IsOptional()
  rate?: number;

  @IsEnum(orderByReviews)
  @IsOptional()
  orderBy?: IOrderByReviews;
}
