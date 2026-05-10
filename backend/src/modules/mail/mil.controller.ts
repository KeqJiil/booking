import { Controller } from '@nestjs/common';
import { MailService } from './mail.service';

@Controller('mail')
export class Contr {
  constructor(private readonly mail: MailService) {}
}
