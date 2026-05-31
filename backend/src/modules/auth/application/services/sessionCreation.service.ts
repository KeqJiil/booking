import { Inject, Injectable } from '@nestjs/common';
import type { SessionRepository } from '../../domain/repository/sessionRepository.interface';
import {
  AUTH_SESSION_REPO,
  HASHER,
} from 'src/common/constants/providerConstants';
import type { IHasherService } from '../abstractions/hashed.interface';
import { SessionId } from '../../domain/typedId/session.id';
import { UserId } from '../../domain/typedId/user.id';
import { Session } from '../../domain/entity/session.entity';

@Injectable()
export class SessionCreationService {
  constructor(
    @Inject(AUTH_SESSION_REPO) private readonly sessionRepo: SessionRepository,
    @Inject(HASHER) private readonly hasher: IHasherService,
  ) {}

  async createSession(
    userId: UserId,
    refresh: string,
    id: SessionId,
    ttl: number,
  ) {
    const hashed = this.hasher.hash(refresh);
    const session = Session.create({
      id,
      userId,
      refreshHash: hashed,
      ttlMs: ttl,
    });
    await this.sessionRepo.save(session);
  }
}
