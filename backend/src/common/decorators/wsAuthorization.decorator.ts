import { applyDecorators, UseGuards } from '@nestjs/common';
import { ReqRole } from './reqRole.decorator';
import { Roles } from '../constants/roleLevels';
import { WsAuthGuard } from '../guards/MyAuthWsGuard.guard';

export function WsAuthorization(role: Roles) {
  return applyDecorators(ReqRole(role), UseGuards(WsAuthGuard));
}
