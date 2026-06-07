import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import { UserService } from 'src/modules/user/user.service';

@Injectable()
export class WsAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<Socket>();
    const token = client.handshake.auth.token as string;
    if (!token) return false;
    try {
      const payload = await this.jwtService.verifyAsync(token);
      const user = await this.userService.getUserById(payload.id as string);
      if (!user) return false;
      client['user'] = { id: user.id, role: user.role };
      return true;
    } catch {
      return false;
    }
  }
}
