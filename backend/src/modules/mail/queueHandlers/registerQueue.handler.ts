import { Processor, WorkerHost } from '@nestjs/bullmq';
import { eventNames } from 'src/common/constants/eventnames';
import { Job } from 'bullmq';
import type { IRegisterQueue } from 'src/infrastructure/bullmq/proccessors/auth/interfaces/IRegisterData.interface';
import {
  IForgotData,
  IWelcomeData,
} from 'src/infrastructure/bullmq/proccessors/auth/interfaces/IForgotPasswordData.interface';
import { Logger } from 'nestjs-pino';
import { MailService } from '../mail.service';

@Processor('mail')
export class MailWorker extends WorkerHost {
  constructor(
    private readonly service: MailService,
    private readonly logger: Logger,
  ) {
    super();
  }

  async process(job: Job) {
    switch (job.name as keyof typeof eventNames) {
      case 'accound_need_confirmation': {
        const data: IRegisterQueue = job.data;
        this.logger.log(`new user on email: ${data.email}`);
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
