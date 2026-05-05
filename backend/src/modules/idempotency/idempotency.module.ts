import { Module } from '@nestjs/common';
import { IdempotencyService } from './idempotency.service';
import { PrismaIdempotencyRepo } from './repo/prismaIdempotency.repository';

@Module({
  controllers: [],
  providers: [
    IdempotencyService,
    { provide: 'IDEMPOTENCY_REPO', useClass: PrismaIdempotencyRepo },
  ],
})
export class IdempotencyModule {}
