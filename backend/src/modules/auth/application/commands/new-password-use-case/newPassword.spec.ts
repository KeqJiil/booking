import { ForgotChangePasswordCommandHandler } from './newPassword.handler';
import { ForgotChangePasswordCommand } from '../auth.commands';
import { IEmailInteractRepository } from '../../../domain/repository/emailInteract.interface';
import { IAuthDataRepository } from '../../../domain/repository/authData.interface';
import { ICryptoService } from '../../abstractions/crypto.interface';
import { SessionRepository } from '../../../domain/repository/sessionRepository.interface';
import { IForgotPasswordPayload } from '../../abstractions/forgotPasswordPayload.interface';
import { BadRequestException } from '@nestjs/common';
import { AuthUser } from '../../../domain/entity/AuthUser';
import { AuthId } from '../../../domain/typedId/auth.id';
import { UserId } from '../../../domain/typedId/user.id';
import { Email } from '../../../domain/VO/emailVo';

describe('ForgotChangePasswordCommandHandler', () => {
  let handler: ForgotChangePasswordCommandHandler;
  let emailForgotRepo: jest.Mocked<
    IEmailInteractRepository<IForgotPasswordPayload>
  >;
  let authUserRepo: jest.Mocked<IAuthDataRepository>;
  let cryptor: jest.Mocked<ICryptoService>;
  let sessionRepo: jest.Mocked<SessionRepository>;

  const userId = new UserId('user-uuid-1');
  const email = Email.create('user@example.com');
  const authUser = AuthUser.fromPersist(
    new AuthId('auth-1'),
    userId,
    email,
    'old_hash',
    true,
  );

  const forgotPayload: IForgotPasswordPayload = {
    uuid: 'test-uuid',
    userId,
    email,
  };

  beforeEach(() => {
    emailForgotRepo = {
      save: jest.fn(),
      findById: jest.fn().mockResolvedValue(forgotPayload),
      deleteKey: jest.fn().mockResolvedValue(undefined),
    };
    authUserRepo = {
      save: jest.fn().mockResolvedValue(undefined),
      getByEmail: jest.fn(),
      getById: jest.fn().mockResolvedValue(authUser),
    };
    cryptor = {
      crypto: jest.fn().mockResolvedValue('new_hash'),
      compare: jest.fn(),
    };
    sessionRepo = {
      save: jest.fn(),
      findById: jest.fn(),
      findAllByUserId: jest.fn(),
      delete: jest.fn(),
      deleteAllByUserId: jest.fn().mockResolvedValue(1),
    };

    handler = new ForgotChangePasswordCommandHandler(
      emailForgotRepo,
      authUserRepo,
      cryptor,
      sessionRepo,
    );
  });

  afterEach(() => jest.clearAllMocks());

  describe('happy path', () => {
    it('should hash the new password and save the user', async () => {
      await handler.execute(
        new ForgotChangePasswordCommand('NewPass1!', 'test-uuid'),
      );
      expect(cryptor.crypto).toHaveBeenCalledWith('NewPass1!');
      expect(authUserRepo.save).toHaveBeenCalledTimes(1);
    });

    it('should delete all sessions after password change', async () => {
      await handler.execute(
        new ForgotChangePasswordCommand('NewPass1!', 'test-uuid'),
      );
      expect(sessionRepo.deleteAllByUserId).toHaveBeenCalledWith(userId);
    });

    it('should delete the forgot-password key from the email repo', async () => {
      await handler.execute(
        new ForgotChangePasswordCommand('NewPass1!', 'test-uuid'),
      );
      expect(emailForgotRepo.deleteKey).toHaveBeenCalledWith('test-uuid');
    });
  });

  describe('failure cases', () => {
    it('should throw BadRequestException when uuid is not found', async () => {
      emailForgotRepo.findById.mockResolvedValue(null);

      await expect(
        handler.execute(
          new ForgotChangePasswordCommand('NewPass1!', 'bad-uuid'),
        ),
      ).rejects.toThrow(BadRequestException);

      expect(authUserRepo.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when auth user is not found', async () => {
      authUserRepo.getById.mockResolvedValue(null);

      await expect(
        handler.execute(
          new ForgotChangePasswordCommand('NewPass1!', 'test-uuid'),
        ),
      ).rejects.toThrow(BadRequestException);

      expect(authUserRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should invalidate all active sessions after password reset', async () => {
      await handler.execute(
        new ForgotChangePasswordCommand('NewPass1!', 'test-uuid'),
      );

      expect(sessionRepo.deleteAllByUserId).toHaveBeenCalledWith(userId);
    });

    it('should delete the forgot key even on successful password change', async () => {
      await handler.execute(
        new ForgotChangePasswordCommand('NewPass1!', 'test-uuid'),
      );

      expect(emailForgotRepo.deleteKey).toHaveBeenCalledWith('test-uuid');
    });
  });
});
