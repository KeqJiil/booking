import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForgotChangePasswordCommand } from '../auth.commands';
import { BadRequestException, Inject } from '@nestjs/common';
import {
  AUTH_CRYPTOR,
  AUTH_EMAIL_FORGOT_REPO,
  AUTH_SESSION_REPO,
  AUTH_USER_REPO,
} from 'src/common/constants/providerConstants';
import { IForgotPasswordPayload } from '../../abstractions/forgotPasswordPayload.interface';
import type { IEmailInteractRepository } from 'src/modules/auth/domain/repository/emailInteract.interface';
import type { IAuthDataRepository } from 'src/modules/auth/domain/repository/authData.interface';
import type { ICryptoService } from '../../abstractions/crypto.interface';
import type { SessionRepository } from 'src/modules/auth/domain/repository/sessionRepository.interface';

@CommandHandler(ForgotChangePasswordCommand)
export class ForgotChangePasswordCommandHandler implements ICommandHandler<ForgotChangePasswordCommand> {
  constructor(
    @Inject(AUTH_EMAIL_FORGOT_REPO)
    private readonly emailForgotRepo: IEmailInteractRepository<IForgotPasswordPayload>,
    @Inject(AUTH_USER_REPO) private readonly authUserRepo: IAuthDataRepository,
    @Inject(AUTH_CRYPTOR) private readonly cryptor: ICryptoService,
    @Inject(AUTH_SESSION_REPO) private readonly sessionRepo: SessionRepository,
  ) {}

  async execute(command: ForgotChangePasswordCommand): Promise<void> {
    const data = await this.emailForgotRepo.findById(command.uuid);
    if (!data) throw new BadRequestException();
    const newHashed = await this.cryptor.crypto(command.password);
    const authUser = await this.authUserRepo.getById(data.userId);
    if (!authUser) throw new BadRequestException();
    authUser.changePassword(newHashed);
    await this.authUserRepo.save(authUser);
    await this.emailForgotRepo.deleteKey(command.uuid);
    await this.sessionRepo.deleteAllByUserId(data.userId);
  }
}
