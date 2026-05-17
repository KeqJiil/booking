import { Injectable } from '@nestjs/common';
import {
  IOutboxData,
  IOutboxDataView,
  IOutboxRepository,
} from '../interfaces/outbox.interface';
import { Tx } from '../../transactions/interfaces/TransactionRepo.interface';
import { IOutboxDb } from '../interfaces/outboxDb.interface';

@Injectable()
export class OutboxRepository implements IOutboxRepository<Tx> {
  constructor() {}

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
