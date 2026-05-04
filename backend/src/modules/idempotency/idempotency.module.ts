import { Module } from '@nestjs/common';
import { IdempotencyService } from './idempotency.service';

@Module({
  controllers: [],
  providers: [IdempotencyService],
})
export class IdempotencyModule {}
