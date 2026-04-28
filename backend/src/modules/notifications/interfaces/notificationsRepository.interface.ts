import { IEventNames } from 'src/common/constants/eventnames';

export interface INotificationForDb {
  userId: string;
  type: IEventNames;
  payload: Record<any, any>;
}

export interface INotificationsRepo {
  createNotification(INotificationForDb): Promise<void>;
}

export type INotification = Record<any, any> & { userId: string };
