import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { Authorization } from 'src/common/decorators/authorization.decorator';
import { BillingService } from './billing,service';
import { IdempotencyAccess } from 'src/common/decorators/idempotency.decorator';
import { IdempotencyGuard } from 'src/common/guards/Idempotency.guard';
import { AccessInfo } from 'src/common/decorators/accessInfo.decorator';

@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get()
  @Authorization('USER')
  async getPaymentsInfo(@AccessInfo('id') id: string) {
    return await this.billingService.getPayments(id);
  }

  @Get(':id')
  @Authorization('USER')
  async getPaymentInfoById(
    @AccessInfo('id') userId: string,
    @Param('id') id: string,
  ) {
    return await this.billingService.getPaymentById(userId, id);
  }

  @Post()
  @Authorization('USER')
  @UseGuards(IdempotencyGuard)
  async createAccount(
    @IdempotencyAccess() idempotencyKey: string,
    @AccessInfo('id') id: string,
    @Body() email: { email: string },
  ) {
    return await this.billingService.createPaymentAccount(
      email.email,
      id,
      idempotencyKey,
    );
  }

  @Post('payment')
  @Authorization('USER')
  @UseGuards(IdempotencyGuard)
  async createPayment(
    @IdempotencyAccess() idempotencyKey: string,
    @AccessInfo('id') id: string,
  ) {}
}
