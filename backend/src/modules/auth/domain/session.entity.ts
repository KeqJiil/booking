import { SessionId } from './typedId/session.id';
import { UserId } from './typedId/user.id';

export interface ISessionCreate {
  id: SessionId;
  userId: UserId;
  refreshHash: string;
  ttlMs: number;
}

export interface ISessionFromPersistence {
  id: SessionId;
  userId: UserId;
  refresh: string;
  previousRefresh: string | null;
  previousRotatedAt: number | null;
  createdAt: number;
  expiresAt: number;
}

export interface SessionPersistence {
  id: string;
  userId: string;
  refresh: string;
  previousRefresh: string | null;
  previousRotatedAt: number | null;
  createdAt: number;
  expiresAt: number;
}

export class Session {
  private grace = 30 * 60 * 1000;
  constructor(
    public readonly id: SessionId,
    public readonly userId: UserId,
    private readonly refreshHash: string,
    private readonly previousRefreshHash: string | null,
    private readonly previousRotatedAt: number | null,
    public readonly createdAt: number,
    public readonly expiresAt: number,
  ) {}

  private get rawId() {
    return this.id.id;
  }

  private get rawUserId() {
    return this.userId.id;
  }

  static create(props: ISessionCreate) {
    const now = Date.now();
    return new Session(
      props.id,
      props.userId,
      props.refreshHash,
      null,
      null,
      now,
      now + props.ttlMs,
    );
  }

  static fromPersistence(raw: ISessionFromPersistence) {
    return new Session(
      raw.id,
      raw.userId,
      raw.refresh,
      raw.previousRefresh,
      raw.previousRotatedAt,
      raw.createdAt,
      raw.expiresAt,
    );
  }

  public toPersistence(): SessionPersistence {
    return {
      id: this.rawId,
      userId: this.rawUserId,
      refresh: this.refreshHash,
      previousRefresh: this.previousRefreshHash,
      previousRotatedAt: this.previousRotatedAt,
      createdAt: this.createdAt,
      expiresAt: this.expiresAt,
    };
  }

  public rotate(newHash: string) {
    return new Session(
      this.id,
      this.userId,
      newHash,
      this.refreshHash,
      Date.now(),
      this.createdAt,
      this.expiresAt,
    );
  }

  public isInGrace(now: number, tokenHash: string) {
    if (tokenHash !== this.previousRefreshHash || !this.previousRotatedAt) {
      return false;
    }
    return now - this.previousRotatedAt < this.grace;
  }

  public isExpired(now: number = Date.now()): boolean {
    return now > this.expiresAt;
  }
}
