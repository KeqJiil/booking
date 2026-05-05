import { Processor } from '@nestjs/bullmq';
import { Inject } from '@nestjs/common';
import type { IMailer } from '../interfaces/IMailer.interface';
import { eventNames } from 'src/common/constants/eventnames';
import { Job } from 'bullmq';
import type { IRegisterQueue } from 'src/infrastructure/bullmq/interfaces/IRegisterData.interface';
import { IForgotData } from 'src/infrastructure/bullmq/interfaces/IForgotPasswordData.interface';

@Processor('auth')
export class AuthWorker {
  constructor(@Inject('MAIL_CLIENT') private readonly service: IMailer) {}

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
    }
  }
}
