import {
  CallHandler,
  ConflictException,
  ExecutionContext,
  Inject,
  NestInterceptor,
} from '@nestjs/common';
import { catchError, from, mergeMap, Observable, of, tap } from 'rxjs';
import { idempotencyStatuses } from '../constants/idempotencyStatuses';
import { RedisService } from 'src/infrastructure/redis/redis.service';

export class IdempotencyInterceptor implements NestInterceptor {
  constructor(@Inject('REDIS') private cache: RedisService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const idempotency = context.switchToHttp().getRequest().headers[
      'idempotency'
    ] as string;
    if (!idempotency) return next.handle();
    return from(this.cache.get(idempotency)).pipe(
      mergeMap((cached: any) => {
        if (cached?.data) {
          return of(cached.data);
        }
        if (cached.status !== idempotencyStatuses.completed) {
          throw new ConflictException();
        }
        void this.cache.set(
          idempotency,
          {
            data: null,
            status: idempotencyStatuses.isProcess,
          },
          3 * 60 * 1000,
        );
        return next.handle().pipe(
          tap((res) => {
            void this.cache.set(idempotency, { data: res }, 60 * 60 * 1000);
          }),
          catchError((err) => {
            void this.cache.del(idempotency);
            throw err;
          }),
        );
      }),
    );
  }
}
