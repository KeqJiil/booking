export interface ITransactionRepo {
  startTransaction<T>(fn: (tx: unknown) => Promise<T>): Promise<T>;
}
