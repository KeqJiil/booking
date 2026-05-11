import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../user.service';
import { PrismaService } from 'src/database/prisma.service';
import { Logger } from 'nestjs-pino';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { EventEmitter2 } from '@nestjs/event-emitter';

jest.mock('bcrypt');

describe('user service', () => {
  let service: UserService;
  let eventEmitterMock: DeepMocked<EventEmitter2>;
  let prisma: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    userSettings: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: PrismaService, useValue: mockPrismaService },
        UserService,
        { provide: EventEmitter2, useValue: createMock<EventEmitter2>() },
        {
          provide: Logger,
          useValue: { log: jest.fn(), error: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('delete user', () => {
    it('should delete', async () => {
      const mockUpdatedUser = { id: '1', status: 'DELETED' };
      mockPrismaService.user.update.mockResolvedValue(mockUpdatedUser);

      const result = await service.deleteUser('1');

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: {
          id: '1',
          role: { not: 'ADMIN' },
          status: { not: 'DELETED' },
        },
        data: { status: 'DELETED' },
      });
      expect(result).toEqual(mockUpdatedUser);
    });

    it('should throw an error', async () => {
      mockPrismaService.user.update.mockRejectedValue(
        new Error('Record to update not found'),
      );

      await expect(service.deleteUser('1')).rejects.toThrow(
        'Record to update not found',
      );
    });
  });

  describe('restoreUser', () => {
    it('should restore user', async () => {
      const mockUpdatedUser = { id: '1', status: 'ALIVE' };
      mockPrismaService.user.update.mockResolvedValue(mockUpdatedUser);

      const result = await service.restoreUser('1');

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: {
          id: '1',
          role: { not: 'ADMIN' },
          status: { not: 'ALIVE' },
        },
        data: { status: 'ALIVE' },
      });
      expect(result).toEqual(mockUpdatedUser);
    });

    it('should throw an error', async () => {
      mockPrismaService.user.update.mockRejectedValue(
        new Error('Record to update not found'),
      );

      await expect(service.restoreUser('1')).rejects.toThrow(
        'Record to update not found',
      );
    });
  });

  describe('delete user and restore right after', () => {
    it('trying delete user that is already deleted', async () => {
      mockPrismaService.user.update.mockResolvedValueOnce({
        id: '1',
        status: 'DELETED',
      });
      await service.deleteUser('1');

      mockPrismaService.user.update.mockRejectedValueOnce(
        new Error('P2025: RecordNotFound'),
      );

      await expect(service.deleteUser('1')).rejects.toThrow(
        'P2025: RecordNotFound',
      );
    });
  });
});
