import { Inject, Injectable } from '@nestjs/common';
import { RedisService } from 'src/infrastructure/redis/redis.service';
import { SessionRepository } from './sessionRepository.interface';
import { Session, SessionPersistence } from '../domain/session.entity';
import { SessionMapper } from '../application/mapper/session.mapper';
import { UserId } from '../domain/typedId/user.id';
import { SessionId } from '../domain/typedId/session.id';
import { REDIS } from 'src/common/constants/providerConstants';

@Injectable()
export class RedisSessionRepository implements SessionRepository {
  constructor(@Inject(REDIS) private readonly redis: RedisService) {}

  async save(session: Session, ttl?: number): Promise<void> {
    const rawSession = SessionMapper.toPersist(session);
    const sessionName = `session:${rawSession.id}`;
    const cacheUser = `user:session:${rawSession.userId}`;
    const tx = this.redis.raw().multi();
    if (ttl !== undefined) {
      tx.set(sessionName, JSON.stringify(rawSession), 'EX', ttl);
    } else {
      tx.set(sessionName, JSON.stringify(rawSession));
    }
    tx.sadd(cacheUser, rawSession.id);
    await tx.exec();
  }

  async findById(id: SessionId): Promise<Session | null> {
    const sessionName = `session:${id.id}`;
    const rawSession = await this.redis.get<SessionPersistence>(sessionName);
    if (!rawSession) return null;
    return SessionMapper.toDomain(rawSession);
  }

  async findAllByUserId(userId: UserId): Promise<Session[]> {
    const cacheUser = `user:session:${userId.id}`;
    const sessions = await this.redis.smembers(cacheUser);
    const promises = sessions.map((el) => {
      const sessionId = new SessionId(el);
      return this.findById(sessionId);
    });
    const result = await Promise.all(promises);
    const expired = sessions.filter((_, i) => result[i] === null);
    if (expired.length > 0) {
      await this.redis.srem(cacheUser, ...expired);
    }
    return result.filter((el) => !!el);
  }

  async delete(id: SessionId, userId: UserId): Promise<void> {
    const sessionName = `session:${id.id}`;
    const cacheUser = `user:session:${userId.id}`;
    await this.redis.srem(cacheUser, id.id);
    await this.redis.del(sessionName);
  }

  async deleteAllByUserId(userId: UserId): Promise<number> {
    const sessions = await this.redis.smembers(`user:session:${userId.id}`);
    const tx = this.redis.raw().multi();
    for (const s of sessions) {
      const key = `session:${s}`;
      tx.del(key);
    }
    tx.del(`user:session:${userId.id}`);
    await tx.exec();
    return sessions.length;
  }

  async graceToken(
    token: string,
    sessionId: SessionId,
    ttl?: number,
  ): Promise<void> {
    await this.redis.set(`grace:${sessionId.id}:${token}`, token, ttl);
  }

  async findGrace(token: string, sessionId: SessionId): Promise<string | null> {
    return await this.redis.get(`grace:${sessionId.id}:${token}`);
  }
}
