import { Session } from '../domain/session.entity';
import { SessionId } from '../domain/typedId/session.id';
import { UserId } from '../domain/typedId/user.id';

export interface SessionRepository {
  save(session: Session): Promise<void>;
  findById(id: SessionId): Promise<Session | null>;
  findAllByUserId(userId: UserId): Promise<Session[]>;
  delete(id: SessionId, userId: UserId): Promise<void>;
  deleteAllByUserId(userId: UserId): Promise<number>;
  graceToken(token: string, sessionId: SessionId, ttl?: number): Promise<void>;
  findGrace(token: string, sessionId: SessionId): Promise<string | null>;
}
