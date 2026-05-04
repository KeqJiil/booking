import {
  Controller,
  Headers,
  Post,
  type RawBodyRequest,
  Req,
} from '@nestjs/common';
import { StripeService } from './stripe.service';
import type { Request } from 'express';

@Controller('stripe')
export class StripeController {
  constructor(private readonly service: StripeService) {}

  @Post('webhook')
  async paymentData(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') sig: string,
  ) {
    const data = req.body;
    await this.service.verifyWebhook(data, sig);
  }
}
