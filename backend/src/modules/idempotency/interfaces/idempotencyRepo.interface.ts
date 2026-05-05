export interface IIdempotencyRepo {
  find(key: string, tx: unknown): Promise<any>;
  create(key: string, userId: string, tx: unknown): Promise<string>;
  addInfo(
    key: string,
    statusCode: number,
    data: any,
    tx: unknown,
  ): Promise<void>;
  delete(): Promise<void>;
}
