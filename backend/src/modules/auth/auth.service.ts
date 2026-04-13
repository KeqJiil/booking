import { Body, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Roles } from 'generated/prisma/enums';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  private async signTokens(userId: string, role: Roles) {
    const accessToken = await this.jwt.signAsync(
      { userId, role },
      { expiresIn: '15m' },
    );
    const refreshToken = await this.jwt.signAsync(
      { userId, role },
      { expiresIn: '7d' },
    );
    return { accessToken, refreshToken };
  }

  public async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new UnauthorizedException();
    return user;
  }

  public async login(@Body() user: LoginDto) {}

  public async register(@Body() user: RegisterDto) {}

  public async refreshTokens(refreshToken: string) {
    const payload = await this.jwt.verifyAsync(refreshToken);
    if (!payload) throw new UnauthorizedException();
    return await this.signTokens(
      payload.userId as string,
      payload.role as Roles,
    );
  }
}
