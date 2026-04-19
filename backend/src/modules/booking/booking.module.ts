import { Module } from '@nestjs/common';
import { BookingController } from './booking.controller';
import { TransactionRepo } from './infrastructure/repo/Transaction.repository';
import { PrismaBookingRepo } from './infrastructure/repo/PrismaBooking.repository';
import { PrismaModule } from 'src/database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BookingController],
  providers: [
    { provide: 'TransactionRepo', useClass: TransactionRepo },
    { provide: 'BookingRepo', useClass: PrismaBookingRepo },
  ],
})
export class BookingModule {}
