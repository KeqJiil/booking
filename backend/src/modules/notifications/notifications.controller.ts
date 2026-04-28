import { Controller, Sse } from '@nestjs/common';
import { NotificationsService } from './app/notifications.service';
import { Authorization } from 'src/common/decorators/authorization.decorator';
import { AccessInfo } from 'src/common/decorators/accessInfo.decorator';

@Authorization('USER')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Sse('all')
  getNotifications(@AccessInfo('id') id: string) {
    return this.service.getNotifications(id);
  }
}
