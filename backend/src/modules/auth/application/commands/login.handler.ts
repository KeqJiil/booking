import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoginCommand } from './auth.commands';
import { ITokens } from '../../types';
import type { IAuthDataRepository } from '../../domain/repository/authData.interface';
import { Inject, UnauthorizedException } from '@nestjs/common';
import {
  AUTH_CRYPTOR,
  AUTH_USER_REPO,
  REFRESH_TTL,
  TOKEN_ISSUER_ACCESS,
  TOKEN_ISSUER_REFRESH,
} from 'src/common/constants/providerConstants';
import { Email } from '../../domain/VO/emailVo';
import type { ICrypto } from '../abstractions/crypto.interface';
import { SessionCreationService } from '../services/sessionCreation.service';
import type {
  IAccessTokenPayload,
  IRefreshTokenPayload,
} from '../abstractions/tokenPayload.interface';
import type { ITokenIssuerService } from '../abstractions/TokenIssuer.interface';
import { UserService } from 'src/modules/user/user.service';
import { SessionId } from '../../domain/typedId/session.id';
import { randomUUID } from 'crypto';

@CommandHandler(LoginCommand)
export class LoginCommandHandler implements ICommandHandler<LoginCommand> {
  constructor(
    @Inject(AUTH_USER_REPO) private readonly authRepo: IAuthDataRepository,
    @Inject(AUTH_CRYPTOR) private readonly cryptor: ICrypto,
    private readonly sessionCreator: SessionCreationService,
    @Inject(TOKEN_ISSUER_REFRESH)
    private readonly tokenIssuerRefresh: ITokenIssuerService<IRefreshTokenPayload>,
    @Inject(TOKEN_ISSUER_ACCESS)
    private readonly tokenIssuerAccess: ITokenIssuerService<IAccessTokenPayload>,
    private readonly userService: UserService,
    @Inject(REFRESH_TTL) private readonly ttl: { ttl: number },
  ) {}

  async execute(command: LoginCommand): Promise<ITokens> {
    const email = Email.create(command.data.email);
    const authUser = await this.authRepo.getByEmail(email);
    const password = await this.cryptor.compare(
      command.data.password,
      authUser.password,
    );
    if (!password) throw new UnauthorizedException();
    const { role } = await this.userService.getRole(authUser.userId);
    const sessionId = new SessionId(randomUUID());
    const access = await this.tokenIssuerAccess.sign({
      userId: authUser.userId.toString(),
      role,
    });
    const refresh = await this.tokenIssuerRefresh.sign({
      userId: authUser.userId.toString(),
      role,
      sessionId: sessionId.toString(),
    });
    await this.sessionCreator.createSession(
      authUser.userId,
      refresh,
      sessionId,
      this.ttl.ttl,
    );
    return {
      access,
      refresh,
    };
  }
}
