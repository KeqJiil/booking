import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  constructor(@Inject('REDIS') private readonly redis: Redis) {}

  async get<T>(key: string): Promise<T | null> {
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  set<T>(key: string, value: T, ttl?: number) {
    const val = JSON.stringify(value);
    return ttl ? this.redis.set(key, val, 'EX', ttl) : this.redis.set(key, val);
  }

  async getdel<T>(key: string): Promise<T | null> {
    const data = await this.redis.getdel(key);
    return data ? JSON.parse(data) : null;
  }

  del(key: string) {
    return this.redis.del(key);
  }
}
