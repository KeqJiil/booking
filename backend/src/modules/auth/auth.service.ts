import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { PrismaService } from 'src/database/prisma.service';
import { RegisterDto } from './application/dto/register.dto';
import { LoginDto } from './application/dto/login.dto';
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
import { ConfigService } from '@nestjs/config';
import { AUTH_REDIS_REPO, REDIS } from 'src/common/constants/providerConstants';
import type { SessionRepository } from './repo/sessionRepository.interface';
import { SessionId } from './domain/typedId/session.id';
import { UserId } from './domain/typedId/user.id';
import { ISessionCreate, Session } from './domain/session.entity';

@Injectable()
export class AuthService {
  private TTL: number;
  private RESET_TTL: number;
  private SALT_ROUNDS: number;
  constructor(
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
    @Inject(REDIS) private readonly cache: RedisService,
    private readonly eventEmitter: EventEmitter2,
    private readonly logger: Logger,
    private readonly userService: UserService,
    private readonly config: ConfigService,
    @Inject(AUTH_REDIS_REPO) private readonly sessionRepo: SessionRepository,
  ) {
    this.TTL = config.getOrThrow('TTL_CACHE');
    this.RESET_TTL = config.getOrThrow('TTL_RESET');
    this.SALT_ROUNDS = config.getOrThrow('SALT_ROUNDS');
  }

  private async createSession(
    userId: string,
    refresh: string,
    sessionId: string,
  ) {
    const hashed = this.hashToken(refresh);
    const sessionTypedId = new SessionId(sessionId);
    const userTypedId = new UserId(userId);
    const sessionProps: ISessionCreate = {
      id: sessionTypedId,
      userId: userTypedId,
      refreshHash: hashed,
      ttlMs: this.TTL,
    };
    const session = Session.create(sessionProps);
    await this.sessionRepo.save(session);
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private async signTokens(id: string, role: Roles, sessionId: string) {
    const accessToken = await this.jwt.signAsync(
      { id, role },
      { expiresIn: this.config.getOrThrow('ACCESS_TTL') },
    );
    const refreshToken = await this.jwt.signAsync(
      { id, role, sessionId },
      { expiresIn: this.config.getOrThrow('REFRESH_TTL') },
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

  public async login(data: LoginDto, ip: string) {
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

    const key = `login:${ip}:${user.id}`;

    const tries = await this.cache.raw().incr(key);
    const maxTries = this.config.getOrThrow('NUMBER_OF_LOGIN_TRIES');

    if (tries < maxTries) {
      await this.cache.raw().expire(key, 10 * 60);
    }

    if (tries > maxTries) {
      throw new HttpException(
        'Too many requests',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    if (!user.password) throw new BadRequestException();

    const password = await bcrypt.compare(data.password, user.password);
    if (!password) throw new UnauthorizedException();

    await this.cache.del(key);
    const sessionId = randomUUID();
    const tokens = await this.signTokens(user.id, user.role, sessionId);
    await this.createSession(user.id, tokens.refreshToken, sessionId);

    return tokens;
  }

  public async register(data: RegisterDto) {
    const password = await bcrypt.hash(data.password, this.SALT_ROUNDS);
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
      const userId = new UserId(cache.userId);
      await this.sessionRepo.deleteAllByUserId(userId);
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
    const sessionId = new SessionId(payload.sessionId);
    await this.sessionRepo.graceToken(refreshToken, sessionId);
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
    let userId: string | undefined;
    try {
      const payload = await this.jwt.verifyAsync<IPayload>(refresh);
      sessionId = payload.sessionId;
      userId = payload.id;
    } catch (err) {
      if (err instanceof TokenExpiredError) {
        const decoded = this.jwt.decode<IPayload>(refresh);
        sessionId = decoded?.sessionId;
        userId = decoded?.id;
      } else {
        throw new UnauthorizedException();
      }
    }
    const sessionTypedId = new SessionId(sessionId);
    const userTypedId = new UserId(userId);
    await this.sessionRepo.delete(sessionTypedId, userTypedId);
    return true;
  }

  public async logoutAllSessions(refresh: string) {
    const payload = await this.jwt.verifyAsync<IPayload>(refresh);
    if (!payload) throw new UnauthorizedException('No payload inside token');
    if (payload.id) {
      const userId = new UserId(payload.id);
      await this.sessionRepo.deleteAllByUserId(userId);
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
    const userId = await this.cache.get<string>(`reset:${uuid}`);
    if (!userId) throw new ForbiddenException();
    const hashed = await bcrypt.hash(newPassword, this.SALT_ROUNDS);
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        password: hashed,
      },
    });
    await this.cache.del(`reset:${uuid}`);
    const userTypedId = new UserId(userId);
    await this.sessionRepo.deleteAllByUserId(userTypedId);
  }
}
