import { applyDecorators, UseGuards } from '@nestjs/common';
import { ReqRole } from './reqRole.decorator';
import { MyAuthGuard } from '../guards/MyAuthGuard.guard';
import { Roles } from '../constants/roleLevels';

export function Authorization(role: Roles) {
  return applyDecorators(ReqRole(role), UseGuards(MyAuthGuard));
}
