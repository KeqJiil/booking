import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ReviewService } from './application/review.service';
import { AccessInfo } from 'src/common/decorators/accessInfo.decorator';
import { Authorization } from 'src/common/decorators/authorization.decorator';
import { CreateReviewDto } from './application/dto/createReview.dto';
import { ChangeReviewDto } from './application/dto/changeReview.dto';
import { SearchParamsReviewsDto } from './application/dto/searchParams.dto';

@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Authorization('USER')
  @Post()
  @HttpCode(201)
  async createReview(
    @AccessInfo('id') userId: string,
    @Body() dto: CreateReviewDto,
  ) {
    await this.reviewService.createReview(dto, userId);
  }

  @Authorization('USER')
  @Patch()
  @HttpCode(201)
  async changeReview(
    @AccessInfo('id') userId: string,
    @Body() dto: ChangeReviewDto,
  ) {
    await this.reviewService.changeReview(dto, userId);
  }

  @Authorization('USER')
  @Delete()
  @HttpCode(204)
  async deleteReview(@AccessInfo('id') userId: string, @Body() id: string) {
    await this.reviewService.deleteReview(id, userId);
  }

  @Authorization('USER')
  @Get()
  @HttpCode(200)
  async getMyReviews(
    @AccessInfo('id') userId: string,
    @Body() searchParams: SearchParamsReviewsDto,
  ) {
    return await this.reviewService.getMyReviews(userId, searchParams);
  }

  @Get(':id')
  @HttpCode(200)
  async getReviewsByProperty(
    @Param('id') propertyId: string,
    @Body() searchParams: SearchParamsReviewsDto,
  ) {
    return await this.reviewService.getReviewsByProperty(
      propertyId,
      searchParams,
    );
  }
}
