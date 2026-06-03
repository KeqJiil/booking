export const outboxStatuses = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  SUCCEEDED: 'SUCCEEDED',
  FAILED: 'FAILED',
} as const;

export type IOutboxStatuses =
  (typeof outboxStatuses)[keyof typeof outboxStatuses];

export const outboxTypes = {
  REFUND_REQUEST: 'REFUND_REQUEST',
} as const;

export type IOutboxTypes = (typeof outboxTypes)[keyof typeof outboxTypes];

export interface IOutboxData<T, TPayload, TID> {
  itemId: TID;
  type: T;
  payload: TPayload;
  status: IOutboxStatuses;
  retries: number;
  processingAt?: Date;
}

export type IOutboxDataView<T, TPayload, TID> = IOutboxData<
  T,
  TPayload,
  TID
> & { id: string };

export interface IOutboxRepository<TTx, T, TPayload, TID> {
  createOutbox(
    data: IOutboxData<T, TPayload, TID>,
    tx: TTx,
  ): Promise<IOutboxDataView<T, TPayload, TID>>;
  getOutbox(
    status?: IOutboxStatuses,
  ): Promise<IOutboxDataView<T, TPayload, TID>[]>;
  getExpiredProcessing(tx: TTx): Promise<IOutboxDataView<T, TPayload, TID>[]>;
  markProcessing(
    id: string,
    tx: TTx,
  ): Promise<IOutboxDataView<T, TPayload, TID>>;
  markFailed(id: string, tx: TTx): Promise<IOutboxDataView<T, TPayload, TID>>;
  markSucceeded(
    id: string,
    tx: TTx,
  ): Promise<IOutboxDataView<T, TPayload, TID>>;
  incrementRetries(
    id: string,
    tx: TTx,
  ): Promise<IOutboxDataView<T, TPayload, TID>>;
}
