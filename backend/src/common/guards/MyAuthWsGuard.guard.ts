import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import { AuthService } from 'src/modules/auth/auth.service';

@Injectable()
export class WsAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<Socket>();
    const token = client.handshake.auth.token as string;
    if (!token) return false;
    try {
      const payload = await this.jwtService.verifyAsync(token);
      const user = await this.authService.validateUser(payload.id);
      client['user'] = { id: user.id, role: user.role };
      return true;
    } catch {
      return false;
    }
  }
}
