import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UserService } from '../user.service';
import { PrismaService } from 'src/database/prisma.service';
import { Logger } from 'nestjs-pino';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { eventNames } from 'src/common/constants/eventnames';
import { Tx } from '../../../infrastructure/repo/transactions/interfaces/TransactionRepo.interface';
import { UserSettingsDto } from '../dto/settings.dto';

jest.mock('bcrypt');

describe('user service', () => {
  let service: UserService;
  let eventEmitterMock: DeepMocked<EventEmitter2>;

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
    eventEmitterMock = module.get(EventEmitter2);
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

  describe('hasValidStatus', () => {
    it('status ALIVE → returns true', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ status: 'ALIVE' });

      const result = await service.hasValidStatus('user-1');

      expect(result).toBe(true);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        select: { status: true },
      });
    });

    it('status DELETED → returns false', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        status: 'DELETED',
      });

      const result = await service.hasValidStatus('user-1');

      expect(result).toBe(false);
    });

    it('user not found → returns false', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.hasValidStatus('user-1');

      expect(result).toBe(false);
    });
  });

  describe('getRole', () => {
    it('user found → return role', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ role: 'USER' });

      const result = await service.getRole('user-1');

      expect(result).toEqual({ role: 'USER' });
    });

    it('user not found → throws NotFoundException', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.getRole('user-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('changeRole', () => {
    it('update role and emit new_role_received event', async () => {
      const mockUser = { id: 'user-1', name: 'John', role: 'HOST' };
      mockPrismaService.user.update.mockResolvedValue(mockUser);

      await service.changeRole('user-1', 'HOST');

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { role: 'HOST' },
      });
      expect(eventEmitterMock.emit).toHaveBeenCalledWith(
        eventNames.new_role_received,
        { ...mockUser, userId: mockUser.id },
      );
    });
  });

  describe('updateAvatar', () => {
    it('update users avatar', async () => {
      const url = 'https://cdn.example.com/avatar.jpg';
      const mockUser = { id: 'user-1', avatarUrl: url };
      mockPrismaService.user.update.mockResolvedValue(mockUser);

      const result = await service.updateAvatar('user-1', url);

      expect(result).toEqual(mockUser);
    });
  });

  describe('changeSettings', () => {
    it('update settings', async () => {
      const settings = { theme: 'DARK', notifications: false };
      const mockResult = { id: 'user-1', ...settings };
      mockPrismaService.userSettings.update.mockResolvedValue(mockResult);

      const result = await service.changeSettings(
        'user-1',
        settings as unknown as UserSettingsDto,
      );

      expect(result).toEqual(mockResult);
    });
  });

  describe('addPaymentAccount', () => {
    it('use prismaService without tx', async () => {
      mockPrismaService.user.update.mockResolvedValue(undefined);

      await service.addPaymentAccount('user-1', 'pay-acc-1');

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { paymentAccountId: 'pay-acc-1' },
      });
    });

    it('use tx instead of prisma', async () => {
      const mockTxUpdate = jest.fn().mockResolvedValue(undefined);
      const mockTx = { user: { update: mockTxUpdate } } as any;

      await service.addPaymentAccount('user-1', 'pay-acc-1', mockTx as Tx);

      expect(mockTxUpdate).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { paymentAccountId: 'pay-acc-1' },
      });
      expect(mockPrismaService.user.update).not.toHaveBeenCalled();
    });
  });
});
