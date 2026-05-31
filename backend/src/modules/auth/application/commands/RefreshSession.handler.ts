import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RefreshCommand } from './auth.commands';
import { ITokens } from '../../types';
import { Inject, UnauthorizedException } from '@nestjs/common';
import {
  AUTH_SESSION_REPO,
  HASHER,
  TOKEN_ISSUER_ACCESS,
  TOKEN_ISSUER_REFRESH,
} from 'src/common/constants/providerConstants';
import type { SessionRepository } from '../../domain/repository/sessionRepository.interface';
import type { ITokenIssuerService } from '../abstractions/TokenIssuer.interface';
import {
  IAccessTokenPayload,
  IRefreshTokenPayload,
} from '../abstractions/tokenPayload.interface';
import type { IHasherService } from '../abstractions/hashed.interface';
import { SessionId } from '../../domain/typedId/session.id';
import { Logger } from 'nestjs-pino';
import { UserId } from '../../domain/typedId/user.id';
import { UserService } from 'src/modules/user/user.service';

@CommandHandler(RefreshCommand)
export class RefreshCommandHandler implements ICommandHandler<RefreshCommand> {
  constructor(
    @Inject(AUTH_SESSION_REPO) private readonly sessionRepo: SessionRepository,
    @Inject(TOKEN_ISSUER_REFRESH)
    private readonly tokenIssuerRefresh: ITokenIssuerService<IRefreshTokenPayload>,
    @Inject(TOKEN_ISSUER_ACCESS)
    private readonly tokenIssuerAccess: ITokenIssuerService<IAccessTokenPayload>,
    @Inject(HASHER) private readonly hasher: IHasherService,
    private readonly logger: Logger,
    private readonly userService: UserService,
  ) {}

  async execute(command: RefreshCommand): Promise<ITokens> {
    const { userId, sessionId, role } = await this.tokenIssuerRefresh.verify(
      command.refreshToken,
    );
    const id = new SessionId(sessionId);

    const session = await this.sessionRepo.findById(id);
    if (!session || session.isExpired(Date.now()))
      throw new UnauthorizedException('No cache or cache expired');

    const hashed = this.hasher.hash(command.refreshToken);
    const refreshCheck = session.checkHash(hashed);
    if (!refreshCheck && !session.isInGrace(Date.now(), hashed)) {
      this.logger.warn(`Reuse detected`);
      const tokenUserId = new UserId(userId);
      await this.sessionRepo.deleteAllByUserId(tokenUserId);
      throw new UnauthorizedException('Reuse detected');
    }

    const user = await this.userService.getUserById(userId);
    if (!user || user.status === 'DELETED')
      throw new UnauthorizedException('No such user');

    const access = await this.tokenIssuerAccess.sign({ userId, role });
    const refresh = await this.tokenIssuerRefresh.sign({
      userId,
      role,
      sessionId,
    });
    const newHash = this.hasher.hash(refresh);
    const newSession = session.rotate(newHash);
    await this.sessionRepo.save(newSession);
    return { access, refresh };
  }
}
