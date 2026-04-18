import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { roleLevels, Roles } from '../constants/roleLevels';

@Injectable()
export class MyAuthGuard extends AuthGuard('myJwt') {
  constructor(private readonly reflect: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isAuthenticated = await super.canActivate(context);
    if (!isAuthenticated) return false;
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const role = this.reflect.getAllAndOverride<Roles>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (roleLevels[role] > roleLevels[user.role])
      throw new ForbiddenException();
    return true;
  }
}
