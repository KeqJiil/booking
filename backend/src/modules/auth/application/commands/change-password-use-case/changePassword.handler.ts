import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ChangePasswordCommand } from '../auth.commands';
import {
  AUTH_CRYPTOR,
  AUTH_QUEUE,
  AUTH_USER_REPO,
} from 'src/common/constants/providerConstants';
import { BadRequestException, Inject } from '@nestjs/common';
import type { IAuthDataRepository } from 'src/modules/auth/domain/repository/authData.interface';
import { UserId } from 'src/modules/auth/domain/typedId/user.id';
import type { ICryptoService } from '../../abstractions/crypto.interface';
import type { IAuthQueue } from '../../abstractions/queue.interface';
import { eventNames } from 'src/common/constants/eventnames';

@CommandHandler(ChangePasswordCommand)
export class ChangePasswordCommandHandler implements ICommandHandler<ChangePasswordCommand> {
  constructor(
    @Inject(AUTH_USER_REPO) private readonly authUserRepo: IAuthDataRepository,
    @Inject(AUTH_CRYPTOR) private readonly cryptor: ICryptoService,
    @Inject(AUTH_QUEUE) private readonly authQueue: IAuthQueue,
  ) {}

  async execute(command: ChangePasswordCommand): Promise<void> {
    const userId = new UserId(command.userId);
    const authUser = await this.authUserRepo.getById(userId);
    if (!authUser) throw new BadRequestException();
    const isMatch = await this.cryptor.compare(
      command.oldPassword,
      authUser.password,
    );
    if (!isMatch) throw new BadRequestException();
    const newHashed = await this.cryptor.crypto(command.newPassword);
    authUser.changePassword(newHashed);
    await this.authUserRepo.save(authUser);
    await this.authQueue.post(eventNames.password_changed, {
      userId: authUser.id.toString(),
    });
  }
}
