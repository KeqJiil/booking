import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { PrismaModule } from 'src/database/prisma.module';
import { BullModule } from '@nestjs/bullmq';
import { RedisModule } from 'src/infrastructure/redis/redis.module';
import { RedisService } from 'src/infrastructure/redis/redis.service';
import { UserModule } from '../user/user.module';

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
    BullModule.registerQueue({
      name: 'auth',
    }),
    RedisModule,
    UserModule,
  ],
  providers: [AuthService, { provide: 'REDIS', useClass: RedisService }],
  exports: [AuthService],
})
export class AuthModule {}
