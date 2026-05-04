import { Injectable } from '@nestjs/common';
import { IIdempotencyRepo } from '../interfaces/idempotencyRepo.interface';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/database/prisma.service';

type Tx = Prisma.TransactionClient;

@Injectable()
export class PrismaIdempotencyRepo implements IIdempotencyRepo {
  constructor(private readonly prisma: PrismaService) {}

  create(key: string, userId: string, tx: Tx): Promise<void> {}

  addInfo(statusCode: number, data: any, tx: Tx): Promise<void> {}

  async delete(): Promise<void> {
    await this.prisma.idempotencyKey.deleteMany({
      where: {
        expiredAt: {
          lte: new Date(),
        },
      },
    });
  }
}
