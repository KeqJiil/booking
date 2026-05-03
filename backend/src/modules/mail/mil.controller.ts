import { Controller, Get } from '@nestjs/common';
import { MailService } from './mail.service';

@Controller('mail')
export class Contr {
  constructor(private readonly mail: MailService) {}
  @Get()
  async a() {
    await this.mail.sendNotification('132', { 13: '123' });
  }
}
