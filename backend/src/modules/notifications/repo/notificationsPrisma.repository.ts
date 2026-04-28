import { Injectable } from '@nestjs/common';
import {
  INotificationForDb,
  INotificationsRepo,
} from '../interfaces/notificationsRepository.interface';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class PrismaNotificationsRepo implements INotificationsRepo {
  constructor(private readonly prisma: PrismaService) {}

  async createNotification(data: INotificationForDb): Promise<void> {
    await this.prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        text: '',
        payload: data.payload,
      },
    });
  }
}
