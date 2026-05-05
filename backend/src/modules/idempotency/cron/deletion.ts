import { Inject, Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Logger } from 'nestjs-pino';
import type { IIdempotencyRepo } from '../interfaces/idempotencyRepo.interface';

@Injectable()
export class DeleteIdempotencyCron {
  constructor(
    private readonly logger: Logger,
    @Inject('IDEMPOTENCY_REPO') private readonly repo: IIdempotencyRepo,
  ) {}

  @Cron('0 0 0 * * *')
  async handleCompletedBookings() {
    this.logger.log('Deleting idempotency keys');
    await this.repo.delete();
  }
}
