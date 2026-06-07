import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
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
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import { Authorization } from 'src/common/decorators/authorization.decorator';
import { AccessInfo } from 'src/common/decorators/accessInfo.decorator';
import { IdempotencyAccess } from 'src/common/decorators/idempotency.decorator';
import { CreateBookingDto } from './application/dto/create-booking.dto';
import { SearchParamsBookingsDto } from './application/dto/searchParams.dto';
import {
  GetBookingByIdQuery,
  GetBookingsByPropertyQuery,
  GetMyBookingsQuery,
} from './application/queries/booking.query';
import {
  CancelBookingStatusCommand,
  CreateBookingCommand,
  PayBookingStatusCommand,
  RejectBookingStatusCommand,
} from './application/commands/booking.commands';

@ApiTags('Bookings')
@ApiBearerAuth()
@Controller('bookings')
export class BookingController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({
    summary: "Get authenticated user's bookings with optional filters",
  })
  @ApiResponse({
    status: 200,
    description: 'List of bookings',
    schema: {
      example: [
        {
          id: 'uuid',
          status: 'PENDING',
          startDate: '2026-06-01',
          endDate: '2026-06-07',
          totalPrice: 840,
          property: { id: 'uuid', name: 'Modern Loft' },
        },
      ],
    },
  })
  @Get()
  @HttpCode(200)
  @Authorization('USER')
  async getMyBookings(
    @AccessInfo('id') id: string,
    @Query() searchParams: SearchParamsBookingsDto,
  ) {
    return await this.queryBus.execute(
      new GetMyBookingsQuery(id, searchParams),
    );
  }

  @ApiOperation({ summary: 'Get single booking by ID (ADMIN only)' })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    description: 'Booking UUID',
  })
  @ApiResponse({
    status: 200,
    description: 'Booking object with full details',
    schema: {
      example: {
        id: 'uuid',
        status: 'PENDING',
        startDate: '2026-06-01',
        endDate: '2026-06-07',
        totalPrice: 840,
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  @Get(':id')
  @HttpCode(200)
  @Authorization('ADMIN')
  async getBookingById(@Param('id') id: string) {
    return await this.queryBus.execute(new GetBookingByIdQuery(id));
  }

  @ApiOperation({ summary: 'Get bookings for a specific property (USER)' })
  @ApiParam({
    name: 'id',
    description: 'Property UUID',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'List of bookings for the property',
    schema: {
      example: [
        {
          id: 'uuid',
          status: 'CONFIRMED',
          startDate: '2026-06-01',
          endDate: '2026-06-07',
        },
      ],
    },
  })
  @Get('/property/:id')
  @HttpCode(200)
  @Authorization('USER')
  async getBookingByProperty(
    @Param('id') id: string,
    @Query() searchParams: SearchParamsBookingsDto,
  ) {
    return await this.queryBus.execute(
      new GetBookingsByPropertyQuery(id, searchParams),
    );
  }

  @ApiOperation({ summary: 'Create a new booking (idempotent)' })
  @ApiHeader({
    name: 'X-Idempotency-Key',
    required: true,
    description: 'Unique key to prevent duplicate bookings',
  })
  @ApiBody({ type: CreateBookingDto })
  @ApiResponse({ status: 201, description: 'Booking created successfully' })
  @ApiResponse({
    status: 409,
    description: 'Dates already booked or duplicate request',
  })
  @Post()
  @HttpCode(201)
  @Authorization('USER')
  async createBooking(
    @Body() data: CreateBookingDto,
    @AccessInfo('id') id: string,
    @IdempotencyAccess() idempotencyKey: string,
  ) {
    await this.commandBus.execute(
      new CreateBookingCommand({ ...data, userId: id }, idempotencyKey),
    );
  }

  @ApiOperation({ summary: 'Reject a pending booking (HOST only)' })
  @ApiParam({
    name: 'id',
    description: 'Booking UUID',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({ status: 201, description: 'Booking rejected' })
  @ApiResponse({ status: 403, description: 'Not the host of this property' })
  @Post('reject/:id')
  @HttpCode(201)
  @Authorization('HOST')
  async rejectBooking(
    @Param('id') id: string,
    @AccessInfo('id') userId: string,
  ) {
    await this.commandBus.execute(new RejectBookingStatusCommand(userId, id));
  }

  @ApiOperation({ summary: 'Confirm and pay a booking (HOST only)' })
  @ApiParam({
    name: 'id',
    description: 'Booking UUID',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({ status: 201, description: 'Booking confirmed' })
  @ApiResponse({ status: 403, description: 'Not the host of this property' })
  @Post('pay/:id')
  @HttpCode(201)
  @Authorization('HOST')
  async confirmBooking(
    @Param('id') id: string,
    @AccessInfo('id') userId: string,
  ) {
    await this.commandBus.execute(new PayBookingStatusCommand(userId, id));
  }

  @ApiOperation({ summary: 'Cancel own booking (USER)' })
  @ApiParam({
    name: 'id',
    description: 'Booking UUID',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({ status: 201, description: 'Booking cancelled' })
  @ApiResponse({ status: 403, description: 'Not the owner of this booking' })
  @Post('cancel/:id')
  @HttpCode(201)
  @Authorization('USER')
  async cancelBooking(
    @Param('id') id: string,
    @AccessInfo('id') userId: string,
  ) {
    await this.commandBus.execute(new CancelBookingStatusCommand(userId, id));
  }
}
