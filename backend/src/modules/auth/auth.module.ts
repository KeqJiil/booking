import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { PrismaModule } from 'src/database/prisma.module';
import { RedisModule } from 'src/infrastructure/redis/redis.module';
import { UserModule } from '../user/user.module';
import { AuthCronDeletion } from './application/cron/auth.cron';
import { RedisSessionRepository } from './repo/redisSesion.repository';
import { AUTH_REDIS_REPO } from 'src/common/constants/providerConstants';

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
    RedisModule,
    UserModule,
  ],
  providers: [
    AuthService,
    AuthCronDeletion,
    { provide: AUTH_REDIS_REPO, useClass: RedisSessionRepository },
  ],
  exports: [AuthService],
})
export class AuthModule {}
