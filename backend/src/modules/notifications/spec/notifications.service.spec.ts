import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotificationsService } from '../app/notifications.service';
import type { INotificationsRepo } from '../interfaces/notificationsRepository.interface';
import { eventNames } from 'src/common/constants/eventnames';
import { firstValueFrom, take } from 'rxjs';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let repo: jest.Mocked<INotificationsRepo>;
  let eventEmitter: EventEmitter2;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: 'INotificationsRepo',
          useValue: createMock<INotificationsRepo>(),
        },
        {
          provide: EventEmitter2,
          useValue: new EventEmitter2(),
        },
      ],
    }).compile();

    service = module.get(NotificationsService);
    repo = module.get('INotificationsRepo');
    eventEmitter = module.get(EventEmitter2);

    jest.clearAllMocks();
  });

  describe('onAny listener', () => {
    it('valid eventName → createNotification is called with type, userId, payload', () => {
      const payload = { userId: 'user-1', someData: 'test' };

      eventEmitter.emit(eventNames.booking_created, payload);

      expect(repo.createNotification).toHaveBeenCalledWith({
        type: eventNames.booking_created,
        userId: 'user-1',
        payload,
      });
    });

    it('invalid eventName → createNotification was not called', () => {
      eventEmitter.emit('unknown:custom:event', { userId: 'user-1' });

      expect(repo.createNotification).not.toHaveBeenCalled();
    });

    it('payload without userId → createNotification called with userId: undefined', () => {
      const payload = { someData: 'test' };

      eventEmitter.emit(eventNames.booking_created, payload);

      expect(repo.createNotification).toHaveBeenCalledWith({
        type: eventNames.booking_created,
        userId: undefined,
        payload,
      });
    });
  });

  describe('getNotifications(userId)', () => {
    it('event with similar userId → Observable get data', async () => {
      const payload = { userId: 'user-1', someData: 'test' };

      const promise = firstValueFrom(
        service.getNotifications('user-1').pipe(take(1)),
      );
      eventEmitter.emit(eventNames.booking_created, payload);

      const result = await promise;
      expect(result).toEqual({
        type: eventNames.booking_created,
        userId: 'user-1',
        payload,
      });
    });

    it('event with another userId → Observable does not get data', () => {
      const received: any[] = [];
      service
        .getNotifications('user-1')
        .subscribe((data) => received.push(data));

      eventEmitter.emit(eventNames.booking_created, {
        userId: 'user-2',
        someData: 'test',
      });

      expect(received).toHaveLength(0);
    });

    it('few events → each subscriber get its own', () => {
      const receivedByUser1: any[] = [];
      const receivedByUser2: any[] = [];

      service
        .getNotifications('user-1')
        .subscribe((data) => receivedByUser1.push(data));
      service
        .getNotifications('user-2')
        .subscribe((data) => receivedByUser2.push(data));

      eventEmitter.emit(eventNames.booking_created, {
        userId: 'user-1',
        event: 'for-1',
      });
      eventEmitter.emit(eventNames.new_review_created, {
        userId: 'user-2',
        event: 'for-2',
      });

      expect(receivedByUser1).toHaveLength(1);
      expect(receivedByUser1[0].userId).toBe('user-1');
      expect(receivedByUser2).toHaveLength(1);
      expect(receivedByUser2[0].userId).toBe('user-2');
    });
  });
});
