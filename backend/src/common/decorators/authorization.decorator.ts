import { applyDecorators, UseGuards } from '@nestjs/common';
import { Roles } from '@prisma/client';
import { ReqRole } from './reqRole.decorator';
import { MyAuthGuard } from '../guards/MyAuthGuard.guard';

export function Authorization(role: Roles) {
  return applyDecorators(ReqRole(role), UseGuards(MyAuthGuard));
}
