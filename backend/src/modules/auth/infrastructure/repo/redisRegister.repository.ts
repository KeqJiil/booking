import { Inject, Injectable } from '@nestjs/common';
import { IRegisterRepository } from '../../domain/repository/registerFlow.interface';
import { UserId } from '../../domain/typedId/user.id';
import { IRegisterData } from '../../types';
import { REDIS } from 'src/common/constants/providerConstants';
import { RedisService } from 'src/infrastructure/redis/redis.service';
import { randomUUID } from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisRegisterRepository implements IRegisterRepository {
  private readonly ttl: number;
  constructor(
    @Inject(REDIS) private readonly redis: RedisService,
    private readonly config: ConfigService,
  ) {
    this.ttl = Number(this.config.getOrThrow('TTL_CACHE'));
  }

  async save(userId: UserId): Promise<void> {
    const uuid = randomUUID();
    const cacheData: IRegisterData = {
      uuid,
      userId: userId.id,
    };
    await this.redis.set(`user:${uuid}`, cacheData, this.ttl);
  }

  async getById(uuid: string): Promise<IRegisterData | null> {
    return await this.redis.getdel<IRegisterData>(`user:${uuid}`);
  }
}
