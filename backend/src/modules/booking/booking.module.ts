import { Module } from '@nestjs/common';
import { BookingController } from './booking.controller';

@Module({
  controllers: [BookingController],
  providers: [],
})
export class BookingModule {}
