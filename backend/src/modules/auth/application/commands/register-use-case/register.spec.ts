import { RegisterCommandHandler } from './register.handler';
import { RegisterCommand } from '../auth.commands';
import { IAuthDataRepository } from '../../../domain/repository/authData.interface';
import { ICryptoService } from '../../abstractions/crypto.interface';
import { UserService } from 'src/modules/user/user.service';
import { IRegisterRepository } from '../../../domain/repository/registerFlow.interface';
import { IAuthQueue } from '../../abstractions/queue.interface';
import { eventNames } from 'src/common/constants/eventnames';

describe('RegisterCommandHandler', () => {
  let handler: RegisterCommandHandler;
  let authRepo: jest.Mocked<IAuthDataRepository>;
  let crypto: jest.Mocked<ICryptoService>;
  let userService: jest.Mocked<UserService>;
  let registerRepo: jest.Mocked<IRegisterRepository>;
  let authQueue: jest.Mocked<IAuthQueue>;

  const validDto = {
    email: 'new@example.com',
    password: 'Password1!',
    name: 'Alice',
  };

  beforeEach(() => {
    authRepo = {
      save: jest.fn().mockResolvedValue(undefined),
      getByEmail: jest.fn(),
      getById: jest.fn(),
    };
    crypto = {
      crypto: jest.fn().mockResolvedValue('hashed_pass'),
      compare: jest.fn(),
    };
    userService = {
      createUser: jest.fn().mockResolvedValue({ name: 'Alice' }),
    } as any;
    registerRepo = {
      save: jest.fn().mockResolvedValue(undefined),
      getById: jest.fn(),
    };
    authQueue = { post: jest.fn().mockResolvedValue(undefined) };

    handler = new RegisterCommandHandler(
      authRepo,
      crypto,
      userService,
      registerRepo,
      authQueue,
    );
  });

  afterEach(() => jest.clearAllMocks());

  it('should hash the password before saving', async () => {
    await handler.execute(new RegisterCommand(validDto));
    expect(crypto.crypto).toHaveBeenCalledWith('Password1!');
  });

  it('should save the auth user', async () => {
    await handler.execute(new RegisterCommand(validDto));
    expect(authRepo.save).toHaveBeenCalledTimes(1);
  });

  it('should create a user via UserService', async () => {
    await handler.execute(new RegisterCommand(validDto));
    expect(userService.createUser).toHaveBeenCalledTimes(1);
    expect(userService.createUser).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Alice' }),
    );
  });

  it('should save a verification uuid to the register repo', async () => {
    await handler.execute(new RegisterCommand(validDto));
    expect(registerRepo.save).toHaveBeenCalledTimes(1);
  });

  it('should post the account_need_confirmation event to the queue', async () => {
    await handler.execute(new RegisterCommand(validDto));
    expect(authQueue.post).toHaveBeenCalledWith(
      eventNames.accound_need_confirmation,
      expect.objectContaining({ email: 'new@example.com', username: 'Alice' }),
    );
  });

  it('should generate a unique userId per registration', async () => {
    await handler.execute(new RegisterCommand(validDto));
    await handler.execute(
      new RegisterCommand({ ...validDto, email: 'other@example.com' }),
    );

    const firstUserId =
      userService.createUser.mock.calls[0][0].userId.toString();
    const secondUserId =
      userService.createUser.mock.calls[1][0].userId.toString();
    expect(firstUserId).not.toBe(secondUserId);
  });

  describe('edge cases', () => {
    it('should pass the same userId to both authRepo and userService', async () => {
      await handler.execute(new RegisterCommand(validDto));

      const savedAuthUser = authRepo.save.mock.calls[0][0];
      const createdUserId = userService.createUser.mock.calls[0][0].userId;
      expect(savedAuthUser.userId.toString()).toBe(createdUserId.toString());
    });

    it('should send a unique verification uuid for each registration', async () => {
      await handler.execute(new RegisterCommand(validDto));
      await handler.execute(
        new RegisterCommand({ ...validDto, email: 'b@example.com' }),
      );

      const uuid1 = registerRepo.save.mock.calls[0][1];
      const uuid2 = registerRepo.save.mock.calls[1][1];
      expect(uuid1).not.toBe(uuid2);
    });
  });
});
