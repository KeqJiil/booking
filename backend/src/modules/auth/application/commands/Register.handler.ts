import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RegisterCommand } from './auth.commands';
import { Inject } from '@nestjs/common';
import {
  AUTH_CRYPTOR,
  AUTH_QUEUE,
  AUTH_REGISTER_REPO,
} from 'src/common/constants/providerConstants';
import type { ICrypto } from '../abstractions/crypto.interface';
import { UserService } from 'src/modules/user/user.service';
import type { IRegisterRepository } from '../../domain/repository/registerFlow.interface';
import { UserId } from '../../domain/typedId/user.id';
import type { IAuthQueue } from '../abstractions/queue.interface';
import { IRegisterQueue } from 'src/infrastructure/bullmq/proccessors/auth/interfaces/IRegisterData.interface';
import { randomUUID } from 'crypto';
import { eventNames } from 'src/common/constants/eventnames';

@CommandHandler(RegisterCommand)
export class RegisterCommandHandler implements ICommandHandler<RegisterCommand> {
  constructor(
    @Inject(AUTH_CRYPTOR) private readonly crypto: ICrypto,
    private readonly userService: UserService,
    @Inject(AUTH_REGISTER_REPO)
    private readonly registerRepo: IRegisterRepository,
    @Inject(AUTH_QUEUE) private readonly authQueue: IAuthQueue,
  ) {}

  async execute(command: RegisterCommand): Promise<void> {
    const { email, name } = command.data;
    const password = await this.crypto.crypto(command.data.password);
    const newUser = await this.userService.createUser({
      email,
      password,
      name,
    });
    const userId = new UserId(newUser.id);
    await this.registerRepo.save(userId);
    const queueData: IRegisterQueue = {
      uuid: randomUUID(),
      name: newUser.name,
      email: newUser.email,
      userId: newUser.id,
    };
    await this.authQueue.post(eventNames.accound_need_confirmation, queueData);
  }
}
