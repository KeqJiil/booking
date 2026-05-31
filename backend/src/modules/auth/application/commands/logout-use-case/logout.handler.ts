import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LogoutCommand } from '../auth.commands';
import {
  AUTH_SESSION_REPO,
  TOKEN_ISSUER_REFRESH,
} from 'src/common/constants/providerConstants';
import type { ITokenIssuerService } from '../../abstractions/TokenIssuer.interface';
import type { IRefreshTokenPayload } from '../../abstractions/tokenPayload.interface';
import type { SessionRepository } from 'src/modules/auth/domain/repository/sessionRepository.interface';
import { Inject, UnauthorizedException } from '@nestjs/common';
import { TokenExpiredError } from '@nestjs/jwt';
import { SessionId } from 'src/modules/auth/domain/typedId/session.id';
import { UserId } from 'src/modules/auth/domain/typedId/user.id';

@CommandHandler(LogoutCommand)
export class LogoutCommandHandler implements ICommandHandler<LogoutCommand> {
  constructor(
    @Inject(TOKEN_ISSUER_REFRESH)
    private readonly refreshIssuer: ITokenIssuerService<IRefreshTokenPayload>,
    @Inject(AUTH_SESSION_REPO) private readonly sessionRepo: SessionRepository,
  ) {}

  async execute(command: LogoutCommand): Promise<void> {
    let sessionId: string | undefined;
    let userId: string | undefined;
    try {
      const payload = await this.refreshIssuer.verify(command.refreshToken);
      sessionId = payload.sessionId;
      userId = payload.userId;
    } catch (err) {
      if (err instanceof TokenExpiredError) {
        const decoded = await this.refreshIssuer.getData(command.refreshToken);
        sessionId = decoded?.sessionId;
        userId = decoded?.userId;
      } else {
        throw new UnauthorizedException();
      }
    }
    const sessionTypedId = new SessionId(sessionId);
    const userTypedId = new UserId(userId);
    await this.sessionRepo.delete(sessionTypedId, userTypedId);
  }
}
