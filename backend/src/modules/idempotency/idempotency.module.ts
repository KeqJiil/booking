import { Global, Module } from '@nestjs/common';
import { IdempotencyService } from './idempotency.service';
import { PrismaIdempotencyRepo } from './repo/prismaIdempotency.repository';

@Global()
@Module({
  controllers: [],
  providers: [
    IdempotencyService,
    { provide: 'IDEMPOTENCY_REPO', useClass: PrismaIdempotencyRepo },
  ],
  exports: [IdempotencyService],
})
export class IdempotencyModule {}
