import { Injectable } from '@nestjs/common';
import { ICrypto } from '../../application/abstractions/crypto.interface';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CryptoBcryptService implements ICrypto {
  constructor(private readonly saltRounds: number) {}

  async crypto(item: string): Promise<string> {
    return await bcrypt.hash(item, this.saltRounds);
  }

  async compare(item: string, crypted: string): Promise<boolean> {
    return await bcrypt.compare(item, crypted);
  }
}
