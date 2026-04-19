import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import {
  ITransactionRepo,
  TOptionsTransaction,
} from '../../application/interfaces.ts/TransactionRepo.interface';

@Injectable()
export class TransactionRepo implements ITransactionRepo {
  constructor(private readonly prisma: PrismaService) {}

  async startTransaction(
    fn: (tx: unknown) => Promise<void>,
    options?: TOptionsTransaction,
  ): Promise<void> {
    return await this.prisma.$transaction(async (tx) => {
      await fn(tx);
    }, options);
  }
}
