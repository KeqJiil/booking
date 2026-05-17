export interface IIdempotencyRepo<TTx> {
  find(key: string, tx: TTx): Promise<any>;
  create(key: string, userId: string, tx: TTx): Promise<string>;
  addInfo(key: string, statusCode: number, data: any, tx: TTx): Promise<void>;
  delete(): Promise<void>;
}
