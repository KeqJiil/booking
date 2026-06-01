import { RefreshCommandHandler } from './refreshSession.handler';
import { RefreshCommand } from '../auth.commands';
import { SessionRepository } from '../../../domain/repository/sessionRepository.interface';
import {
  IAccessTokenPayload,
  IRefreshTokenPayload,
} from '../../abstractions/tokenPayload.interface';
import { ITokenIssuerService } from '../../abstractions/TokenIssuer.interface';
import { IHasherService } from '../../abstractions/hashed.interface';
import { UserService } from 'src/modules/user/user.service';
import { UnauthorizedException } from '@nestjs/common';
import { Session } from '../../../domain/entity/session.entity';
import { SessionId } from '../../../domain/typedId/session.id';
import { UserId } from '../../../domain/typedId/user.id';

describe('RefreshCommandHandler', () => {
  let handler: RefreshCommandHandler;
  let sessionRepo: jest.Mocked<SessionRepository>;
  let tokenIssuerRefresh: jest.Mocked<
    ITokenIssuerService<IRefreshTokenPayload>
  >;
  let tokenIssuerAccess: jest.Mocked<ITokenIssuerService<IAccessTokenPayload>>;
  let hasher: jest.Mocked<IHasherService>;
  let userService: jest.Mocked<UserService>;
  const logger = { log: jest.fn(), warn: jest.fn(), error: jest.fn() } as any;

  const SESSION_ID = 'session-uuid-1';
  const USER_ID = 'user-uuid-1';
  const ROLE = 'USER';
  const RAW_TOKEN = 'raw_refresh_token';
  const TOKEN_HASH = 'sha256_of_token';
  const TTL = 7 * 24 * 60 * 60 * 1000;

  function makeActiveSession(hash = TOKEN_HASH) {
    return Session.create(
      {
        id: new SessionId(SESSION_ID),
        userId: new UserId(USER_ID),
        refreshHash: hash,
        ttlMs: TTL,
      },
      Date.now(),
    );
  }

  beforeEach(() => {
    sessionRepo = {
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
      findAllByUserId: jest.fn(),
      delete: jest.fn(),
      deleteAllByUserId: jest.fn().mockResolvedValue(1),
    };
    tokenIssuerRefresh = {
      verify: jest.fn().mockResolvedValue({
        userId: USER_ID,
        sessionId: SESSION_ID,
        role: ROLE,
      }),
      sign: jest.fn().mockResolvedValue('new_refresh_token'),
      getData: jest.fn(),
    };
    tokenIssuerAccess = {
      sign: jest.fn().mockResolvedValue('new_access_token'),
      verify: jest.fn(),
      getData: jest.fn(),
    };
    hasher = { hash: jest.fn().mockReturnValue(TOKEN_HASH) };
    userService = {
      getUserById: jest.fn().mockResolvedValue({ status: 'ALIVE' }),
    } as any;

    handler = new RefreshCommandHandler(
      sessionRepo,
      tokenIssuerRefresh,
      tokenIssuerAccess,
      hasher,
      logger,
      userService,
    );
  });

  afterEach(() => jest.clearAllMocks());

  describe('happy path', () => {
    it('should return new access and refresh tokens', async () => {
      sessionRepo.findById.mockResolvedValue(makeActiveSession());

      const result = await handler.execute(new RefreshCommand(RAW_TOKEN));

      expect(result).toEqual({
        access: 'new_access_token',
        refresh: 'new_refresh_token',
      });
    });

    it('should rotate and save the session', async () => {
      sessionRepo.findById.mockResolvedValue(makeActiveSession());

      await handler.execute(new RefreshCommand(RAW_TOKEN));

      expect(sessionRepo.save).toHaveBeenCalledTimes(1);
    });
  });

  describe('failure cases', () => {
    it('should throw UnauthorizedException when session is not found', async () => {
      sessionRepo.findById.mockResolvedValue(null);

      await expect(
        handler.execute(new RefreshCommand(RAW_TOKEN)),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when session is expired', async () => {
      const expiredSession = Session.create(
        {
          id: new SessionId(SESSION_ID),
          userId: new UserId(USER_ID),
          refreshHash: TOKEN_HASH,
          ttlMs: -1000,
        },
        Date.now() - 2000,
      );
      sessionRepo.findById.mockResolvedValue(expiredSession);

      await expect(
        handler.execute(new RefreshCommand(RAW_TOKEN)),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when user is deleted', async () => {
      sessionRepo.findById.mockResolvedValue(makeActiveSession());
      userService.getUserById.mockResolvedValue({ status: 'DELETED' } as any);

      await expect(
        handler.execute(new RefreshCommand(RAW_TOKEN)),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      sessionRepo.findById.mockResolvedValue(makeActiveSession());
      userService.getUserById.mockResolvedValue(null);

      await expect(
        handler.execute(new RefreshCommand(RAW_TOKEN)),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('token reuse detection', () => {
    it('should delete all user sessions and throw on hash mismatch', async () => {
      sessionRepo.findById.mockResolvedValue(
        makeActiveSession('different_hash'),
      );

      await expect(
        handler.execute(new RefreshCommand(RAW_TOKEN)),
      ).rejects.toThrow(UnauthorizedException);

      expect(sessionRepo.deleteAllByUserId).toHaveBeenCalledTimes(1);
      expect(sessionRepo.save).not.toHaveBeenCalled();
    });

    it('should delete all user sessions on reuse and not save a new session', async () => {
      sessionRepo.findById.mockResolvedValue(
        makeActiveSession('completely_different_hash'),
      );

      await expect(
        handler.execute(new RefreshCommand(RAW_TOKEN)),
      ).rejects.toThrow(UnauthorizedException);

      expect(sessionRepo.save).not.toHaveBeenCalled();
      expect(sessionRepo.deleteAllByUserId).toHaveBeenCalledTimes(1);
    });

    it('should allow refresh when token is within the grace period', async () => {
      const now = Date.now();
      const rotatedAt = now - 5 * 60 * 1000;
      const session = Session.fromPersistence({
        id: new SessionId(SESSION_ID),
        userId: new UserId(USER_ID),
        refresh: 'current_hash',
        previousRefresh: TOKEN_HASH,
        previousRotatedAt: rotatedAt,
        createdAt: now - 1000,
        expiresAt: now + TTL,
      });
      sessionRepo.findById.mockResolvedValue(session);

      const result = await handler.execute(new RefreshCommand(RAW_TOKEN));

      expect(result).toEqual({
        access: 'new_access_token',
        refresh: 'new_refresh_token',
      });
      expect(sessionRepo.deleteAllByUserId).not.toHaveBeenCalled();
    });
  });
});
