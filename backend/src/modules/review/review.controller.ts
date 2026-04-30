import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ReviewService } from './application/review.service';
import { AccessInfo } from 'src/common/decorators/accessInfo.decorator';
import { Authorization } from 'src/common/decorators/authorization.decorator';
import { CreateReviewDto } from './application/dto/createReview.dto';
import { ChangeReviewDto } from './application/dto/changeReview.dto';
import { SearchParamsReviewsDto } from './application/dto/searchParams.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Reviews')
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
  @Patch(':id')
  @HttpCode(200)
  async changeReview(
    @AccessInfo('id') userId: string,
    @Body() dto: ChangeReviewDto,
    @Param('id') id: string,
  ) {
    await this.reviewService.changeReview(id, dto, userId);
  }

  @Authorization('USER')
  @Delete(':id')
  @HttpCode(204)
  async deleteReview(
    @AccessInfo('id') userId: string,
    @Param('id') id: string,
  ) {
    await this.reviewService.deleteReview(id, userId);
  }

  @Authorization('USER')
  @Get()
  @HttpCode(200)
  async getMyReviews(
    @AccessInfo('id') userId: string,
    @Query() searchParams: SearchParamsReviewsDto,
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
