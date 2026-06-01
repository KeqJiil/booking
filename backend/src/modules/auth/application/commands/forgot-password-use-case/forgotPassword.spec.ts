import { ForgotPasswordCommandHandler } from './forgotPassword.handler';
import { ForgotPasswordCommand } from '../auth.commands';
import { IEmailInteractRepository } from '../../../domain/repository/emailInteract.interface';
import { IAuthDataRepository } from '../../../domain/repository/authData.interface';
import { IAuthQueue } from '../../abstractions/queue.interface';
import { IForgotPasswordPayload } from '../../abstractions/forgotPasswordPayload.interface';
import { eventNames } from 'src/common/constants/eventnames';
import { AuthUser } from '../../../domain/entity/AuthUser';
import { AuthId } from '../../../domain/typedId/auth.id';
import { UserId } from '../../../domain/typedId/user.id';
import { Email } from '../../../domain/VO/emailVo';

describe('ForgotPasswordCommandHandler', () => {
  let handler: ForgotPasswordCommandHandler;
  let emailForgotRepo: jest.Mocked<
    IEmailInteractRepository<IForgotPasswordPayload>
  >;
  let authUserRepo: jest.Mocked<IAuthDataRepository>;
  let authQueue: jest.Mocked<IAuthQueue>;

  const userId = new UserId('user-uuid-1');
  const email = Email.create('user@example.com');
  const authUser = AuthUser.fromPersist(
    new AuthId('auth-1'),
    userId,
    email,
    'hash',
    true,
  );

  beforeEach(() => {
    emailForgotRepo = {
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
      deleteKey: jest.fn(),
    };
    authUserRepo = {
      save: jest.fn(),
      getByEmail: jest.fn().mockResolvedValue(authUser),
      getById: jest.fn(),
    };
    authQueue = { post: jest.fn().mockResolvedValue(undefined) };

    handler = new ForgotPasswordCommandHandler(
      emailForgotRepo,
      authUserRepo,
      authQueue,
    );
  });

  afterEach(() => jest.clearAllMocks());

  describe('when user exists', () => {
    it('should save the forgot-password payload to the email repo', async () => {
      await handler.execute(new ForgotPasswordCommand('user@example.com'));
      expect(emailForgotRepo.save).toHaveBeenCalledTimes(1);
    });

    it('should post the forgot_password event to the queue', async () => {
      await handler.execute(new ForgotPasswordCommand('user@example.com'));
      expect(authQueue.post).toHaveBeenCalledWith(
        eventNames.forgot_password,
        expect.objectContaining({ email }),
      );
    });

    it('should generate a unique uuid for each request', async () => {
      await handler.execute(new ForgotPasswordCommand('user@example.com'));
      await handler.execute(new ForgotPasswordCommand('user@example.com'));

      const firstUuid = emailForgotRepo.save.mock.calls[0][0];
      const secondUuid = emailForgotRepo.save.mock.calls[1][0];
      expect(firstUuid).not.toBe(secondUuid);
    });
  });

  describe('when user does not exist', () => {
    it('should return silently without posting any event', async () => {
      authUserRepo.getByEmail.mockResolvedValue(null);

      await handler.execute(new ForgotPasswordCommand('unknown@example.com'));

      expect(emailForgotRepo.save).not.toHaveBeenCalled();
      expect(authQueue.post).not.toHaveBeenCalled();
    });

    it('should not throw even for unknown email (prevents email enumeration)', async () => {
      authUserRepo.getByEmail.mockResolvedValue(null);

      await expect(
        handler.execute(new ForgotPasswordCommand('unknown@example.com')),
      ).resolves.not.toThrow();
    });
  });

  describe('edge cases', () => {
    it('should store the same uuid in the repo that is sent to the queue', async () => {
      await handler.execute(new ForgotPasswordCommand('user@example.com'));

      const savedUuid = emailForgotRepo.save.mock.calls[0][0];
      const queuePayload = authQueue.post.mock.calls[0][1] as any;
      expect(queuePayload.uuid).toBe(savedUuid);
    });
  });
});
