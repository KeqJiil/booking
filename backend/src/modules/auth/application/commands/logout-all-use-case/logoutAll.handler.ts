import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RevokeAllSessionsCommand } from '../auth.commands';
import { Inject, UnauthorizedException } from '@nestjs/common';
import {
  AUTH_SESSION_REPO,
  TOKEN_ISSUER_REFRESH,
} from 'src/common/constants/providerConstants';
import type { SessionRepository } from '../../../domain/repository/sessionRepository.interface';
import type { ITokenIssuerService } from '../../abstractions/TokenIssuer.interface';
import type { IRefreshTokenPayload } from '../../abstractions/tokenPayload.interface';
import { UserId } from '../../../domain/typedId/user.id';
import { TokenExpiredError } from '@nestjs/jwt';

@CommandHandler(RevokeAllSessionsCommand)
export class RevokeAllSessionCommandHandler implements ICommandHandler<RevokeAllSessionsCommand> {
  constructor(
    @Inject(TOKEN_ISSUER_REFRESH)
    private readonly refreshIssuer: ITokenIssuerService<IRefreshTokenPayload>,
    @Inject(AUTH_SESSION_REPO) private readonly sessionRepo: SessionRepository,
  ) {}

  async execute(command: RevokeAllSessionsCommand): Promise<void> {
    let payload: IRefreshTokenPayload | null = null;
    try {
      payload = await this.refreshIssuer.verify(command.refreshToken);
    } catch (err) {
      if (err instanceof TokenExpiredError) {
        payload = await this.refreshIssuer.getData(command.refreshToken);
      } else {
        throw new UnauthorizedException();
      }
    }
    if (!payload) throw new UnauthorizedException('No payload inside token');
    if (payload.userId) {
      const userId = new UserId(payload.userId);
      await this.sessionRepo.deleteAllByUserId(userId);
      return;
    }
    throw new UnauthorizedException();
  }
}
