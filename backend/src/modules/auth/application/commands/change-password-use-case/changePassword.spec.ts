import { ChangePasswordCommandHandler } from './changePassword.handler';
import { ChangePasswordCommand } from '../auth.commands';
import { IAuthDataRepository } from '../../../domain/repository/authData.interface';
import { ICryptoService } from '../../abstractions/crypto.interface';
import { IAuthQueue } from '../../abstractions/queue.interface';
import { BadRequestException } from '@nestjs/common';
import { eventNames } from 'src/common/constants/eventnames';
import { AuthUser } from '../../../domain/entity/AuthUser';
import { AuthId } from '../../../domain/typedId/auth.id';
import { UserId } from '../../../domain/typedId/user.id';
import { Email } from '../../../domain/VO/emailVo';

describe('ChangePasswordCommandHandler', () => {
  let handler: ChangePasswordCommandHandler;
  let authUserRepo: jest.Mocked<IAuthDataRepository>;
  let cryptor: jest.Mocked<ICryptoService>;
  let authQueue: jest.Mocked<IAuthQueue>;

  const userId = new UserId('user-uuid-1');
  const email = Email.create('user@example.com');

  let authUser: AuthUser;

  beforeEach(() => {
    authUser = AuthUser.fromPersist(
      new AuthId('auth-1'),
      userId,
      email,
      'old_hash',
      true,
    );

    authUserRepo = {
      save: jest.fn().mockResolvedValue(undefined),
      getByEmail: jest.fn(),
      getById: jest.fn().mockImplementation(() => Promise.resolve(authUser)),
    };
    cryptor = {
      crypto: jest.fn().mockResolvedValue('new_hash'),
      compare: jest.fn().mockResolvedValue(true),
    };
    authQueue = { post: jest.fn().mockResolvedValue(undefined) };

    handler = new ChangePasswordCommandHandler(
      authUserRepo,
      cryptor,
      authQueue,
    );
  });

  afterEach(() => jest.clearAllMocks());

  describe('happy path', () => {
    it('should update the password and save', async () => {
      await handler.execute(
        new ChangePasswordCommand(userId.toString(), 'OldPass1!', 'NewPass1!'),
      );

      expect(cryptor.crypto).toHaveBeenCalledWith('NewPass1!');
      expect(authUserRepo.save).toHaveBeenCalledTimes(1);
    });

    it('should verify old password before changing', async () => {
      await handler.execute(
        new ChangePasswordCommand(userId.toString(), 'OldPass1!', 'NewPass1!'),
      );

      expect(cryptor.compare).toHaveBeenCalledWith('OldPass1!', 'old_hash');
    });

    it('should post the password_changed event', async () => {
      await handler.execute(
        new ChangePasswordCommand(userId.toString(), 'OldPass1!', 'NewPass1!'),
      );

      expect(authQueue.post).toHaveBeenCalledWith(
        eventNames.password_changed,
        expect.objectContaining({ userId: authUser.id.toString() }),
      );
    });
  });

  describe('failure cases', () => {
    it('should throw BadRequestException when user is not found', async () => {
      authUserRepo.getById.mockResolvedValue(null);

      await expect(
        handler.execute(
          new ChangePasswordCommand(
            userId.toString(),
            'OldPass1!',
            'NewPass1!',
          ),
        ),
      ).rejects.toThrow(BadRequestException);

      expect(authUserRepo.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when old password does not match', async () => {
      cryptor.compare.mockResolvedValue(false);

      await expect(
        handler.execute(
          new ChangePasswordCommand(
            userId.toString(),
            'WrongOld!',
            'NewPass1!',
          ),
        ),
      ).rejects.toThrow(BadRequestException);

      expect(authUserRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should not hash the new password before verifying the old one', async () => {
      cryptor.compare.mockResolvedValue(false);

      await expect(
        handler.execute(
          new ChangePasswordCommand(
            userId.toString(),
            'WrongOld!',
            'NewPass1!',
          ),
        ),
      ).rejects.toThrow(BadRequestException);

      expect(cryptor.crypto).not.toHaveBeenCalled();
    });

    it('should save the user with the newly hashed password', async () => {
      await handler.execute(
        new ChangePasswordCommand(userId.toString(), 'OldPass1!', 'NewPass1!'),
      );

      expect(authUser.password).toBe('new_hash');
    });
  });
});
