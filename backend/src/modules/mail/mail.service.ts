import { Inject, Injectable } from '@nestjs/common';
import { IMailer } from './interfaces/IMailer.interface';
import { Resend } from 'resend';
import { welcomeTemplate } from 'src/templates/welcome';
import { registerTemplate } from 'src/templates/registerConfirm';
import { resetPasswordTemplate } from 'src/templates/forgotPassword';
import { Logger } from 'nestjs-pino';

@Injectable()
export class MailService implements IMailer {
  constructor(
    @Inject('MAIL_CLIENT') private readonly resend: Resend,
    @Inject('MAIL_MAIL') private readonly mailName: string,
    @Inject('BACKEND_URL') private readonly url: string,
    private readonly logger: Logger,
  ) {}

  async sendWelcome(userEmail: string, username: string): Promise<void> {
    await this.resend.emails.send({
      from: this.mailName,
      to: userEmail,
      subject: 'Welcome',
      html: (() => welcomeTemplate(username))(),
    });
  }

  async sendNotification(
    userEmail: string,
    data: Record<string, string>,
  ): Promise<void> {
    console.log('started');
    await this.resend.emails.send({
      from: this.mailName,
      to: userEmail,
      subject: 'Hello World',
      html: (() => welcomeTemplate('123'))(),
    });
  }

  async sendForgotPassword(
    email: string,
    uuid: string,
    username: string,
  ): Promise<void> {
    await this.resend.emails.send({
      from: this.mailName,
      to: email,
      subject: 'Reset Password',
      html: resetPasswordTemplate(username, uuid, this.url),
    });
  }

  async sendCheckOfAction(
    userEmail: string,
    actionName: string,
  ): Promise<void> {}

  async sendRegister(
    userEmail: string,
    username: string,
    uuid: string,
  ): Promise<void> {
    await this.resend.emails.send({
      from: this.mailName,
      to: userEmail,
      subject: 'Register',
      html: registerTemplate(username, uuid, this.url),
    });
    this.logger.log(`email was send on ${userEmail}`);
  }
}
