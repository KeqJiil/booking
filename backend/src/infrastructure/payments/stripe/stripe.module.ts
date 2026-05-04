import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { StripeService } from './stripe.service';
import { BullModule } from '@nestjs/bullmq';

@Module({})
export class StripeModule {
  static forRootAsync(): DynamicModule {
    return {
      module: StripeModule,
      controllers: [],
      imports: [
        ConfigModule,
        BullModule.registerQueue({
          name: 'payments',
        }),
      ],
      providers: [
        {
          provide: 'STRIPE_CLIENT',
          useFactory: (configService: ConfigService) => {
            const apiKey =
              configService.getOrThrow<string>('STRIPE_SECRET_KEY');
            return new Stripe(apiKey, { apiVersion: '2026-04-22.dahlia' });
          },
          inject: [ConfigService],
        },
        StripeService,
      ],
    };
  }
}
