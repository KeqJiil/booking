import { Inject, Injectable } from '@nestjs/common';
import type { SessionRepository } from '../../domain/repository/sessionRepository.interface';
import {
  AUTH_SESSION_REPO,
  HASHER,
  REFRESH_TTL,
} from 'src/common/constants/providerConstants';
import type { IHasherService } from '../abstractions/hashed.interface';
import { SessionId } from '../../domain/typedId/session.id';
import { UserId } from '../../domain/typedId/user.id';
import { Session } from '../../domain/entity/session.entity';
import { Logger } from 'nestjs-pino';

@Injectable()
export class SessionCreationService {
  constructor(
    @Inject(AUTH_SESSION_REPO) private readonly sessionRepo: SessionRepository,
    @Inject(HASHER) private readonly hasher: IHasherService,
    @Inject(REFRESH_TTL) private readonly ttl: number,
    private readonly logger: Logger,
  ) {}

  async createSession(userId: UserId, refresh: string, id: SessionId) {
    const hashed = this.hasher.hash(refresh);
    const session = Session.create(
      {
        id,
        userId,
        refreshHash: hashed,
        ttlMs: this.ttl,
      },
      Date.now(),
    );
    await this.sessionRepo.save(session);
    this.logger.log(`New session for ${userId.toString()} was created`);
  }
}
