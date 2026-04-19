import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { ITransactionRepo } from 'src/modules/property/application/interfaces.ts/TransactionRepo.interface';

@Injectable()
export class TransactionRepo implements ITransactionRepo {
  constructor(private readonly prisma: PrismaService) {}

  async startTransaction<T>(fn: (tx: unknown) => Promise<T>): Promise<T> {
    return await this.prisma.$transaction(fn);
  }
}
