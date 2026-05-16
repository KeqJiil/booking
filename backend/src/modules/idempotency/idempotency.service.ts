import { ConflictException, Inject, Injectable } from '@nestjs/common';
import type { IIdempotencyRepo } from './interfaces/idempotencyRepo.interface';

@Injectable()
export class IdempotencyService {
  constructor(
    @Inject('IDEMPOTENCY_REPO') private readonly repo: IIdempotencyRepo,
  ) {}

  async createOrGet(key: string, tx: unknown, userId: string) {
    try {
      const newKey = await this.repo.create(key, userId, tx);
      return { id: newKey, isDuplicate: false };
    } catch (error) {
      if (error.code === 'P2002') {
        const data = await this.repo.find(key, tx);
        if (data) {
          return {
            response: data,
            isDuplicate: true,
          };
        }
        throw new ConflictException();
      }
      throw new Error();
    }
  }

  async complete(key: string, tx: unknown, data: any, statusCode: number) {
    await this.repo.addInfo(key, statusCode, data, tx);
  }
}
