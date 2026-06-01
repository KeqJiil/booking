import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Socket } from 'socket.io';
import { IJwtAccess } from 'src/modules/auth/application/abstractions/types';

export const WsAccessInfo = createParamDecorator(
  (data: keyof IJwtAccess | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToWs().getClient<Socket>();
    const user = request.handshake.auth.user || request['user'];
    return data ? user[data] : user;
  },
);
