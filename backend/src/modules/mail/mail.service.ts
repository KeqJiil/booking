import { Inject, Injectable } from '@nestjs/common';
import { IMailer } from './interfaces/IMailer.interface';
import { Resend } from 'resend';
import { welcomeTemplate } from 'src/templates/welcome';

@Injectable()
export class MailService implements IMailer {
  constructor(
    @Inject('MAIL_CLIENT') private readonly resend: Resend,
    @Inject('MAIL_MAIL') private readonly mailName: string,
  ) {}

  private async send() {}

  async sendWelcome(): Promise<void> {}

  async sendNotification(
    userEmail: string,
    data: Record<string, string>,
  ): Promise<void> {
    console.log('started');
    await this.resend.emails.send({
      from: this.mailName,
      to: '',
      subject: 'Hello World',
      html: (() => welcomeTemplate('123'))(),
    });
  }

  async sendForgotPassword(userEmail: string): Promise<void> {}

  async sendCheckOfAction(
    userEmail: string,
    actionName: string,
  ): Promise<void> {}

  async sendRegister(userEmail: string): Promise<void> {}
}
