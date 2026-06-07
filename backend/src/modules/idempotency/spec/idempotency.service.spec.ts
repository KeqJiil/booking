import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { IdempotencyService } from '../idempotency.service';
import type { IIdempotencyRepo } from '../interfaces/idempotencyRepo.interface';
import { ConflictException } from '@nestjs/common';

describe('IdempotencyService', () => {
  let service: IdempotencyService;
  let repo: jest.Mocked<IIdempotencyRepo>;

  const mockTx = {} as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IdempotencyService,
        {
          provide: 'IDEMPOTENCY_REPO',
          useValue: createMock<IIdempotencyRepo>(),
        },
      ],
    }).compile();

    service = module.get(IdempotencyService);
    repo = module.get('IDEMPOTENCY_REPO');
    jest.clearAllMocks();
  });

  describe('createOrGet', () => {
    it('happy path → repo.create created, returns { id, isDuplicate: false }', async () => {
      repo.create.mockResolvedValue('new-key-id');
      const result = await service.createOrGet('my-key', mockTx, 'user-1');
      expect(result).toEqual({ id: 'new-key-id', isDuplicate: false });
      expect(repo.find).not.toHaveBeenCalled();
    });

    it('P2002 and find return data → { response, isDuplicate: true }', async () => {
      repo.create.mockRejectedValue({ code: 'P2002' });
      repo.find.mockResolvedValue({
        id: 'key-1',
        statusCode: 200,
        response: { ok: true },
      });
      const result = await service.createOrGet('my-key', mockTx, 'user-1');
      expect(result.isDuplicate).toBe(true);
      expect(result.response).toEqual({
        id: 'key-1',
        statusCode: 200,
        response: { ok: true },
      });
      expect(repo.find).toHaveBeenCalledWith('my-key', mockTx);
    });

    it('P2002 and find return null → ConflictException', async () => {
      repo.create.mockRejectedValue({ code: 'P2002' });
      repo.find.mockResolvedValue(null);
      await expect(
        service.createOrGet('my-key', mockTx, 'user-1'),
      ).rejects.toThrow(ConflictException);
    });

    it('another error (not P2002) → new Error()', async () => {
      repo.create.mockRejectedValue({
        code: 'P5000',
        message: 'Connection error',
      });
      await expect(
        service.createOrGet('key-id', mockTx, 'user-1'),
      ).rejects.toThrow(Error);
      expect(repo.find).not.toHaveBeenCalled();
    });

    it('repo.create was called with right args', async () => {
      repo.create.mockResolvedValue('key-id');
      await service.createOrGet('specific-key', mockTx, 'specific-user');
      expect(repo.create).toHaveBeenCalledWith(
        'specific-key',
        'specific-user',
        mockTx,
      );
    });
  });

  describe('complete', () => {
    it('call repo.addInfo with right args', async () => {
      repo.addInfo.mockResolvedValue(undefined);
      const data = { id: 'payment-1' };
      await service.complete('my-key', mockTx, data, 200);
      expect(repo.addInfo).toHaveBeenCalledWith('my-key', 200, data, mockTx);
    });

    it('data can be any type (number, object, string)', async () => {
      repo.addInfo.mockResolvedValue(undefined);
      await service.complete('my-key', mockTx, 42, 200);
      expect(repo.addInfo).toHaveBeenCalledWith('my-key', 200, 42, mockTx);
    });
  });
});
