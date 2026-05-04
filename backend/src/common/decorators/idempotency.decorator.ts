import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const IdempotencyAccess = createParamDecorator(
  (data: any, ctx: ExecutionContext) => {
    const headers = ctx.switchToHttp().getRequest().headers;
    return headers['idempotency'];
  },
);
