import { Controller } from '@nestjs/common';
import { ReviewService } from './application/review.service';

@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}
}
