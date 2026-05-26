import { Module } from '@nestjs/common';
import { ReviewService } from './application/review.service';
import { ReviewController } from './review.controller';
import { PrismaReviewRepository } from './infrastructure/repo/IReview.repository';
import { RedisModule } from 'src/infrastructure/redis/redis.module';

@Module({
  imports: [RedisModule],
  controllers: [ReviewController],
  providers: [
    ReviewService,
    { provide: 'ReviewRepo', useClass: PrismaReviewRepository },
  ],
})
export class ReviewModule {}
