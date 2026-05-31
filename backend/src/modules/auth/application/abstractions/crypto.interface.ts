export interface ICrypto {
  crypto(item: string): Promise<string>;
  compare(item: string, crypted: string): Promise<boolean>;
}
