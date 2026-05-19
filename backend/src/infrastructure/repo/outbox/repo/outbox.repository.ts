import { Injectable } from '@nestjs/common';
import {
  IOutboxData,
  IOutboxDataView,
  IOutboxRepository,
  IOutboxStatuses,
} from '../interfaces/outbox.interface';
import { Tx } from '../../transactions/interfaces/TransactionRepo.interface';
import { IOutboxDb } from '../interfaces/outboxDb.interface';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class OutboxRepository implements IOutboxRepository<Tx> {
  constructor(private readonly prisma: PrismaService) {}

  private getDataType(data: IOutboxDb): IOutboxDataView {
    return {
      id: data.id,
      itemId: data.itemId,
      type: data.type,
      payload: data.payload,
      status: data.status,
      retries: data.retries,
      ...(data.processingAt ? { processingAt: data.processingAt } : {}),
    };
  }

  async createOutbox(data: IOutboxData, tx: Tx): Promise<IOutboxDataView> {
    const outbox = await tx.outbox.create({
      data: { type: data.type, itemId: data.itemId, payload: data.payload },
    });
    return this.getDataType(outbox);
  }

  async getOutbox(status?: IOutboxStatuses): Promise<IOutboxDataView[]> {
    const data = await this.prisma.outbox.findMany({
      where: { status, retries: { lt: 5 } },
      take: 10,
    });
    return data.map((el) => this.getDataType(el));
  }

  async markProcessing(id: string, tx: Tx): Promise<IOutboxDataView> {
    const outbox = await tx.outbox.update({
      where: { id },
      data: { status: 'PROCESSING' },
    });
    return this.getDataType(outbox);
  }

  async markSucceeded(id: string, tx: Tx): Promise<IOutboxDataView> {
    const outbox = await tx.outbox.update({
      where: { id },
      data: { status: 'SUCCEEDED' },
    });
    return this.getDataType(outbox);
  }

  async markFailed(id: string, tx: Tx): Promise<IOutboxDataView> {
    const outbox = await tx.outbox.update({
      where: { id },
      data: { status: 'FAILED' },
    });
    return this.getDataType(outbox);
  }

  async incrementRetries(id: string, tx: Tx): Promise<IOutboxDataView> {
    const outbox = await tx.outbox.update({
      where: { id },
      data: {
        retries: {
          increment: 1,
        },
      },
    });
    return this.getDataType(outbox);
  }
}
