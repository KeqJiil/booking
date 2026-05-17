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

export interface IOutboxData {
  itemId: string;
  type: IOutboxTypes;
  payload: Record<any, any>;
  status: IOutboxStatuses;
  retries: number;
  processingAt?: Date;
}

export type IOutboxDataView = IOutboxData & { id: string };

export interface IOutboxRepository<TTx> {
  createOutbox(data: IOutboxData, tx: TTx): Promise<IOutboxDataView>;
  markProcessing(id: string, tx: TTx): Promise<IOutboxDataView>;
  markFailed(id: string, tx: TTx): Promise<IOutboxDataView>;
  markSucceeded(id: string, tx: TTx): Promise<IOutboxDataView>;
  incrementRetries(id: string, tx: TTx): Promise<IOutboxDataView>;
}
