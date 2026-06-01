import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { VerifyAccountCommand } from '../auth.commands';
import {
  AUTH_QUEUE,
  AUTH_REGISTER_REPO,
  AUTH_USER_REPO,
} from 'src/common/constants/providerConstants';
import type { IRegisterRepository } from 'src/modules/auth/domain/repository/registerFlow.interface';
import { BadRequestException, Inject } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import type { IAuthQueue } from '../../abstractions/queue.interface';
import { eventNames } from 'src/common/constants/eventnames';
import type { IAuthDataRepository } from 'src/modules/auth/domain/repository/authData.interface';

@CommandHandler(VerifyAccountCommand)
export class VerifyAccontCommandHandler implements ICommandHandler<VerifyAccountCommand> {
  constructor(
    @Inject(AUTH_REGISTER_REPO)
    private readonly registerRepo: IRegisterRepository,
    private readonly logger: Logger,
    @Inject(AUTH_QUEUE) private readonly authQueue: IAuthQueue,
    @Inject(AUTH_USER_REPO) private readonly authUserRepo: IAuthDataRepository,
  ) {}

  async execute(command: VerifyAccountCommand): Promise<void> {
    const userData = await this.registerRepo.getById(command.uuid);
    if (!userData) throw new BadRequestException();
    const authUser = await this.authUserRepo.getById(userData.userId);
    if (!authUser) throw new BadRequestException();
    authUser.verify();
    await this.authUserRepo.save(authUser);
    await this.authQueue.post(eventNames.account_created, userData);
    this.logger.log(`User ${userData.userId.toString()} was verified`);
  }
}
