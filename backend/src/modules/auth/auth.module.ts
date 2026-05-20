import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { PrismaModule } from 'src/database/prisma.module';
import { RedisModule } from 'src/infrastructure/redis/redis.module';
import { UserModule } from '../user/user.module';
import { AuthCronDeletion } from './cron/auth.cron';

@Module({
  controllers: [AuthController],
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      global: true,
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
      }),
    }),
    PrismaModule,
    RedisModule,
    UserModule,
  ],
  providers: [AuthService, AuthCronDeletion],
  exports: [AuthService],
})
export class AuthModule {}
