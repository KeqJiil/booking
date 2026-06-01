import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoginCommand } from '../auth.commands';
import { ITokens } from '../../abstractions/types';
import type { IAuthDataRepository } from '../../../domain/repository/authData.interface';
import { Inject, NotFoundException } from '@nestjs/common';
import {
  AUTH_CRYPTOR,
  AUTH_USER_REPO,
  TOKEN_ISSUER_ACCESS,
  TOKEN_ISSUER_REFRESH,
} from 'src/common/constants/providerConstants';
import { Email } from '../../../domain/VO/emailVo';
import type { ICryptoService } from '../../abstractions/crypto.interface';
import { SessionCreationService } from '../../services/sessionCreation.service';
import type {
  IAccessTokenPayload,
  IRefreshTokenPayload,
} from '../../abstractions/tokenPayload.interface';
import type { ITokenIssuerService } from '../../abstractions/TokenIssuer.interface';
import { UserService } from 'src/modules/user/user.service';
import { SessionId } from '../../../domain/typedId/session.id';
import { randomUUID } from 'crypto';

@CommandHandler(LoginCommand)
export class LoginCommandHandler implements ICommandHandler<LoginCommand> {
  constructor(
    @Inject(AUTH_USER_REPO) private readonly authRepo: IAuthDataRepository,
    @Inject(AUTH_CRYPTOR) private readonly cryptor: ICryptoService,
    private readonly sessionCreator: SessionCreationService,
    @Inject(TOKEN_ISSUER_REFRESH)
    private readonly tokenIssuerRefresh: ITokenIssuerService<IRefreshTokenPayload>,
    @Inject(TOKEN_ISSUER_ACCESS)
    private readonly tokenIssuerAccess: ITokenIssuerService<IAccessTokenPayload>,
    private readonly userService: UserService,
  ) {}

  async execute(command: LoginCommand): Promise<ITokens> {
    const email = Email.create(command.data.email);
    const authUser = await this.authRepo.getByEmail(email);
    if (!authUser || !authUser.isActivated()) throw new NotFoundException();
    const password = await this.cryptor.compare(
      command.data.password,
      authUser.password,
    );
    if (!password) throw new NotFoundException();
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
    );
    return {
      access,
      refresh,
    };
  }
}
