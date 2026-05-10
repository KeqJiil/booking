import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './modules/auth/auth.module';
import { CqrsModule } from '@nestjs/cqrs';
import { UserModule } from './modules/user/user.module';
import { BookingModule } from './modules/booking/booking.module';
import { PropertyModule } from './modules/property/property.module';
import { ReviewModule } from './modules/review/review.module';
import { PropertyTypeModule } from './modules/propertyType/propertyType.module';
import { PassportModule } from '@nestjs/passport';
import { MyJwtStrategy } from './modules/auth/strategies/jwt.strategy';
import { BullModule } from '@nestjs/bullmq';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { LoggerModule } from 'nestjs-pino';
import { ChatModule } from './modules/chat/chat.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { BillingModule } from './modules/billing/billing.module';
import { MailModule } from './modules/mail/mail.module';
import { StripeModule } from './infrastructure/payments/stripe/stripe.module';
import { IdempotencyModule } from './modules/idempotency/idempotency.module';
import { UploadModule } from './modules/upload/upload.module';
import { MinioModule } from './infrastructure/minio/minio.module';
import { RedisModule } from './infrastructure/redis/redis.module';
import { IdempotencyInterceptor } from './common/interceptors/idempotency.interceptor';
import { RedisService } from './infrastructure/redis/redis.service';
import { EventModule } from './infrastructure/bullmq/bull.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 15,
        },
      ],
    }),
    CqrsModule.forRoot(),
    AuthModule,
    UserModule,
    BookingModule,
    PropertyModule,
    ReviewModule,
    PropertyTypeModule,
    PassportModule.register({
      defaultStrategy: 'myJwt',
      global: true,
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          url: config.getOrThrow<string>('REDIS_URL'),
        },
      }),
    }),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    LoggerModule.forRoot({
      pinoHttp: {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        },
      },
    }),
    ChatModule,
    NotificationsModule,
    BillingModule,
    MailModule,
    StripeModule.forRootAsync(),
    IdempotencyModule,
    UploadModule,
    MinioModule,
    RedisModule,
    EventModule,
  ],
  providers: [
    MyJwtStrategy,
    IdempotencyInterceptor,
    {
      provide: 'REDIS',
      useClass: RedisService,
    },
  ],
})
export class AppModule {}
