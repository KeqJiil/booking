import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { PrismaNotificationsRepo } from './repo/notificationsPrisma.repository';
import { NotificationsService } from './app/notifications.service';

@Module({
  controllers: [NotificationsController],
  providers: [
    { provide: 'INotificationsRepo', useClass: PrismaNotificationsRepo },
    NotificationsService,
  ],
})
export class NotificationsModule {}
