import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Optional,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/database/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
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
  private TTL = 7 * 24 * 60 * 60 * 1000;
  constructor(
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
    @Inject('REDIS') private cache: RedisService,
    private eventEmitter: EventEmitter2,
    @Optional() private readonly logger: Logger,
    private readonly userService: UserService,
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

    const refreshCheck = await bcrypt.compare(refreshToken, cache.refresh);
    if (!refreshCheck && cache.createdAt < Date.now() - 15_000)
      throw new UnauthorizedException('Bad token');

    const user = await this.userService.getUserById(payload.id);
    if (!user || user.status === 'DELETED')
      throw new UnauthorizedException('No such user');

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

  public async verify(uuid: string) {
    const cache = await this.cache.get<IRegisterData>(`user:${uuid}`);
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
    await this.cache.del(`user:${uuid}`);
    return tokens;
  }

  public async logout(refresh: string) {
    const payload = await this.jwt.verifyAsync(refresh);
    if (!payload) throw new UnauthorizedException();
    await this.cache.del(`session:${payload.sessionId}`);
    return true;
  }

  async forgotPassword(email: string) {
    const uuid = randomUUID();
    const user = await this.userService.getUserByEmail(email);
    if (!user) return;
    await this.cache.set(`reset:${uuid}`, user.id, this.TTL);
    const queueData: IForgotData = {
      username: user.name,
      email,
      uuid,
      userId: user.id,
    };
    this.eventEmitter.emit(eventNames.forgot_password, queueData);
  }

  async newPassword(newPassword: string, uuid: string) {
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
  }
}
