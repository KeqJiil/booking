import { Module } from '@nestjs/common';
import { BookingController } from './booking.controller';
import { TransactionRepo } from './infrastructure/repo/Transaction.repository';
import { PrismaBookingRepo } from './infrastructure/repo/PrismaBooking.repository';
import { PrismaBookingQueryRepo } from './infrastructure/repo/PrismaBookingQuery.repository';
import { GetMyBookingsQueryHandler } from './application/queries/getMyBookings.query';
import { GetBookingByIdHandler } from './application/queries/getBookingById.query';
import { GetBookingsByPropertyHandler } from './application/queries/getBookingsByProperty.query';
import { CreateBookingHandler } from './application/commands/create-booking.handler';
import { ChangeBookingHandler } from './application/commands/expire-status.handler';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from 'src/database/prisma.module';
import { BookingWorker } from './infrastructure/bullmq/expired.worker';
import { CompletedBookingEventHandler } from './application/events/completedEvent.handler';

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue({
      name: 'booking',
    }),
  ],
  controllers: [BookingController],
  providers: [
    { provide: 'TransactionRepo', useClass: TransactionRepo },
    { provide: 'BookingRepo', useClass: PrismaBookingRepo },
    { provide: 'BookingRepoQuery', useClass: PrismaBookingQueryRepo },
    GetMyBookingsQueryHandler,
    GetBookingByIdHandler,
    GetBookingsByPropertyHandler,
    CreateBookingHandler,
    ChangeBookingHandler,
    BookingWorker,
    CompletedBookingEventHandler,
  ],
})
export class BookingModule {}
