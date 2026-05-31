import { Inject, Injectable } from '@nestjs/common';
import { RedisService } from 'src/infrastructure/redis/redis.service';
import {
  Session,
  SessionPersistence,
} from '../../domain/entity/session.entity';
import { SessionMapper } from '../../application/mapper/session.mapper';
import { UserId } from '../../domain/typedId/user.id';
import { SessionId } from '../../domain/typedId/session.id';
import { REDIS } from 'src/common/constants/providerConstants';
import { SessionRepository } from '../../domain/repository/sessionRepository.interface';

@Injectable()
export class RedisSessionRepository implements SessionRepository {
  constructor(@Inject(REDIS) private readonly redis: RedisService) {}

  async save(session: Session): Promise<void> {
    const rawSession = SessionMapper.toPersist(session);
    const sessionName = `session:${rawSession.id}`;
    const cacheUser = `user:session:${rawSession.userId}`;
    const ex = rawSession.expiresAt - Date.now() / 1000;
    const tx = this.redis.raw().multi();
    tx.set(sessionName, JSON.stringify(rawSession), 'EX', ex);
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
}
