import { Module } from '@nestjs/common';
import { Contr } from './mil.controller';
import { MailService } from './mail.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Module({
  imports: [ConfigModule],
  controllers: [Contr],
  providers: [
    MailService,
    {
      provide: 'MAIL_CLIENT',
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const apiKey = config.getOrThrow<string>('RESEND_PASSWORD');
        return new Resend(apiKey);
      },
    },
    {
      provide: 'MAIL_MAIL',
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        config.getOrThrow<string>('RESEND_EMAIL'),
    },
  ],
})
export class MailModule {}
