import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RegisterCommand } from '../auth.commands';
import { ConflictException, Inject } from '@nestjs/common';
import {
  AUTH_CRYPTOR,
  AUTH_QUEUE,
  AUTH_REGISTER_REPO,
  AUTH_USER_REPO,
} from 'src/common/constants/providerConstants';
import type { ICryptoService } from '../../abstractions/crypto.interface';
import { UserService } from 'src/modules/user/user.service';
import type { IRegisterRepository } from '../../../domain/repository/registerFlow.interface';
import { UserId } from '../../../domain/typedId/user.id';
import type { IAuthQueue } from '../../abstractions/queue.interface';
import { randomUUID } from 'crypto';
import { eventNames } from 'src/common/constants/eventnames';
import type { IAuthDataRepository } from '../../../domain/repository/authData.interface';
import { AuthUser } from '../../../domain/entity/AuthUser';
import { AuthId } from '../../../domain/typedId/auth.id';
import { Email } from '../../../domain/VO/emailVo';

@CommandHandler(RegisterCommand)
export class RegisterCommandHandler implements ICommandHandler<RegisterCommand> {
  constructor(
    @Inject(AUTH_USER_REPO) private readonly authRepo: IAuthDataRepository,
    @Inject(AUTH_CRYPTOR) private readonly crypto: ICryptoService,
    private readonly userService: UserService,
    @Inject(AUTH_REGISTER_REPO)
    private readonly registerRepo: IRegisterRepository,
    @Inject(AUTH_QUEUE) private readonly authQueue: IAuthQueue,
  ) {}

  async execute(command: RegisterCommand): Promise<void> {
    const { email, name } = command.data;
    const userId = new UserId(randomUUID());
    const authId = new AuthId(randomUUID());
    const emailVO = Email.create(email);
    const existing = await this.authRepo.getByEmail(emailVO);
    if (existing) throw new ConflictException('Email already in use');
    const password = await this.crypto.crypto(command.data.password);
    const authUser = AuthUser.create(authId, userId, emailVO, password);
    const newUser = await this.userService.createUser({
      userId: userId.toString(),
      name,
    });
    await this.authRepo.save(authUser);
    const uuid = randomUUID();
    const queueData = {
      username: newUser.name,
      email,
      uuid,
    };
    await this.registerRepo.save(userId, uuid);
    await this.authQueue.post(eventNames.accound_need_confirmation, queueData);
  }
}
