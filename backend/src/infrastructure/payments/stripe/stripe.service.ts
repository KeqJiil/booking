import { Inject, Injectable } from '@nestjs/common';
import { IPaymentService } from 'src/infrastructure/payments/interfaces/paymentService.interface';
import type { Stripe } from 'stripe';
import {
  ICreateSessionPayment,
  IPaymentSessionResult,
} from '../interfaces/createSession.interface';
import { DEFAULT_CURRENCY } from 'src/common/constants/defaultCurrency';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { IPaymentMetadata } from '../interfaces/data.interfaces';
import { paymentConsts } from 'src/common/constants/paymentConsts';

@Injectable()
export class StripeService implements IPaymentService {
  constructor(
    @Inject('STRIPE_CLIENT') private readonly stripe: Stripe,
    @InjectQueue('payments') private queue: Queue,
    private readonly config: ConfigService,
  ) {}

  async createUser(email: string, userId: string) {
    const res = await this.stripe.customers.create({
      email,
      metadata: {
        userId,
      },
    });
    return res.id;
  }

  async createSession(
    data: ICreateSessionPayment,
  ): Promise<IPaymentSessionResult> {
    const res = await this.stripe.checkout.sessions.create(
      {
        mode: 'payment',
        customer: data.customerId,
        customer_update: { address: 'auto' },
        line_items: [
          {
            price_data: {
              currency: DEFAULT_CURRENCY,
              product_data: {
                name: data.bookingId,
              },
              unit_amount: data.amount,
            },
            quantity: 1,
          },
        ],
        metadata: {
          bookingId: data.bookingId,
          userId: data.userId,
        },
        success_url: 'http://localhost:5173/',
        cancel_url: 'http://localhost:5173/',
      },
      {
        idempotencyKey: data.idempotencyKey,
      },
    );
    return {
      sessionId: res.id,
      paymentUrl: res.url!,
    };
  }

  async verifyWebhook(rawBody: Buffer, signature: string): Promise<void> {
    const event = this.stripe.webhooks.constructEvent(
      rawBody,
      signature,
      this.config.getOrThrow('STRIPE_WH'),
    );
    switch (event.type) {
      case 'checkout.session.completed': {
        const metadata = event.data.object
          .metadata as unknown as IPaymentMetadata;
        await this.queue.add(paymentConsts.payment_success, {
          userId: metadata.userId,
          bookingId: metadata.bookingId,
        });
        break;
      }

      case 'payment_intent.payment_failed': {
        const metadata = event.data.object
          .metadata as unknown as IPaymentMetadata;
        await this.queue.add(paymentConsts.payment_failed, {
          userId: metadata.userId,
          bookingId: metadata.bookingId,
        });
        break;
      }

      case 'checkout.session.expired': {
        const metadata = event.data.object
          .metadata as unknown as IPaymentMetadata;
        await this.queue.add(paymentConsts.payment_failed, {
          userId: metadata.userId,
          bookingId: metadata.bookingId,
        });
      }
    }
  }

  async handleRefund(paymentIntendId: string): Promise<void> {
    await this.stripe.refunds.create({
      payment_intent: paymentIntendId,
    });
  }
}
