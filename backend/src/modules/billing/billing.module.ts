import { Module } from '@nestjs/common';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { BillingRepository } from './infrastructure/repository/billing.repository';
import { UserModule } from '../user/user.module';
import { IdempotencyModule } from '../idempotency/idempotency.module';
import { BookingProviderAdapter } from './infrastructure/adapters/booking.adapter';
import { PrismaModule } from 'src/database/prisma.module';
import { BillingRefundPending } from './infrastructure/cron/billingOutbox.cron';
import { BullModule } from '@nestjs/bullmq';
import { BillingQueueHandler } from './infrastructure/queueHandlers/queue.handler';
import { PaymentsQueueHandler } from './infrastructure/queueHandlers/payment.handler';
import { BillingOutboxRepository } from './infrastructure/repository/billingOutbox.repository';

@Module({
  imports: [
    UserModule,
    IdempotencyModule,
    PrismaModule,
    BullModule.registerQueue({ name: 'billing' }),
  ],
  controllers: [BillingController],
  providers: [
    BillingService,
    {
      provide: 'BILLING_REPOSITORY',
      useClass: BillingRepository,
    },
    BookingProviderAdapter,
    { provide: BillingOutboxRepository, useClass: BillingOutboxRepository },
    BillingRefundPending,
    BillingQueueHandler,
    PaymentsQueueHandler,
  ],
})
export class BillingModule {}
