import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForgotPasswordCommand } from '../auth.commands';
import { randomUUID } from 'crypto';
import {
  AUTH_EMAIL_FORGOT_REPO,
  AUTH_QUEUE,
  AUTH_USER_REPO,
} from 'src/common/constants/providerConstants';
import { Inject } from '@nestjs/common';
import { IForgotPasswordPayload } from '../../abstractions/forgotPasswordPayload.interface';
import type { IEmailInteractRepository } from 'src/modules/auth/domain/repository/emailInteract.interface';
import type { IAuthDataRepository } from 'src/modules/auth/domain/repository/authData.interface';
import { Email } from 'src/modules/auth/domain/VO/emailVo';
import type { IAuthQueue } from '../../abstractions/queue.interface';
import { eventNames } from 'src/common/constants/eventnames';

@CommandHandler(ForgotPasswordCommand)
export class ForgotPasswordCommandHandler implements ICommandHandler<ForgotPasswordCommand> {
  constructor(
    @Inject(AUTH_EMAIL_FORGOT_REPO)
    private readonly emailForgotRepo: IEmailInteractRepository<IForgotPasswordPayload>,
    @Inject(AUTH_USER_REPO) private readonly authUserRepo: IAuthDataRepository,
    @Inject(AUTH_QUEUE) private readonly authQueue: IAuthQueue,
  ) {}

  async execute(command: ForgotPasswordCommand): Promise<void> {
    const uuid = randomUUID();
    const email = Email.create(command.email);
    const authUser = await this.authUserRepo.getByEmail(email);
    if (!authUser) return;
    const data: IForgotPasswordPayload = {
      uuid,
      userId: authUser.userId,
      email,
    };
    await this.emailForgotRepo.save(uuid, data);
    await this.authQueue.post(eventNames.forgot_password, data);
  }
}
