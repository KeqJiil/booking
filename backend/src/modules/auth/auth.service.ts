import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { PrismaService } from 'src/database/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { createHash, randomUUID } from 'crypto';
import { IPayload, IRegisterData, ISession } from './types';
import { Roles } from 'src/common/constants/roleLevels';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { eventNames } from 'src/common/constants/eventnames';
import { Logger } from 'nestjs-pino';
import { IRegisterQueue } from 'src/infrastructure/bullmq/proccessors/auth/interfaces/IRegisterData.interface';
import { RedisService } from 'src/infrastructure/redis/redis.service';
import { UserService } from '../user/user.service';
import {
  IForgotData,
  IWelcomeData,
} from 'src/infrastructure/bullmq/proccessors/auth/interfaces/IForgotPasswordData.interface';

@Injectable()
export class AuthService {
  private TTL = 7 * 24 * 60 * 60;
  private RESET_TTL = 30 * 60;
  constructor(
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
    private readonly cache: RedisService,
    private eventEmitter: EventEmitter2,
    private readonly logger: Logger,
    private readonly userService: UserService,
  ) {}

  private async createSession(
    userId: string,
    refresh: string,
    sessionId: string,
  ) {
    const sessionName = `session:${sessionId}`;
    const hashed = this.hashToken(refresh);
    await this.cache.set(
      sessionName,
      {
        userId,
        refresh: hashed,
        createdAt: Date.now(),
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
      },
      this.TTL,
    );
    await this.cache.sadd(`user:session:${userId}`, sessionName);
  }

  private async graceToken(token: string, sessionId: string) {
    await this.cache.set(`${sessionId}:grace:${token}`, token, 15);
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
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

  private async revokeAllSessions(userId: string) {
    const sessions = await this.cache.smembers(`user:session:${userId}`);
    const tx = this.cache.raw().multi();
    for (const s of sessions) {
      tx.del(s);
    }
    tx.del(`user:session:${userId}`);
    await tx.exec();
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

    if (!user || user.status !== 'ALIVE') throw new UnauthorizedException();
    if (!user.password) throw new BadRequestException();
    const password = await bcrypt.compare(data.password, user.password);
    if (!password) throw new UnauthorizedException();

    const sessionId = randomUUID();
    const tokens = await this.signTokens(user.id, user.role, sessionId);
    await this.createSession(user.id, tokens.refreshToken, sessionId);

    return tokens;
  }

  public async register(data: RegisterDto) {
    const password = await bcrypt.hash(data.password, 10);
    const newUser = await this.userService.createUser({
      password,
      email: data.email,
      name: data.name,
    });
    const uuid = randomUUID();
    const cacheData: IRegisterData = {
      uuid,
      userId: newUser.id,
    };
    await this.cache.set(`user:${uuid}`, cacheData, this.TTL);
    const queueData: IRegisterQueue = {
      uuid,
      name: newUser.name,
      email: newUser.email,
      userId: newUser.id,
    };
    this.eventEmitter.emit(eventNames.accound_need_confirmation, queueData);
  }

  public async refreshTokens(refreshToken: string) {
    const payload = await this.jwt.verifyAsync<IPayload>(refreshToken);
    if (!payload) throw new UnauthorizedException('No payload inside token');

    const cache = await this.cache.get<ISession>(
      `session:${payload.sessionId}`,
    );
    if (!cache || cache.expiresAt < Date.now())
      throw new UnauthorizedException('No cache or cache expired');

    const refreshCheck = cache.refresh === this.hashToken(refreshToken);
    const grace = await this.cache.get<string>(
      `${payload.sessionId}:grace:${refreshToken}`,
    );
    if (!refreshCheck && grace !== refreshToken) {
      this.logger.warn(`Reuse detected ${grace}`);
      await this.revokeAllSessions(cache.userId);
      throw new UnauthorizedException('Reuse detected');
    }

    const user = await this.userService.getUserById(payload.id);
    if (!user || user.status === 'DELETED')
      throw new UnauthorizedException('No such user');

    const tokens = await this.signTokens(
      payload.id,
      user.role,
      payload.sessionId,
    );
    await this.graceToken(refreshToken, payload.sessionId);
    await this.createSession(
      payload.id,
      tokens.refreshToken,
      payload.sessionId,
    );
    return tokens;
  }

  public async verify(uuid: string) {
    const cache = await this.cache.getdel<IRegisterData>(`user:${uuid}`);
    if (!cache) throw new BadRequestException();
    const user = await this.userService.verifyUser(cache.userId);
    const sessionId = randomUUID();
    const tokens = await this.signTokens(user.id, user.role, sessionId);
    await this.createSession(user.id, tokens.refreshToken, sessionId);

    const eventData: IWelcomeData = {
      email: user.email,
      username: user.name,
      userId: user.id,
    };
    this.eventEmitter.emit(eventNames.account_created, eventData);

    this.logger.log(user, `New user created`);
    return tokens;
  }

  public async logout(refresh: string) {
    let sessionId: string | undefined;
    try {
      const payload = await this.jwt.verifyAsync<IPayload>(refresh);
      sessionId = payload.sessionId;
    } catch (err) {
      if (err instanceof TokenExpiredError) {
        const decoded = this.jwt.decode<IPayload | null>(refresh);
        sessionId = decoded?.sessionId;
      } else {
        throw new UnauthorizedException();
      }
    }
    const session = await this.cache.get<ISession>(`session:${sessionId}`);
    await this.cache.del(`session:${sessionId}`);
    if (session)
      await this.cache.srem(
        `user:session:${session.userId}`,
        `session:${sessionId}`,
      );
    return true;
  }

  public async logoutAllSessions(refresh: string) {
    const payload = await this.jwt.verifyAsync<IPayload>(refresh);
    if (!payload) throw new UnauthorizedException('No payload inside token');
    if (payload.id) {
      await this.revokeAllSessions(payload.id);
      return;
    }
    throw new UnauthorizedException();
  }

  public async forgotPassword(email: string) {
    const uuid = randomUUID();
    const user = await this.userService.getUserByEmail(email);
    if (!user) return;
    await this.cache.set(`reset:${uuid}`, user.id, this.RESET_TTL);
    const queueData: IForgotData = {
      username: user.name,
      email,
      uuid,
      userId: user.id,
    };
    this.eventEmitter.emit(eventNames.forgot_password, queueData);
  }

  public async newPassword(newPassword: string, uuid: string) {
    const cache = await this.cache.get<string>(`reset:${uuid}`);
    if (!cache) throw new ForbiddenException();
    const hashed = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: {
        id: cache,
      },
      data: {
        password: hashed,
      },
    });
    await this.cache.del(`reset:${uuid}`);
    await this.revokeAllSessions(cache);
  }
}
