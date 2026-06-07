import { Controller, Sse } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { NotificationsService } from './app/notifications.service';
import { Authorization } from 'src/common/decorators/authorization.decorator';
import { AccessInfo } from 'src/common/decorators/accessInfo.decorator';

@ApiTags('Notifications')
@ApiBearerAuth()
@Authorization('USER')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @ApiOperation({
    summary:
      'Subscribe to real-time notifications via Server-Sent Events (USER)',
  })
  @ApiResponse({
    status: 200,
    description: 'SSE stream — emits notification events as they occur',
    content: {
      'text/event-stream': {
        schema: {
          type: 'string',
          example:
            'data: {"type":"BOOKING_CONFIRMED","message":"Your booking was confirmed"}\n\n',
        },
      },
    },
  })
  @Sse('all')
  getNotifications(@AccessInfo('id') id: string) {
    return this.service.getNotifications(id);
  }
}
