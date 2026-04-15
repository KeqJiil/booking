import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { IJwtAccess } from '../types';

@Injectable()
export class MyJwtStrategy extends PassportStrategy(Strategy, 'myJwt') {
  constructor(
    private readonly config: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: IJwtAccess) {
    const user = await this.authService.validateUser(payload.id);
    if (!user) throw new UnauthorizedException();
    return { id: user.id, role: user.role };
  }
}
