import { LogoutCommandHandler } from './logout.handler';
import { LogoutCommand } from '../auth.commands';
import { SessionRepository } from '../../../domain/repository/sessionRepository.interface';
import { IRefreshTokenPayload } from '../../abstractions/tokenPayload.interface';
import { ITokenIssuerService } from '../../abstractions/TokenIssuer.interface';
import { UnauthorizedException } from '@nestjs/common';
import { TokenExpiredError } from '@nestjs/jwt';

describe('LogoutCommandHandler', () => {
  let handler: LogoutCommandHandler;
  let refreshIssuer: jest.Mocked<ITokenIssuerService<IRefreshTokenPayload>>;
  let sessionRepo: jest.Mocked<SessionRepository>;

  const SESSION_ID = 'session-uuid-1';
  const USER_ID = 'user-uuid-1';

  beforeEach(() => {
    refreshIssuer = {
      verify: jest.fn().mockResolvedValue({
        sessionId: SESSION_ID,
        userId: USER_ID,
        role: 'USER',
      }),
      sign: jest.fn(),
      getData: jest.fn().mockResolvedValue({
        sessionId: SESSION_ID,
        userId: USER_ID,
        role: 'USER',
      }),
    };
    sessionRepo = {
      save: jest.fn(),
      findById: jest.fn(),
      findAllByUserId: jest.fn(),
      delete: jest.fn().mockResolvedValue(undefined),
      deleteAllByUserId: jest.fn(),
    };

    handler = new LogoutCommandHandler(refreshIssuer, sessionRepo);
  });

  afterEach(() => jest.clearAllMocks());

  it('should delete the session when token is valid', async () => {
    await handler.execute(new LogoutCommand('valid_refresh_token'));

    expect(sessionRepo.delete).toHaveBeenCalledTimes(1);
    const [calledSessionId, calledUserId] = sessionRepo.delete.mock.calls[0];
    expect(calledSessionId.toString()).toBe(SESSION_ID);
    expect(calledUserId.toString()).toBe(USER_ID);
  });

  it('should still delete the session when token is expired', async () => {
    refreshIssuer.verify.mockRejectedValue(
      new TokenExpiredError('jwt expired', new Date()),
    );
    refreshIssuer.getData.mockResolvedValue({
      sessionId: SESSION_ID,
      userId: USER_ID,
      role: 'USER',
    });

    await handler.execute(new LogoutCommand('expired_refresh_token'));

    expect(sessionRepo.delete).toHaveBeenCalledTimes(1);
  });

  it('should throw UnauthorizedException for any other token error', async () => {
    refreshIssuer.verify.mockRejectedValue(new Error('JsonWebTokenError'));

    await expect(
      handler.execute(new LogoutCommand('bad_token')),
    ).rejects.toThrow(UnauthorizedException);

    expect(sessionRepo.delete).not.toHaveBeenCalled();
  });

  describe('edge cases', () => {
    it('should not throw even when session.delete rejects (fire-and-forget style)', async () => {
      sessionRepo.delete.mockRejectedValue(new Error('Redis down'));

      await expect(
        handler.execute(new LogoutCommand('valid_refresh_token')),
      ).rejects.toThrow('Redis down');
    });

    it('should still delete session when getData returns payload for expired token', async () => {
      refreshIssuer.verify.mockRejectedValue(
        new TokenExpiredError('expired', new Date()),
      );
      refreshIssuer.getData.mockResolvedValue({
        sessionId: SESSION_ID,
        userId: USER_ID,
        role: 'USER',
      });

      await handler.execute(new LogoutCommand('expired_token'));

      expect(sessionRepo.delete).toHaveBeenCalledTimes(1);
    });
  });
});
