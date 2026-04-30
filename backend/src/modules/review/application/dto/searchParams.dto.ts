import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';

const orderByReviews = {
  rate: 'rate',
  createdAt: 'createdAt',
} as const;

export type IOrderByReviews = keyof typeof orderByReviews;

export class SearchParamsReviewsDto {
  @ApiPropertyOptional({
    description: 'Filter reviews by specific rating',
    minimum: 1,
    maximum: 5,
    example: 5,
  })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  rate?: number;

  @ApiPropertyOptional({
    enum: orderByReviews,
    description: 'Sort by rating or creation date',
  })
  @IsEnum(orderByReviews)
  @IsOptional()
  orderBy?: IOrderByReviews;
}
