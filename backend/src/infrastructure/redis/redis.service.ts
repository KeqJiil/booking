import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  constructor(@Inject('REDIS') private readonly redis: Redis) {}

  async get<T>(key: string): Promise<T | null> {
    const data = await this.redis.get(key);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return data as T;
    }
  }

  set<T>(key: string, value: T, ttl?: number) {
    const val = JSON.stringify(value);
    return ttl ? this.redis.set(key, val, 'EX', ttl) : this.redis.set(key, val);
  }

  async getdel<T>(key: string): Promise<T | null> {
    const data = await this.redis.getdel(key);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return data as T;
    }
  }

  del(key: string) {
    return this.redis.del(key);
  }

  async sadd(key: string, ...members: unknown[]) {
    const val = members.map((el) =>
      typeof el === 'string' ? el : JSON.stringify(el),
    );
    await this.redis.sadd(key, ...val);
  }

  async smembers(key: string) {
    return await this.redis.smembers(key);
  }

  async srem(key: string, ...members: unknown[]) {
    const val = members.map((el) =>
      typeof el === 'string' ? el : JSON.stringify(el),
    );
    return await this.redis.srem(key, ...val);
  }

  async expire(key: string, ttl: number) {
    return await this.redis.expire(key, ttl);
  }

  raw() {
    return this.redis;
  }
}
