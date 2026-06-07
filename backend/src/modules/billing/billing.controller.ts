import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiHeader,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { Authorization } from 'src/common/decorators/authorization.decorator';
import { BillingService } from './billing.service';
import { IdempotencyAccess } from 'src/common/decorators/idempotency.decorator';
import { IdempotencyGuard } from 'src/common/guards/Idempotency.guard';
import { AccessInfo } from 'src/common/decorators/accessInfo.decorator';
import { ClientIdDto } from './application/dto/clientId.dto';
import { EmailDto } from './application/dto/email.dto';

@ApiTags('Billing')
@ApiBearerAuth()
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @ApiOperation({ summary: 'Get all payments for authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'List of payment records',
    schema: {
      example: [
        {
          id: 'uuid',
          amount: 840,
          status: 'SUCCEEDED',
          createdAt: '2026-06-01T10:00:00Z',
        },
      ],
    },
  })
  @Get('list')
  @HttpCode(200)
  @Authorization('USER')
  async getPaymentsInfo(@AccessInfo('id') id: string) {
    return await this.billingService.getPayments(id);
  }

  @ApiOperation({ summary: 'Get Stripe customer ID for authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'Stripe customer ID string',
    schema: { example: { customerId: 'cus_ABC123' } },
  })
  @Get('account')
  @HttpCode(200)
  @Authorization('USER')
  async getAccountNumber(@AccessInfo('id') id: string) {
    return await this.billingService.getUserId(id);
  }

  @ApiOperation({ summary: 'Get specific payment by ID' })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    description: 'Payment UUID',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment record',
    schema: {
      example: {
        id: 'uuid',
        amount: 840,
        status: 'SUCCEEDED',
        bookingId: 'uuid',
        createdAt: '2026-06-01T10:00:00Z',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  @Get(':id')
  @HttpCode(200)
  @Authorization('USER')
  async getPaymentInfoById(
    @AccessInfo('id') userId: string,
    @Param('id') id: string,
  ) {
    return await this.billingService.getPaymentById(userId, id);
  }

  @ApiOperation({
    summary:
      'Create Stripe payment account for authenticated user (idempotent)',
  })
  @ApiHeader({
    name: 'X-Idempotency-Key',
    required: true,
    description: 'Unique key to prevent duplicate account creation',
  })
  @ApiBody({ type: EmailDto })
  @ApiResponse({
    status: 201,
    description: 'Stripe account created',
    schema: { example: { customerId: 'cus_ABC123' } },
  })
  @ApiResponse({
    status: 409,
    description: 'Account already exists or duplicate request',
  })
  @Post()
  @HttpCode(201)
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

  @ApiOperation({ summary: 'Initiate payment for a booking (idempotent)' })
  @ApiHeader({
    name: 'X-Idempotency-Key',
    required: true,
    description: 'Unique key to prevent duplicate payments',
  })
  @ApiParam({
    name: 'id',
    description: 'Booking UUID',
    type: String,
    format: 'uuid',
  })
  @ApiBody({ type: ClientIdDto })
  @ApiResponse({
    status: 201,
    description: 'Payment initiated',
    schema: { example: { clientSecret: 'pi_..._secret_...' } },
  })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  @Post('payment/:id')
  @HttpCode(201)
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

  @ApiOperation({ summary: 'Refund a payment (idempotent)' })
  @ApiHeader({
    name: 'X-Idempotency-Key',
    required: true,
    description: 'Unique key to prevent duplicate refunds',
  })
  @ApiParam({
    name: 'id',
    description: 'Payment UUID',
    type: String,
    format: 'uuid',
  })
  @ApiBody({ type: ClientIdDto })
  @ApiResponse({ status: 201, description: 'Refund initiated successfully' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  @Post('refund/:id')
  @HttpCode(201)
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
