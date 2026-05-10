import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject } from '@nestjs/common';
import type { IMailer } from '../interfaces/IMailer.interface';
import { eventNames } from 'src/common/constants/eventnames';
import { Job } from 'bullmq';
import type { IRegisterQueue } from 'src/infrastructure/bullmq/proccessors/auth/interfaces/IRegisterData.interface';
import {
  IForgotData,
  IWelcomeData,
} from 'src/infrastructure/bullmq/proccessors/auth/interfaces/IForgotPasswordData.interface';

@Processor('auth')
export class AuthWorker extends WorkerHost {
  constructor(@Inject('MAIL_CLIENT') private readonly service: IMailer) {
    super();
  }

  async process(job: Job) {
    switch (job.name as keyof typeof eventNames) {
      case 'accound_need_confirmation': {
        const data: IRegisterQueue = job.data;
        await this.service.sendRegister(data.email, data.name, data.uuid);
        break;
      }
      case 'forgot_password': {
        const data: IForgotData = job.data;
        await this.service.sendForgotPassword(
          data.email,
          data.username,
          data.uuid,
        );
        break;
      }
      case 'account_created': {
        const data: IWelcomeData = job.data;
        await this.service.sendWelcome(data.email, data.username);
        break;
      }
    }
  }
}
