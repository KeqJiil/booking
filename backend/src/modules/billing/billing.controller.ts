import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { Authorization } from 'src/common/decorators/authorization.decorator';
import { BillingService } from './billing.service';
import { IdempotencyAccess } from 'src/common/decorators/idempotency.decorator';
import { IdempotencyGuard } from 'src/common/guards/Idempotency.guard';
import { AccessInfo } from 'src/common/decorators/accessInfo.decorator';
import { ClientIdDto } from './application/dto/clientId.dto';
import { EmailDto } from './application/dto/email.dto';

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
    @Body() { email }: EmailDto,
  ) {
    return await this.billingService.createPaymentAccount(
      email,
      id,
      idempotencyKey,
    );
  }

  @Get()
  @Authorization('USER')
  async getAccountNumber(@AccessInfo('id') id: string) {
    return await this.billingService.getUserId(id);
  }

  @Post('payment/:id')
  @Authorization('USER')
  @UseGuards(IdempotencyGuard)
  async createPayment(
    @IdempotencyAccess() idempotencyKey: string,
    @AccessInfo('id') id: string,
    @Param('id') bookingId: string,
    @Body() { clientId }: ClientIdDto,
  ) {
    return await this.billingService.createPayment(
      bookingId,
      id,
      clientId,
      idempotencyKey,
    );
  }

  @Post('refund/:id')
  @Authorization('USER')
  @UseGuards(IdempotencyGuard)
  async refund(
    @IdempotencyAccess() idempotencyKey: string,
    @Param('id') paymentId: string,
    @Body() { clientId }: ClientIdDto,
    @AccessInfo('id') id: string,
  ) {
    await this.billingService.refundPayment(
      id,
      paymentId,
      clientId,
      idempotencyKey,
    );
  }
}
