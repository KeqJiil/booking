import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/database/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Roles } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { randomUUID } from 'crypto';
import { IPayload, ISession } from './types';

@Injectable()
export class AuthService {
  private TTL = 7 * 24 * 60 * 60 * 1000;
  constructor(
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {}

  private async createSession(
    userId: string,
    refresh: string,
    sessionId: string,
  ) {
    const hashed = await bcrypt.hash(refresh, 10);
    await this.cache.set(
      `session:${sessionId}`,
      {
        userId,
        refresh: hashed,
        createdAt: Date.now(),
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
      },
      this.TTL,
    );
  }

  private async signTokens(id: string, role: Roles, sessionId: string) {
    const accessToken = await this.jwt.signAsync(
      { id, role },
      { expiresIn: '15m' },
    );
    const refreshToken = await this.jwt.signAsync(
      { id, role, sessionId },
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
        status: true,
      },
    });
    if (!user || user.status === 'DELETED') throw new UnauthorizedException();
    const password = await bcrypt.compare(data.password, user.password);
    if (!password) throw new UnauthorizedException();
    const sessionId = randomUUID();
    const tokens = await this.signTokens(user.id, user.role, sessionId);
    await this.createSession(user.id, tokens.refreshToken, sessionId);
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
    const sessionId = randomUUID();
    const tokens = await this.signTokens(newUser.id, newUser.role, sessionId);
    await this.createSession(newUser.id, tokens.refreshToken, sessionId);
    return tokens;
  }

  public async refreshTokens(refreshToken: string) {
    const payload = await this.jwt.verifyAsync<IPayload>(refreshToken);
    if (!payload) throw new UnauthorizedException();
    const cache = (await this.cache.get(
      `session:${payload.sessionId}`,
    )) as ISession;
    if (!cache || cache.expiresAt < Date.now())
      throw new UnauthorizedException();
    const refreshCheck = await bcrypt.compare(refreshToken, cache.refresh);
    if (!refreshCheck && cache.createdAt < Date.now() - 15_000)
      throw new UnauthorizedException();
    const user = await this.prisma.user.findUnique({
      where: { id: payload.id },
      select: { role: true, status: true },
    });
    if (!user || user.status === 'DELETED') throw new UnauthorizedException();
    const tokens = await this.signTokens(
      payload.id,
      user.role,
      payload.sessionId,
    );
    await this.createSession(
      payload.id,
      tokens.refreshToken,
      payload.sessionId,
    );
    return tokens;
  }

  public async logout(refresh: string) {
    const payload = await this.jwt.decode(refresh);
    if (!payload) throw new UnauthorizedException();
    await this.cache.del(`session:${payload.sessionId}`);
    return true;
  }
}
