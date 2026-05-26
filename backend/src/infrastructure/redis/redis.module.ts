import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { REDIS, REDISCLIENT } from 'src/common/constants/providerConstants';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: REDISCLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const url = config.getOrThrow<string>('REDIS_URL');
        return new Redis(url);
      },
    },
    RedisService,
    { provide: REDIS, useExisting: RedisService },
  ],
  exports: [REDIS],
})
export class RedisModule {}
