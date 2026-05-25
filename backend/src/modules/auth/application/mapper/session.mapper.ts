import {
  ISessionFromPersistence,
  Session,
  type SessionPersistence,
} from '../../domain/session.entity';
import { SessionId } from '../../domain/typedId/session.id';
import { UserId } from '../../domain/typedId/user.id';

export class SessionMapper {
  public static toDomain(rawData: SessionPersistence): Session {
    const userId = new UserId(rawData.userId);
    const sessionId = new SessionId(rawData.id);
    const data: ISessionFromPersistence = { ...rawData, userId, id: sessionId };
    return Session.fromPersistence(data);
  }

  public static toPersist(session: Session): SessionPersistence {
    return session.toPersistence();
  }
}
