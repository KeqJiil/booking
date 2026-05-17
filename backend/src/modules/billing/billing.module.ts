import { Module } from '@nestjs/common';
import { BillingController } from './billing,controller';
import { StripeModule } from 'src/infrastructure/payments/stripe/stripe.module';
import { StripeService } from 'src/infrastructure/payments/stripe/stripe.service';
import { BillingService } from './billing,service';
import { BillingRepository } from './infrastructure/repository/billing.repository';
import { UserModule } from '../user/user.module';
import { IdempotencyModule } from '../idempotency/idempotency.module';
import { BookingProviderAdapter } from './infrastructure/adapters/booking.adapter';

@Module({
  imports: [StripeModule, UserModule, IdempotencyModule],
  controllers: [BillingController],
  providers: [
    BillingService,
    {
      provide: 'PAYMENT_SERVICE',
      useClass: StripeService,
    },
    {
      provide: 'BILLING_REPOSITORY',
      useClass: BillingRepository,
    },
    BookingProviderAdapter,
  ],
})
export class BillingModule {}
