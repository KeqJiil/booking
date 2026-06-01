import { RevokeAllSessionCommandHandler } from './logoutAll.handler';
import { RevokeAllSessionsCommand } from '../auth.commands';
import { SessionRepository } from '../../../domain/repository/sessionRepository.interface';
import { IRefreshTokenPayload } from '../../abstractions/tokenPayload.interface';
import { ITokenIssuerService } from '../../abstractions/TokenIssuer.interface';
import { UnauthorizedException } from '@nestjs/common';
import { TokenExpiredError } from '@nestjs/jwt';

describe('RevokeAllSessionCommandHandler', () => {
  let handler: RevokeAllSessionCommandHandler;
  let refreshIssuer: jest.Mocked<ITokenIssuerService<IRefreshTokenPayload>>;
  let sessionRepo: jest.Mocked<SessionRepository>;

  const USER_ID = 'user-uuid-1';

  beforeEach(() => {
    refreshIssuer = {
      verify: jest.fn().mockResolvedValue({
        userId: USER_ID,
        sessionId: 'session-1',
        role: 'USER',
      }),
      sign: jest.fn(),
      getData: jest.fn(),
    };
    sessionRepo = {
      save: jest.fn(),
      findById: jest.fn(),
      findAllByUserId: jest.fn(),
      delete: jest.fn(),
      deleteAllByUserId: jest.fn().mockResolvedValue(3),
    };

    handler = new RevokeAllSessionCommandHandler(refreshIssuer, sessionRepo);
  });

  afterEach(() => jest.clearAllMocks());

  it('should delete all sessions for the token owner', async () => {
    await handler.execute(new RevokeAllSessionsCommand('valid_refresh_token'));

    expect(sessionRepo.deleteAllByUserId).toHaveBeenCalledTimes(1);
    const calledUserId = sessionRepo.deleteAllByUserId.mock.calls[0][0];
    expect(calledUserId.toString()).toBe(USER_ID);
  });

  it('should throw UnauthorizedException for non-expired invalid tokens', async () => {
    refreshIssuer.verify.mockRejectedValue(new Error('JsonWebTokenError'));

    await expect(
      handler.execute(new RevokeAllSessionsCommand('invalid_token')),
    ).rejects.toThrow(UnauthorizedException);

    expect(sessionRepo.deleteAllByUserId).not.toHaveBeenCalled();
  });

  it('should still revoke all sessions when token is expired', async () => {
    refreshIssuer.verify.mockRejectedValue(
      new TokenExpiredError('jwt expired', new Date()),
    );
    refreshIssuer.getData.mockResolvedValue({
      userId: USER_ID,
      sessionId: 'session-1',
      role: 'USER',
    });

    await handler.execute(new RevokeAllSessionsCommand('expired_token'));

    expect(sessionRepo.deleteAllByUserId).toHaveBeenCalledTimes(1);
  });

  it('should throw UnauthorizedException when payload has no userId', async () => {
    refreshIssuer.verify.mockResolvedValue({
      userId: '',
      sessionId: 'session-1',
      role: 'USER',
    });

    await expect(
      handler.execute(new RevokeAllSessionsCommand('token_without_user')),
    ).rejects.toThrow(UnauthorizedException);
  });
});
