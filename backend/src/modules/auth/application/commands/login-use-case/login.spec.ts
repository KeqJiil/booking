import { LoginCommandHandler } from './login.handler';
import { LoginCommand } from '../auth.commands';
import { IAuthDataRepository } from '../../../domain/repository/authData.interface';
import { ICryptoService } from '../../abstractions/crypto.interface';
import { SessionCreationService } from '../../services/sessionCreation.service';
import {
  IAccessTokenPayload,
  IRefreshTokenPayload,
} from '../../abstractions/tokenPayload.interface';
import { ITokenIssuerService } from '../../abstractions/TokenIssuer.interface';
import { UserService } from 'src/modules/user/user.service';
import { UnauthorizedException } from '@nestjs/common';
import { AuthUser } from '../../../domain/entity/AuthUser';
import { AuthId } from '../../../domain/typedId/auth.id';
import { UserId } from '../../../domain/typedId/user.id';
import { Email } from '../../../domain/VO/emailVo';

describe('LoginCommandHandler', () => {
  let handler: LoginCommandHandler;
  let authRepo: jest.Mocked<IAuthDataRepository>;
  let cryptor: jest.Mocked<ICryptoService>;
  let sessionCreator: jest.Mocked<SessionCreationService>;
  let tokenIssuerRefresh: jest.Mocked<
    ITokenIssuerService<IRefreshTokenPayload>
  >;
  let tokenIssuerAccess: jest.Mocked<ITokenIssuerService<IAccessTokenPayload>>;
  let userService: jest.Mocked<UserService>;

  const userId = new UserId('user-uuid-1');
  const authId = new AuthId('auth-uuid-1');
  const email = Email.create('user@example.com');

  function makeAuthUser(activated = true) {
    const user = activated
      ? AuthUser.fromPersist(authId, userId, email, 'hashed_pass', true)
      : AuthUser.create(authId, userId, email, 'hashed_pass');
    return user;
  }

  beforeEach(() => {
    authRepo = { getByEmail: jest.fn(), getById: jest.fn(), save: jest.fn() };
    cryptor = { crypto: jest.fn(), compare: jest.fn() };
    sessionCreator = {
      createSession: jest.fn().mockResolvedValue(undefined),
    } as any;
    tokenIssuerRefresh = {
      sign: jest.fn().mockResolvedValue('refresh_token'),
      verify: jest.fn(),
      getData: jest.fn(),
    };
    tokenIssuerAccess = {
      sign: jest.fn().mockResolvedValue('access_token'),
      verify: jest.fn(),
      getData: jest.fn(),
    };
    userService = {
      getRole: jest.fn().mockResolvedValue({ role: 'USER' }),
    } as any;

    handler = new LoginCommandHandler(
      authRepo,
      cryptor,
      sessionCreator,
      tokenIssuerRefresh,
      tokenIssuerAccess,
      userService,
    );
  });

  afterEach(() => jest.clearAllMocks());

  describe('happy path', () => {
    it('should return access and refresh tokens', async () => {
      authRepo.getByEmail.mockResolvedValue(makeAuthUser());
      cryptor.compare.mockResolvedValue(true);

      const result = await handler.execute(
        new LoginCommand({ email: 'user@example.com', password: 'Password1!' }),
      );

      expect(result).toEqual({
        access: 'access_token',
        refresh: 'refresh_token',
      });
      expect(sessionCreator.createSession).toHaveBeenCalledTimes(1);
    });
  });

  describe('failure cases', () => {
    it('should throw UnauthorizedException when user is not found', async () => {
      authRepo.getByEmail.mockResolvedValue(null);

      await expect(
        handler.execute(
          new LoginCommand({ email: 'user@example.com', password: 'pass' }),
        ),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when user is not activated', async () => {
      authRepo.getByEmail.mockResolvedValue(makeAuthUser(false));

      await expect(
        handler.execute(
          new LoginCommand({ email: 'user@example.com', password: 'pass' }),
        ),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password does not match', async () => {
      authRepo.getByEmail.mockResolvedValue(makeAuthUser());
      cryptor.compare.mockResolvedValue(false);

      await expect(
        handler.execute(
          new LoginCommand({ email: 'user@example.com', password: 'wrong' }),
        ),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should not create a session on failed login', async () => {
      authRepo.getByEmail.mockResolvedValue(null);

      await expect(
        handler.execute(
          new LoginCommand({ email: 'user@example.com', password: 'pass' }),
        ),
      ).rejects.toThrow(UnauthorizedException);

      expect(sessionCreator.createSession).not.toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should use the role returned by UserService when signing tokens', async () => {
      authRepo.getByEmail.mockResolvedValue(makeAuthUser());
      cryptor.compare.mockResolvedValue(true);
      userService.getRole.mockResolvedValue({ role: 'HOST' });

      await handler.execute(
        new LoginCommand({ email: 'user@example.com', password: 'Password1!' }),
      );

      expect(tokenIssuerAccess.sign).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'HOST' }),
      );
    });

    it('should generate a different sessionId each login', async () => {
      authRepo.getByEmail.mockResolvedValue(makeAuthUser());
      cryptor.compare.mockResolvedValue(true);

      await handler.execute(
        new LoginCommand({ email: 'user@example.com', password: 'Password1!' }),
      );
      await handler.execute(
        new LoginCommand({ email: 'user@example.com', password: 'Password1!' }),
      );

      const id1 = sessionCreator.createSession.mock.calls[0][2].toString();
      const id2 = sessionCreator.createSession.mock.calls[1][2].toString();
      expect(id1).not.toBe(id2);
    });
  });
});
