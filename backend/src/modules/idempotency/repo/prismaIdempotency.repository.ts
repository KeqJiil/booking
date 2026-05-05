import { Injectable } from '@nestjs/common';
import { IIdempotencyRepo } from '../interfaces/idempotencyRepo.interface';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/database/prisma.service';

type Tx = Prisma.TransactionClient;

@Injectable()
export class PrismaIdempotencyRepo implements IIdempotencyRepo {
  constructor(private readonly prisma: PrismaService) {}

  async find(key: string, tx: Tx): Promise<any> {
    const { userId, response } = await tx.idempotencyKey.findFirstOrThrow({
      where: {
        key,
      },
    });
    return { userId, response };
  }

  async create(key: string, userId: string, tx: Tx): Promise<string> {
    const { id } = await tx.idempotencyKey.create({
      data: {
        key,
        userId,
        expiredAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });
    return id;
  }

  async addInfo(
    key: string,
    statusCode: number,
    data: any,
    tx: Tx,
  ): Promise<void> {
    await tx.idempotencyKey.updateMany({
      where: { key },
      data: {
        statusCode,
        response: data,
      },
    });
  }

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
