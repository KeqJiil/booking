import { VerifyAccontCommandHandler } from './verify.handler';
import { VerifyAccountCommand } from '../auth.commands';
import { IRegisterRepository } from '../../../domain/repository/registerFlow.interface';
import { IAuthQueue } from '../../abstractions/queue.interface';
import { IAuthDataRepository } from '../../../domain/repository/authData.interface';
import { BadRequestException } from '@nestjs/common';
import { eventNames } from 'src/common/constants/eventnames';
import { AuthUser } from '../../../domain/entity/AuthUser';
import { AuthId } from '../../../domain/typedId/auth.id';
import { UserId } from '../../../domain/typedId/user.id';
import { Email } from '../../../domain/VO/emailVo';
import { IRegisterData } from '../../abstractions/types';

describe('VerifyAccontCommandHandler', () => {
  let handler: VerifyAccontCommandHandler;
  let registerRepo: jest.Mocked<IRegisterRepository>;
  let authQueue: jest.Mocked<IAuthQueue>;
  let authUserRepo: jest.Mocked<IAuthDataRepository>;
  const logger = { log: jest.fn(), error: jest.fn() } as any;

  const userId = new UserId('user-uuid-1');
  const email = Email.create('user@example.com');
  const registerData: IRegisterData = { userId, uuid: 'test-uuid' };

  let authUser: AuthUser;

  beforeEach(() => {
    authUser = AuthUser.fromPersist(
      new AuthId('auth-1'),
      userId,
      email,
      'hash',
      false,
    );

    registerRepo = {
      save: jest.fn(),
      getById: jest.fn().mockResolvedValue(registerData),
    };
    authQueue = { post: jest.fn().mockResolvedValue(undefined) };
    authUserRepo = {
      save: jest.fn().mockResolvedValue(undefined),
      getByEmail: jest.fn(),
      getById: jest.fn().mockImplementation(() => Promise.resolve(authUser)),
    };

    handler = new VerifyAccontCommandHandler(
      registerRepo,
      logger,
      authQueue,
      authUserRepo,
    );
  });

  afterEach(() => jest.clearAllMocks());

  describe('happy path', () => {
    it('should verify the auth user and save', async () => {
      await handler.execute(new VerifyAccountCommand('test-uuid'));
      expect(authUserRepo.save).toHaveBeenCalledTimes(1);
      expect(authUser.isActivated()).toBe(true);
    });

    it('should post the account_created event', async () => {
      await handler.execute(new VerifyAccountCommand('test-uuid'));
      expect(authQueue.post).toHaveBeenCalledWith(
        eventNames.account_created,
        registerData,
      );
    });
  });

  describe('failure cases', () => {
    it('should throw BadRequestException when uuid is not found in register repo', async () => {
      registerRepo.getById.mockResolvedValue(null);

      await expect(
        handler.execute(new VerifyAccountCommand('unknown-uuid')),
      ).rejects.toThrow(BadRequestException);

      expect(authUserRepo.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when auth user is not found', async () => {
      authUserRepo.getById.mockResolvedValue(null);

      await expect(
        handler.execute(new VerifyAccountCommand('test-uuid')),
      ).rejects.toThrow(BadRequestException);

      expect(authUserRepo.save).not.toHaveBeenCalled();
    });

    it('should throw NotAllowedError when auth user is already verified', async () => {
      const alreadyVerified = AuthUser.fromPersist(
        new AuthId('auth-1'),
        userId,
        email,
        'hash',
        true,
      );
      authUserRepo.getById.mockImplementation(() =>
        Promise.resolve(alreadyVerified),
      );

      await expect(
        handler.execute(new VerifyAccountCommand('test-uuid')),
      ).rejects.toThrow();

      expect(authUserRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should not post account_created event when save fails', async () => {
      authUserRepo.save.mockRejectedValue(new Error('DB error'));

      await expect(
        handler.execute(new VerifyAccountCommand('test-uuid')),
      ).rejects.toThrow('DB error');

      expect(authQueue.post).not.toHaveBeenCalled();
    });
  });
});
