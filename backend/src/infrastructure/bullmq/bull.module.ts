import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { PropertyBullBridge } from './proccessors/property/property.bridge';
import { AuthBullBridge } from './proccessors/auth/auth.bridge';
import { RedisService } from '../redis/redis.service';
import { BookingBullBridge } from './proccessors/booking/booking.bridge';
import { ReviewBullBridge } from './proccessors/review/review.bridge';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: 'property' },
      { name: 'mail' },
      { name: 'review' },
    ),
  ],
  providers: [
    PropertyBullBridge,
    AuthBullBridge,
    BookingBullBridge,
    ReviewBullBridge,
    { provide: 'REDIS', useClass: RedisService },
  ],
})
export class EventModule {}
