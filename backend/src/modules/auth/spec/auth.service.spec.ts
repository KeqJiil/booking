/* eslint-disable @typescript-eslint/unbound-method*/
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/database/prisma.service';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { RedisService } from 'src/infrastructure/redis/redis.service';
import { UserService } from 'src/modules/user/user.service';
import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Logger } from 'nestjs-pino';
import { eventNames } from 'src/common/constants/eventnames';

jest.mock('bcrypt');
jest.mock('crypto', () => ({
  randomUUID: jest.fn(() => 'mocked-session-uuid'),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prismaMock: DeepMocked<PrismaService>;
  let redisMock: DeepMocked<RedisService>;
  let userServiceMock: DeepMocked<UserService>;
  let jwtMock: DeepMocked<JwtService>;
  let eventEmitterMock: DeepMocked<EventEmitter2>;

  const mockUser = {
    id: 'this-id',
    name: 'name',
    email: 'test@tset.test',
    role: 'USER',
    paymentAccountId: null,
    avatarUrl: null,
    status: 'NOT_CONFIRMED',
    password: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as const;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: createMock<PrismaService>() },
        { provide: 'REDIS', useValue: createMock<RedisService>() },
        { provide: UserService, useValue: createMock<UserService>() },
        { provide: JwtService, useValue: createMock<JwtService>() },
        { provide: EventEmitter2, useValue: createMock<EventEmitter2>() },
        {
          provide: Logger,
          useValue: { log: jest.fn(), error: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(AuthService);
    prismaMock = module.get(PrismaService);
    redisMock = module.get('REDIS');
    userServiceMock = module.get(UserService);
    jwtMock = module.get(JwtService);
    eventEmitterMock = module.get(EventEmitter2);
  });

  afterEach(() => jest.clearAllMocks());

  describe('register & verify', () => {
    it('should register and then verify flow', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      userServiceMock.createUser.mockResolvedValue(mockUser);

      await service.register({
        email: 'test@test.com',
        password: '123',
        name: 'John',
      });

      expect(userServiceMock.createUser).toHaveBeenCalled();
      expect(eventEmitterMock.emit).toHaveBeenCalledWith(
        eventNames.accound_need_confirmation,
        expect.any(Object),
      );

      redisMock.get.mockResolvedValue({ userId: mockUser.id });
      userServiceMock.verifyUser.mockResolvedValue(mockUser);
      jwtMock.signAsync.mockResolvedValue('token');

      const result = await service.verify('uuid');
      expect(result.accessToken).toBe('token');
      expect(redisMock.del).toHaveBeenCalledWith('user:uuid');
    });

    it('verify: throw if no cache', async () => {
      redisMock.get.mockResolvedValue(null);
      await expect(service.verify('inv')).rejects.toThrow(BadRequestException);
    });
  });

  describe('login', () => {
    it('success login', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        ...mockUser,
        password: 'hash',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtMock.signAsync.mockResolvedValue('token');

      const result = await service.login({
        email: 'test@mail.com',
        password: '123',
      });
      expect(result.accessToken).toBe('token');
    });

    it('fail login because wrong pass', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        ...mockUser,
        password: 'hash',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await expect(
        service.login({ email: 'e', password: 'p' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('auth actions', () => {
    it('logout success', async () => {
      jwtMock.verifyAsync.mockResolvedValue({ sessionId: 's1' });
      expect(await service.logout('t')).toBe(true);
      expect(redisMock.del).toHaveBeenCalledWith('session:s1');
    });

    it('forgotPassword success', async () => {
      userServiceMock.getUserByEmail.mockResolvedValue(mockUser);
      await service.forgotPassword('a@a.com');
      expect(eventEmitterMock.emit).toHaveBeenCalledWith(
        eventNames.forgot_password,
        expect.any(Object),
      );
    });

    it('newPassword success', async () => {
      redisMock.get.mockResolvedValue(mockUser.id);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hash');
      await service.newPassword('p', 'uuid');
      expect(prismaMock.user.update).toHaveBeenCalled();
    });
  });
});
