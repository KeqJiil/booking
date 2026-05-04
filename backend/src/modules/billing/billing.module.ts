import { Module } from '@nestjs/common';
import { BillingController } from './billing,controller';
import { StripeModule } from 'src/infrastructure/payments/stripe/stripe.module';
import { StripeService } from 'src/infrastructure/payments/stripe/stripe.service';

@Module({
  imports: [StripeModule],
  controllers: [BillingController],
  providers: [
    {
      provide: 'BILLING_SERVICE',
      useClass: StripeService,
    },
  ],
})
export class BillingModule {}
