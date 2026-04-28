import { Inject, Injectable } from '@nestjs/common';
import type {
  INotificationForDb,
  INotificationsRepo,
} from '../interfaces/notificationsRepository.interface';
import { filter, Observable, Subject } from 'rxjs';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { eventNames } from 'process';
import { IEventNames } from 'src/common/constants/eventnames';

@Injectable()
export class NotificationsService {
  private readonly subject = new Subject<INotificationForDb>();
  constructor(
    @Inject('INotificationsRepo') private readonly repo: INotificationsRepo,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.eventEmitter.onAny((eventName: string | string[], payload: any) => {
      const type = (
        Array.isArray(eventName) ? eventName[0] : eventName
      ) as IEventNames;
      if (!Object.values(eventNames).includes(type)) return;
      const data = { type, userId: payload.userId, payload };
      this.repo.createNotification(data);
      this.subject.next(data);
    });
  }

  getNotifications(userId: string): Observable<any> {
    return this.subject
      .asObservable()
      .pipe(filter((data) => userId === data.userId));
  }
}
