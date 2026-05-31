import { ConfigService } from '@nestjs/config';
import { IHasherService } from '../../application/abstractions/hashed.interface';
import { createHash } from 'crypto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class Sha256HashService implements IHasherService {
  constructor(private readonly config: ConfigService) {}

  hash(item: string) {
    return createHash('sha256').update(item).digest('hex');
  }
}
