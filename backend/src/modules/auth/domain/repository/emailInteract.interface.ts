export interface IEmailInteractRepository<T> {
  save(key: string, data: T): Promise<void>;
  findById(key: string): Promise<T | null>;
  deleteKey(key: string): Promise<void>;
}
