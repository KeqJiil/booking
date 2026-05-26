import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { StripeService } from './stripe.service';
import { BullModule } from '@nestjs/bullmq';
import { STRIPE_PAYMENT_CLIENT } from 'src/common/constants/providerConstants';

@Module({})
export class StripeModule {
  static forRootAsync(isGlobal: boolean): DynamicModule {
    return {
      global: isGlobal,
      module: StripeModule,
      controllers: [],
      imports: [
        ConfigModule,
        BullModule.registerQueue({
          name: 'payments',
        }),
      ],
      providers: [
        StripeService,
        {
          provide: 'STRIPE_CLIENT',
          useFactory: (configService: ConfigService) => {
            const apiKey =
              configService.getOrThrow<string>('STRIPE_SECRET_KEY');
            return new Stripe(apiKey, { apiVersion: '2026-04-22.dahlia' });
          },
          inject: [ConfigService],
        },
        {
          provide: STRIPE_PAYMENT_CLIENT,
          useExisting: StripeService,
        },
      ],
      exports: [STRIPE_PAYMENT_CLIENT],
    };
  }
}
