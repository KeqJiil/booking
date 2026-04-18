import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './modules/auth/auth.module';
import { CqrsModule } from '@nestjs/cqrs';
import { CacheModule } from '@nestjs/cache-manager';
import { UserModule } from './modules/user/user.module';
import { BookingModule } from './modules/booking/booking.module';
import { PropertyModule } from './modules/property/property.module';
import { ReviewModule } from './modules/review/review.module';
import { createKeyv } from '@keyv/redis';
import { PropertyTypeModule } from './modules/propertyType/propertyType.module';
import { PassportModule } from '@nestjs/passport';
import { MyJwtStrategy } from './modules/auth/strategies/jwt.strategy';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 5,
        },
      ],
    }),
    CqrsModule.forRoot(),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      isGlobal: true,
      useFactory: (config: ConfigService) => {
        const redisUrl = config.getOrThrow<string>('REDIS_URL');
        return {
          stores: [createKeyv(redisUrl)],
        };
      },
    }),
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
  ],
  providers: [MyJwtStrategy],
})
export class AppModule {}
