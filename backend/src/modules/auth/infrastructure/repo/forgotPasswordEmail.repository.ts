import { Inject, Injectable } from '@nestjs/common';
import { IEmailInteractRepository } from '../../domain/repository/emailInteract.interface';
import { IForgotPasswordPayload } from '../../application/abstractions/forgotPasswordPayload.interface';
import {
  EMAIL_FORGOT_PASSWORD_TTL,
  REDIS,
} from 'src/common/constants/providerConstants';
import { RedisService } from 'src/infrastructure/redis/redis.service';

@Injectable()
export class ForgotPasswordEmailRepository implements IEmailInteractRepository<IForgotPasswordPayload> {
  constructor(
    @Inject(REDIS) private readonly redis: RedisService,
    @Inject(EMAIL_FORGOT_PASSWORD_TTL) private readonly ttl: number,
  ) {}

  async save(key: string, data: IForgotPasswordPayload): Promise<void> {
    const fullKey = `forgot:${key}`;
    await this.redis.set(fullKey, data, this.ttl);
  }

  async findById(key: string): Promise<IForgotPasswordPayload | null> {
    const fullKey = `forgot:${key}`;
    return await this.redis.get<IForgotPasswordPayload>(fullKey);
  }

  async deleteKey(key: string): Promise<void> {
    const fullKey = `forgot:${key}`;
    await this.redis.del(fullKey);
  }
}
