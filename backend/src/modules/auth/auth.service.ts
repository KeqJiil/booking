import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Roles } from 'generated/prisma/enums';
import * as bcrypt from 'bcrypt';

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

  public async login(data: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: data.email,
      },
      select: {
        password: true,
        role: true,
        id: true,
      },
    });
    if (!user) throw new UnauthorizedException();
    const password = await bcrypt.compare(data.password, user.password);
    if (!password) throw new UnauthorizedException();
    const tokens = await this.signTokens(user.id, user.role);
    return tokens;
  }

  public async register(data: RegisterDto) {
    const password = await bcrypt.hash(data.password, 10);
    const newUser = await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password,
        userSettings: {
          create: {},
        },
      },
    });
    const tokens = await this.signTokens(newUser.id, newUser.role);
    return tokens;
  }

  public async refreshTokens(refreshToken: string) {
    const payload = await this.jwt.verifyAsync(refreshToken);
    if (!payload) throw new UnauthorizedException();
    return await this.signTokens(
      payload.userId as string,
      payload.role as Roles,
    );
  }
}
