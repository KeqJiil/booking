export type TOptionsTransaction = {
  maxWait?: number;
  timeout?: number;
  isolationLevel?:
    | 'ReadUncommitted'
    | 'ReadCommitted'
    | 'RepeatableRead'
    | 'Serializable';
};

export interface ITransactionRepo {
  startTransaction(
    fn: (tx: unknown) => Promise<void>,
    options?: TOptionsTransaction,
  ): Promise<void>;
}
