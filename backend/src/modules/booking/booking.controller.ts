import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { Authorization } from 'src/common/decorators/authorization.decorator';
import { CreateBookingDto } from './application/dto/create-booking.dto';
import { AccessInfo } from 'src/common/decorators/accessInfo.decorator';
import { SearchParamsBookingsDto } from './application/dto/searchParams.dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
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
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Bookings')
@Controller('bookings')
export class BookingController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @HttpCode(200)
  @Authorization('USER')
  async getMyBookings(
    @AccessInfo('id') id: string,
    @Body() searchParams: SearchParamsBookingsDto,
  ) {
    return await this.queryBus.execute(
      new GetMyBookingsQuery(id, searchParams),
    );
  }

  @Get(':id')
  @HttpCode(200)
  @Authorization('ADMIN')
  async getBookingById(@Param('id') id: string) {
    return await this.queryBus.execute(new GetBookingByIdQuery(id));
  }

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

  @Post()
  @HttpCode(201)
  @Authorization('USER')
  async createBooking(
    @Body() data: CreateBookingDto,
    @AccessInfo('id') id: string,
  ) {
    await this.commandBus.execute(
      new CreateBookingCommand({ ...data, userId: id }),
    );
  }

  @Post('reject/:id')
  @HttpCode(201)
  @Authorization('HOST')
  async rejectBooking(
    @Param('id') id: string,
    @AccessInfo('id') userId: string,
  ) {
    await this.commandBus.execute(new RejectBookingStatusCommand(userId, id));
  }

  @Post('pay/:id')
  @HttpCode(201)
  @Authorization('HOST')
  async confirmBooking(
    @Param('id') id: string,
    @AccessInfo('id') userId: string,
  ) {
    await this.commandBus.execute(new PayBookingStatusCommand(userId, id));
  }

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
