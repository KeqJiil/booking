import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Authorization } from 'src/common/decorators/authorization.decorator';
import { CreateBookingDto } from './application/dto/create-booking.dto';
import { AccessInfo } from 'src/common/decorators/accessInfo.decorator';

@Controller('bookings')
export class BookingController {
  constructor() {}

  @Get()
  @Authorization('USER')
  async getMyBookings() {}

  @Get(':id')
  @Authorization('ADMIN')
  async getBookingById(@Param('id') id: string) {}

  @Get('/property/:id')
  @Authorization('USER')
  async getBookingByProperty(@Param('id') id: string) {}

  @Post()
  @Authorization('USER')
  async createBooking(
    @Body() data: CreateBookingDto,
    @AccessInfo('id') id: string,
  ) {}

  @Post('reject/:id')
  @Authorization('HOST')
  async rejectBooking(
    @Param('id') id: string,
    @AccessInfo('id') userId: string,
  ) {}

  @Post('pay/:id')
  @Authorization('USER')
  async payBooking(@Param('id') id: string, @AccessInfo('id') userId: string) {}

  @Post('pay/:id')
  @Authorization('HOST')
  async confirmBooking(
    @Param('id') id: string,
    @AccessInfo('id') userId: string,
  ) {}

  @Post('cancel/:id')
  @Authorization('USER')
  async cancelBooking(@Param('id') id: string) {}
}
