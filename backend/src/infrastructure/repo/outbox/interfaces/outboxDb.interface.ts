import { IOutboxStatuses } from './outbox.interface';
import { TypedId } from '../../../../common/typedId/typedID.generic';

export interface IOutboxDb<T, TPayload, TID> {
  id: string;
  itemId: TID;
  type: T;
  payload: TPayload;
  status: IOutboxStatuses;
  retries: number;
  processingAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type IOutboxSerialized<
  T extends string,
  TPayload extends object,
  TID extends typeof TypedId,
> = Omit<IOutboxDb<T, TPayload, TID>, 'type' | 'payload' | 'itemId'>;
