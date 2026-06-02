import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IJwtAccess } from '../application/abstractions/types';
import { UserService } from 'src/modules/user/user.service';

@Injectable()
export class MyJwtStrategy extends PassportStrategy(Strategy, 'myJwt') {
  constructor(
    private readonly config: ConfigService,
    private readonly userSerive: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: IJwtAccess) {
    const user = await this.userSerive.getUserById(payload.id);
    if (!user) throw new UnauthorizedException();
    return { id: user.id, role: user.role };
  }
}
