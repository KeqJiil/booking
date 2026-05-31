export interface ICryptoService {
  crypto(item: string): Promise<string>;
  compare(item: string, crypted: string): Promise<boolean>;
}
