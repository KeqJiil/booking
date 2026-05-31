export interface ITokenIssuerService<T> {
  getData(token: string): T | Promise<T>;
  verify(token: string): Promise<T>;
  sign(payload: T): Promise<string>;
}
