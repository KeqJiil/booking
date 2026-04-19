import { Controller, Get, Param, Post } from '@nestjs/common';
import { Authorization } from 'src/common/decorators/authorization.decorator';

@Controller('bookings')
export class BookingController {
  constructor() {}

  @Get()
  @Authorization('USER')
  async getMyBookings() {}

  @Get(':id')
  @Authorization('ADMIN')
  getBookingById(@Param('id') id: string) {}

  @Get('/property/:id')
  @Authorization('USER')
  getBookingByProperty(@Param('id') id: string) {}

  @Post()
  @Authorization('USER')
  createBooking() {}

  @Post('cancel/:id')
  @Authorization('USER')
  cancelBooking(@Param('id') id: string) {}
}
