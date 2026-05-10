import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Queue } from 'bullmq';
import { eventNames } from 'src/common/constants/eventnames';
import type {
  IForgotData,
  IWelcomeData,
} from './interfaces/IForgotPasswordData.interface';
import type { IRegisterQueue } from './interfaces/IRegisterData.interface';

@Injectable()
export class AuthBullBridge {
  constructor(@InjectQueue('mail') private mailQueue: Queue) {}

  @OnEvent(eventNames.forgot_password)
  async forgotPassword(payload: IForgotData) {
    await this.mailQueue.add(eventNames.forgot_password, payload, {
      attempts: 5,
      backoff: { type: 'exponential', delay: 500 },
    });
  }

  @OnEvent(eventNames.accound_need_confirmation)
  async accountConfirmation(payload: IRegisterQueue) {
    await this.mailQueue.add(eventNames.accound_need_confirmation, payload, {
      attempts: 5,
      backoff: { type: 'exponential', delay: 500 },
    });
  }

  @OnEvent(eventNames.account_created)
  async accountCreated(payload: IWelcomeData) {
    await this.mailQueue.add(eventNames.account_created, payload);
  }
}
