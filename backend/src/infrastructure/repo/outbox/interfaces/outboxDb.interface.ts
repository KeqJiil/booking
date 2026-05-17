import { IOutboxStatuses, IOutboxTypes } from './outbox.interface';

export interface IOutboxDb {
  id: string;
  itemId: string;
  type: IOutboxTypes;
  payload: any;
  status: IOutboxStatuses;
  retries: number;
  processingAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
