export interface IIdempotencyRepo {
  create(key: string, userId: string, tx: unknown): Promise<void>;
  addInfo(statusCode: number, data: any, tx: unknown): Promise<void>;
  delete(): Promise<void>;
}
