import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';

export const IdempotencyAccess = createParamDecorator(
  (data: any, ctx: ExecutionContext) => {
    const headers = ctx.switchToHttp().getRequest().headers;
    if (!headers['idempotency']) throw new BadRequestException();
    return headers['idempotency'];
  },
);
