import { Module } from '@nestjs/common';
import { BookingController } from './booking.controller';
import { TransactionRepo } from '../../infrastructure/repo/transactions/repo/Transaction.repository';
import { PrismaBookingRepo } from './infrastructure/repo/PrismaBooking.repository';
import { PrismaBookingQueryRepo } from './infrastructure/repo/PrismaBookingQuery.repository';
import { GetMyBookingsQueryHandler } from './application/queries/getMyBookings.query';
import { GetBookingByIdHandler } from './application/queries/getBookingById.query';
import { GetBookingsByPropertyHandler } from './application/queries/getBookingsByProperty.query';
import { CreateBookingHandler } from './application/commands/create-booking.handler';
import { ExpireBookingHandler } from './application/commands/expire-status.handler';
import { PrismaModule } from 'src/database/prisma.module';
import { BookingWorker } from './infrastructure/bullmq/expired.worker';
import { CompletedBookingEventHandler } from './application/events/completedEvent.handler';
import { BookingStatusChangedHandler } from './application/events/statusChanged.handler';
import { PropertyProviderAdapter } from './infrastructure/adapters/propertyProvider.adapter';
import { CancelBookingHandler } from './application/commands/cancel-status.handler';
import { CompleteBookingStatusHandler } from './application/commands/complete-status.handler';
import { ConfirmBookingStatusHandler } from './application/commands/confirm-status.handler';
import { PayBookingStatusHandler } from './application/commands/pay-status.handler';
import { RejectBookingStatusHandler } from './application/commands/reject-status.handler';

@Module({
  imports: [PrismaModule],
  controllers: [BookingController],
  providers: [
    { provide: 'TransactionRepo', useClass: TransactionRepo },
    { provide: 'BookingRepo', useClass: PrismaBookingRepo },
    { provide: 'BookingRepoQuery', useClass: PrismaBookingQueryRepo },
    GetMyBookingsQueryHandler,
    GetBookingByIdHandler,
    GetBookingsByPropertyHandler,
    CreateBookingHandler,
    BookingWorker,
    CompletedBookingEventHandler,
    BookingStatusChangedHandler,
    CancelBookingHandler,
    CompleteBookingStatusHandler,
    ConfirmBookingStatusHandler,
    ExpireBookingHandler,
    PayBookingStatusHandler,
    RejectBookingStatusHandler,
    { provide: 'PropertyAdapter', useClass: PropertyProviderAdapter },
  ],
})
export class BookingModule {}
