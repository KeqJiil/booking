import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IJwtAccess } from 'src/modules/auth/types';

export const AccessInfo = createParamDecorator(
  (data: keyof IJwtAccess | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user[data] : user;
  },
);
