import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { PrismaModule } from 'src/database/prisma.module';
import { UserModule } from '../user/user.module';
import { AuthCronDeletion } from './infrastructure/cron/auth.cron';
import { RedisSessionRepository } from './infrastructure/repo/redisSesion.repository';
import {
  AUTH_CRYPTOR,
  AUTH_QUEUE,
  AUTH_REGISTER_REPO,
  AUTH_SESSION_REPO,
  HASHER,
  TOKEN_ISSUER_ACCESS,
  TOKEN_ISSUER_REFRESH,
} from 'src/common/constants/providerConstants';
import { Sha256HashService } from './infrastructure/services/sha256Hash.service';
import { JwtIssuerService } from './infrastructure/services/jwtIssuer.service';
import { SessionCreationService } from './application/services/sessionCreation.service';
import {
  IAccessTokenPayload,
  IRefreshTokenPayload,
} from './application/abstractions/tokenPayload.interface';
import { ITokenIssuerService } from './application/abstractions/TokenIssuer.interface';
import { RefreshCommandHandler } from './application/commands/RefreshSession.handler';
import { CryptoBcryptService } from './infrastructure/services/bycrypt.service';
import { RedisRegisterRepository } from './infrastructure/repo/redisRegister.repository';
import { EventEmitterAuthQueue } from './infrastructure/queue/eventEmitter.queue';

@Module({
  controllers: [AuthController],
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      global: true,
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          algorithm: 'HS256',
        },
      }),
    }),
    PrismaModule,
    UserModule,
  ],
  providers: [
    RefreshCommandHandler,
    SessionCreationService,
    AuthService,
    AuthCronDeletion,
    { provide: HASHER, useClass: Sha256HashService },
    { provide: AUTH_SESSION_REPO, useClass: RedisSessionRepository },
    {
      provide: TOKEN_ISSUER_ACCESS,
      useFactory: (
        jwtService: JwtService,
        config: ConfigService,
      ): ITokenIssuerService<IAccessTokenPayload> =>
        new JwtIssuerService<IAccessTokenPayload>(
          jwtService,
          Number(config.getOrThrow('ACCESS_TTL')),
        ),
      inject: [JwtService, ConfigService],
    },
    {
      provide: TOKEN_ISSUER_REFRESH,
      useFactory: (
        jwtService: JwtService,
        config: ConfigService,
      ): ITokenIssuerService<IRefreshTokenPayload> =>
        new JwtIssuerService<IRefreshTokenPayload>(
          jwtService,
          Number(config.getOrThrow('REFRESH_TTL')),
        ),
      inject: [JwtService, ConfigService],
    },
    {
      provide: AUTH_CRYPTOR,
      useFactory: (config: ConfigService): CryptoBcryptService =>
        new CryptoBcryptService(Number(config.getOrThrow('SALT_ROUNDS'))),
      inject: [ConfigService],
    },
    { provide: AUTH_REGISTER_REPO, useClass: RedisRegisterRepository },
    { provide: AUTH_QUEUE, useClass: EventEmitterAuthQueue },
  ],
  exports: [AuthService],
})
export class AuthModule {}
