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
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { ReviewService } from './application/review.service';
import { AccessInfo } from 'src/common/decorators/accessInfo.decorator';
import { Authorization } from 'src/common/decorators/authorization.decorator';
import { CreateReviewDto } from './application/dto/createReview.dto';
import { ChangeReviewDto } from './application/dto/changeReview.dto';
import { SearchParamsReviewsDto } from './application/dto/searchParams.dto';

@ApiTags('Reviews')
@ApiBearerAuth()
@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @ApiOperation({ summary: 'Create a review for a property (USER)' })
  @ApiBody({ type: CreateReviewDto })
  @ApiResponse({ status: 201, description: 'Review created successfully' })
  @ApiResponse({
    status: 409,
    description: 'User already reviewed this property',
  })
  @Authorization('USER')
  @Post()
  @HttpCode(201)
  async createReview(
    @AccessInfo('id') userId: string,
    @Body() dto: CreateReviewDto,
  ) {
    await this.reviewService.createReview(dto, userId);
  }

  @ApiOperation({ summary: 'Update own review (USER)' })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    description: 'Review UUID',
  })
  @ApiBody({ type: ChangeReviewDto })
  @ApiResponse({ status: 200, description: 'Review updated successfully' })
  @ApiResponse({ status: 403, description: 'Not the author of this review' })
  @ApiResponse({ status: 404, description: 'Review not found' })
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

  @ApiOperation({ summary: 'Delete own review (USER)' })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    description: 'Review UUID',
  })
  @ApiResponse({ status: 204, description: 'Review deleted successfully' })
  @ApiResponse({ status: 403, description: 'Not the author of this review' })
  @Authorization('USER')
  @Delete(':id')
  @HttpCode(204)
  async deleteReview(
    @AccessInfo('id') userId: string,
    @Param('id') id: string,
  ) {
    await this.reviewService.deleteReview(id, userId);
  }

  @ApiOperation({ summary: "Get authenticated user's own reviews" })
  @ApiResponse({
    status: 200,
    description: 'List of reviews written by the user',
    schema: {
      example: [
        {
          id: 'uuid',
          text: 'Great place!',
          rate: 5,
          property: { id: 'uuid', name: 'Modern Loft' },
        },
      ],
    },
  })
  @Authorization('USER')
  @Get()
  @HttpCode(200)
  async getMyReviews(
    @AccessInfo('id') userId: string,
    @Query() searchParams: SearchParamsReviewsDto,
  ) {
    return await this.reviewService.getMyReviews(userId, searchParams);
  }

  @ApiOperation({ summary: 'Get reviews for a property (public)' })
  @ApiParam({
    name: 'id',
    description: 'Property UUID',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'List of reviews for the property',
    schema: {
      example: [
        { id: 'uuid', text: 'Amazing stay!', rate: 5, author: { name: 'Bob' } },
      ],
    },
  })
  @Get(':id')
  @HttpCode(200)
  async getReviewsByProperty(
    @Param('id') propertyId: string,
    @Query() searchParams: SearchParamsReviewsDto,
  ) {
    return await this.reviewService.getReviewsByProperty(
      propertyId,
      searchParams,
    );
  }
}
