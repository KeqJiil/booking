import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/database/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');
jest.mock('crypto', () => ({
  randomUUID: jest.fn(() => 'mocked-session-uuid'),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwt: JwtService;
  let cache: any;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
    decode: jest.fn(),
  };

  const mockCacheManager = {
    set: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwt = module.get<JwtService>(JwtService);
    cache = module.get(CACHE_MANAGER);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register', async () => {
      const dto = {
        name: 'Test',
        email: 'test@mail.com',
        password: '1231ADAdsa!3',
      };
      const mockUser = { id: 'user-1', role: 'USER' };

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-pass');
      mockPrismaService.user.create.mockResolvedValue(mockUser);
      mockJwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      const result = await service.register(dto);

      expect(mockPrismaService.user.create).toHaveBeenCalled();
      expect(mockCacheManager.set).toHaveBeenCalled();
      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
    });
  });

  describe('login', () => {
    it('should login well', async () => {
      const dto = { email: 'test@mail.com', password: '123123ASDasd!@#' };
      const mockUser = {
        id: 'user-1',
        password: 'hashed-pass',
        role: 'USER',
        status: 'ACTIVE',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      const result = await service.login(dto);

      expect(bcrypt.compare).toHaveBeenCalledWith(
        '123123ASDasd!@#',
        'hashed-pass',
      );
      expect(result.accessToken).toBe('access-token');
    });

    it('should throw error', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        status: 'ACTIVE',
        password: 'hash',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ email: 'e', password: 'p' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refreshTokens', () => {
    const mockPayload = { id: 'user-1', sessionId: 'mocked-session-uuid' };
    const mockUser = { role: 'USER', status: 'ACTIVE' };

    it('should refresh tokens', async () => {
      mockJwtService.verifyAsync.mockResolvedValue(mockPayload);
      mockCacheManager.get.mockResolvedValue({
        refresh: 'hashed-refresh-in-cache',
        expiresAt: Date.now() + 100000,
        createdAt: Date.now() - 20000,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValue('new-token');

      const result = await service.refreshTokens('valid-old-token');
      expect(result).toBeDefined();
    });

    it('Allows due to good token', async () => {
      const currentTime = 1000000;
      jest.spyOn(Date, 'now').mockReturnValue(currentTime);

      mockJwtService.verifyAsync.mockResolvedValue(mockPayload);

      mockCacheManager.get.mockResolvedValue({
        refresh: 'new-hashed-refresh-in-cache',
        expiresAt: currentTime + 100000,

        createdAt: currentTime - 10000,
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValue('new-token');

      const result = await service.refreshTokens('old-token');
      expect(result).toBeDefined();

      jest.restoreAllMocks();
    });

    it('Rejects due to stolen token', async () => {
      const currentTime = 1000000;
      jest.spyOn(Date, 'now').mockReturnValue(currentTime);

      mockJwtService.verifyAsync.mockResolvedValue(mockPayload);

      mockCacheManager.get.mockResolvedValue({
        refresh: 'new-hashed-refresh-in-cache',
        expiresAt: currentTime + 100000,
        createdAt: currentTime - 20000,
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.refreshTokens('old-stolen-token')).rejects.toThrow(
        new UnauthorizedException('Bad token'),
      );

      jest.restoreAllMocks();
    });
  });
});
