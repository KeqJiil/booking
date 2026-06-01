import { Session } from './session.entity';
import { SessionId } from '../typedId/session.id';
import { UserId } from '../typedId/user.id';

describe('Session', () => {
  const sessionId = new SessionId('session-uuid-1');
  const userId = new UserId('user-uuid-1');
  const TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
  const GRACE_MS = 30 * 60 * 1000; // 30 min

  const now = 1_700_000_000_000;

  function makeSession(hash = 'hash_abc', at = now) {
    return Session.create(
      { id: sessionId, userId, refreshHash: hash, ttlMs: TTL_MS },
      at,
    );
  }

  describe('create()', () => {
    it('should set createdAt and expiresAt from now + ttl', () => {
      const session = makeSession();
      expect(session.createdAt).toBe(now);
      expect(session.expiresAt).toBe(now + TTL_MS);
    });

    it('should have null previousRefresh after creation', () => {
      const { previousRefresh } = makeSession().toPersistence();
      expect(previousRefresh).toBeNull();
    });
  });

  describe('fromPersistence()', () => {
    it('should restore all fields correctly', () => {
      const raw = {
        id: sessionId,
        userId,
        refresh: 'current_hash',
        previousRefresh: 'prev_hash',
        previousRotatedAt: now - 1000,
        createdAt: now - 5000,
        expiresAt: now + TTL_MS,
      };
      const session = Session.fromPersistence(raw);
      const p = session.toPersistence();
      expect(p.refresh).toBe('current_hash');
      expect(p.previousRefresh).toBe('prev_hash');
      expect(p.previousRotatedAt).toBe(now - 1000);
      expect(p.createdAt).toBe(now - 5000);
      expect(p.expiresAt).toBe(now + TTL_MS);
    });
  });

  describe('toPersistence()', () => {
    it('should serialize ids as strings', () => {
      const session = makeSession();
      const p = session.toPersistence();
      expect(p.id).toBe(sessionId.id);
      expect(p.userId).toBe(userId.id);
    });
  });

  describe('rotate()', () => {
    it('should set new hash as current and old hash as previousRefresh', () => {
      const session = makeSession('old_hash');
      const rotated = session.rotate('new_hash', now);
      expect(rotated.checkHash('new_hash')).toBe(true);
      expect(rotated.toPersistence().previousRefresh).toBe('old_hash');
    });

    it('should record the passed-in timestamp as previousRotatedAt', () => {
      const rotated = makeSession().rotate('new_hash', now);
      expect(rotated.toPersistence().previousRotatedAt).toBe(now);
    });

    it('should only keep one level of history (not chain previous hashes)', () => {
      const s1 = makeSession('hash_1');
      const s2 = s1.rotate('hash_2', now);
      const s3 = s2.rotate('hash_3', now + 1000);
      // s3 remembers hash_2 as previous, hash_1 is gone
      expect(s3.toPersistence().previousRefresh).toBe('hash_2');
    });

    it('should preserve id, userId, createdAt and expiresAt', () => {
      const session = makeSession();
      const rotated = session.rotate('new_hash', now);
      expect(rotated.id).toBe(sessionId);
      expect(rotated.userId).toBe(userId);
      expect(rotated.createdAt).toBe(session.createdAt);
      expect(rotated.expiresAt).toBe(session.expiresAt);
    });
  });

  describe('checkHash()', () => {
    it('should return true for the correct hash', () => {
      expect(makeSession('abc').checkHash('abc')).toBe(true);
    });

    it('should return false for an incorrect hash', () => {
      expect(makeSession('abc').checkHash('xyz')).toBe(false);
    });
  });

  describe('isInGrace()', () => {
    it('should return true when previous hash matches and within 30-min grace', () => {
      const rotatedAt = now - 5 * 60 * 1000; // 5 min ago
      const session = Session.fromPersistence({
        id: sessionId,
        userId,
        refresh: 'new_hash',
        previousRefresh: 'old_hash',
        previousRotatedAt: rotatedAt,
        createdAt: now - 1000,
        expiresAt: now + TTL_MS,
      });
      expect(session.isInGrace(now, 'old_hash')).toBe(true);
    });

    it('should return false after grace period expires', () => {
      const rotatedAt = now - 31 * 60 * 1000; // 31 min ago
      const session = Session.fromPersistence({
        id: sessionId,
        userId,
        refresh: 'new_hash',
        previousRefresh: 'old_hash',
        previousRotatedAt: rotatedAt,
        createdAt: now - 1000,
        expiresAt: now + TTL_MS,
      });
      expect(session.isInGrace(now, 'old_hash')).toBe(false);
    });

    it('should return false when hash does not match previousRefresh', () => {
      const session = Session.fromPersistence({
        id: sessionId,
        userId,
        refresh: 'new_hash',
        previousRefresh: 'old_hash',
        previousRotatedAt: now - 1000,
        createdAt: now - 1000,
        expiresAt: now + TTL_MS,
      });
      expect(session.isInGrace(now, 'different_hash')).toBe(false);
    });

    it('should return false when previousRotatedAt is null (fresh session)', () => {
      const session = makeSession();
      expect(session.isInGrace(now, 'hash_abc')).toBe(false);
    });
  });

  describe('isExpired()', () => {
    it('should return false before expiry', () => {
      const session = makeSession('hash', now);
      expect(session.isExpired(now + 1000)).toBe(false);
    });

    it('should return true after expiry', () => {
      const session = makeSession('hash', now);
      expect(session.isExpired(now + TTL_MS + 1)).toBe(true);
    });

    it('should return false at the exact expiry boundary (strict >)', () => {
      const session = makeSession('hash', now);
      // isExpired uses `now > expiresAt`, so exact boundary is still valid
      expect(session.isExpired(now + TTL_MS)).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('checkHash() returns false for an empty string when hash is set', () => {
      expect(makeSession('abc').checkHash('')).toBe(false);
    });

    it('isInGrace() returns false when previousRefreshHash is null even if hashes would match', () => {
      const session = makeSession('abc');
      expect(session.isInGrace(now, '')).toBe(false);
    });
  });
});
