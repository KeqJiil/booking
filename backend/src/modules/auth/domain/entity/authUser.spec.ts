import { AuthUser } from './AuthUser';
import { AuthId } from '../typedId/auth.id';
import { UserId } from '../typedId/user.id';
import { Email } from '../VO/emailVo';
import { UserCreatedEvent } from '../events/authUser.events';
import { NotAllowedError } from 'src/common/exceptions/entityDomain.exceptions';

describe('AuthUser', () => {
  const authId = new AuthId('auth-id-1');
  const userId = new UserId('user-id-1');
  const email = Email.create('test@example.com');
  const hashedPassword = 'hashed_password_abc';

  describe('create()', () => {
    it('should create user as unverified', () => {
      const user = AuthUser.create(authId, userId, email, hashedPassword);
      expect(user.isActivated()).toBe(false);
    });

    it('should apply UserCreatedEvent', () => {
      const user = AuthUser.create(authId, userId, email, hashedPassword);
      const events = user.getUncommittedEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(UserCreatedEvent);
    });

    it('should set correct event data', () => {
      const user = AuthUser.create(authId, userId, email, hashedPassword);
      const event = user.getUncommittedEvents()[0] as UserCreatedEvent;
      expect(event.id).toBe(authId);
      expect(event.userId).toBe(userId);
      expect(event.email).toBe(email);
    });
  });

  describe('fromPersist()', () => {
    it('should restore a verified user', () => {
      const user = AuthUser.fromPersist(
        authId,
        userId,
        email,
        hashedPassword,
        true,
      );
      expect(user.isActivated()).toBe(true);
    });

    it('should restore an unverified user', () => {
      const user = AuthUser.fromPersist(
        authId,
        userId,
        email,
        hashedPassword,
        false,
      );
      expect(user.isActivated()).toBe(false);
    });

    it('should not apply any domain events', () => {
      const user = AuthUser.fromPersist(
        authId,
        userId,
        email,
        hashedPassword,
        true,
      );
      expect(user.getUncommittedEvents()).toHaveLength(0);
    });
  });

  describe('verify()', () => {
    it('should set user as activated', () => {
      const user = AuthUser.create(authId, userId, email, hashedPassword);
      user.verify();
      expect(user.isActivated()).toBe(true);
    });

    it('should throw NotAllowedError when already verified', () => {
      const user = AuthUser.fromPersist(
        authId,
        userId,
        email,
        hashedPassword,
        true,
      );
      expect(() => user.verify()).toThrow(NotAllowedError);
    });
  });

  describe('changePassword()', () => {
    it('should update the stored password', () => {
      const user = AuthUser.create(authId, userId, email, hashedPassword);
      user.changePassword('new_hashed_password');
      expect(user.password).toBe('new_hashed_password');
    });
  });

  describe('toPersist()', () => {
    it('should return the correct persistence shape', () => {
      const user = AuthUser.fromPersist(
        authId,
        userId,
        email,
        hashedPassword,
        true,
      );
      expect(user.toPersist()).toEqual({
        id: authId.toString(),
        userId: userId.toString(),
        email: email.toString(),
        password: hashedPassword,
        isVerified: true,
      });
    });
  });

  describe('getters', () => {
    it('should expose id, userId, email, password', () => {
      const user = AuthUser.create(authId, userId, email, hashedPassword);
      expect(user.id).toBe(authId);
      expect(user.userId).toBe(userId);
      expect(user.email).toBe(email);
      expect(user.password).toBe(hashedPassword);
    });
  });

  describe('edge cases', () => {
    it('verify() should throw on second call after being verified once', () => {
      const user = AuthUser.create(authId, userId, email, hashedPassword);
      user.verify();
      expect(() => user.verify()).toThrow(NotAllowedError);
    });

    it('each create() call produces an independent uncommitted event list', () => {
      const user1 = AuthUser.create(authId, userId, email, hashedPassword);
      const user2 = AuthUser.create(authId, userId, email, hashedPassword);
      user1.getUncommittedEvents();
      // user2's events are unaffected
      expect(user2.getUncommittedEvents()).toHaveLength(1);
    });

    it('toPersist() reflects password updated by changePassword()', () => {
      const user = AuthUser.create(authId, userId, email, hashedPassword);
      user.changePassword('updated_hash');
      expect(user.toPersist().password).toBe('updated_hash');
    });
  });
});
