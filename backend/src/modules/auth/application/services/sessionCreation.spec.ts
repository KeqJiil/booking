import { SessionCreationService } from './sessionCreation.service';
import { SessionRepository } from '../../domain/repository/sessionRepository.interface';
import { IHasherService } from '../abstractions/hashed.interface';
import { SessionId } from '../../domain/typedId/session.id';
import { UserId } from '../../domain/typedId/user.id';

describe('SessionCreationService', () => {
  let service: SessionCreationService;
  let sessionRepo: jest.Mocked<SessionRepository>;
  let hasher: jest.Mocked<IHasherService>;
  const logger = { log: jest.fn(), error: jest.fn(), warn: jest.fn() } as any;

  const TTL_MS = 7 * 24 * 60 * 60 * 1000;

  beforeEach(() => {
    sessionRepo = {
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
      findAllByUserId: jest.fn(),
      delete: jest.fn(),
      deleteAllByUserId: jest.fn(),
    };
    hasher = { hash: jest.fn().mockReturnValue('sha256_hash') };
    service = new SessionCreationService(sessionRepo, hasher, TTL_MS, logger);
  });

  afterEach(() => jest.clearAllMocks());

  it('should hash the refresh token before storing', async () => {
    const userId = new UserId('user-1');
    const sessionId = new SessionId('session-1');

    await service.createSession(userId, 'raw_refresh_token', sessionId);

    expect(hasher.hash).toHaveBeenCalledWith('raw_refresh_token');
  });

  it('should save the session to the repository', async () => {
    const userId = new UserId('user-1');
    const sessionId = new SessionId('session-1');

    await service.createSession(userId, 'raw_refresh_token', sessionId);

    expect(sessionRepo.save).toHaveBeenCalledTimes(1);
    const savedSession = sessionRepo.save.mock.calls[0][0];
    expect(savedSession.id).toBe(sessionId);
    expect(savedSession.userId).toBe(userId);
    expect(savedSession.checkHash('sha256_hash')).toBe(true);
  });

  it('should not store the raw token — only the hash', async () => {
    const userId = new UserId('user-3');
    const sessionId = new SessionId('session-3');
    const rawToken = 'super_secret_token';

    await service.createSession(userId, rawToken, sessionId);

    const saved = sessionRepo.save.mock.calls[0][0];
    const { refresh } = saved.toPersistence();
    expect(refresh).not.toBe(rawToken);
    expect(refresh).toBe('sha256_hash');
  });

  it('should set expiry based on the injected TTL', async () => {
    const userId = new UserId('user-2');
    const sessionId = new SessionId('session-2');
    const before = Date.now();

    await service.createSession(userId, 'token', sessionId);

    const after = Date.now();
    const saved = sessionRepo.save.mock.calls[0][0];
    const { createdAt, expiresAt } = saved.toPersistence();
    expect(createdAt).toBeGreaterThanOrEqual(before);
    expect(createdAt).toBeLessThanOrEqual(after);
    expect(expiresAt - createdAt).toBe(TTL_MS);
  });
});
