import {
  IOutboxData,
  IOutboxDataView,
  IOutboxRepository,
  IOutboxStatuses,
} from '../interfaces/outbox.interface';
import { Tx } from '../../transactions/interfaces/TransactionRepo.interface';
import { IOutboxDb } from '../interfaces/outboxDb.interface';
import { PrismaService } from 'src/database/prisma.service';
import { TypedId } from '../../../../common/typedId/typedID.generic';
import { Prisma } from '@prisma/client';

export abstract class OutboxRepository<
  T extends string,
  TPayload extends object,
  TID extends TypedId<any>,
> implements IOutboxRepository<Tx, T, TPayload, TID> {
  protected constructor(private readonly prisma: PrismaService) {}

  protected abstract serializePayload(raw: TPayload): Prisma.JsonValue;

  protected abstract fromDb(
    raw: IOutboxDb<any, any, any>,
  ): IOutboxDataView<T, TPayload, TID>;

  async createOutbox(
    data: IOutboxData<T, TPayload, TID>,
    tx: Tx,
  ): Promise<IOutboxDataView<T, TPayload, TID>> {
    const outbox = await tx.outbox.create({
      data: {
        type: data.type,
        itemId: data.itemId.toString(),
        payload: this.serializePayload(
          data.payload,
        ) as unknown as Prisma.InputJsonValue,
      },
    });
    return this.fromDb(outbox);
  }

  async getOutbox(
    status?: IOutboxStatuses,
  ): Promise<IOutboxDataView<T, TPayload, TID>[]> {
    const data = await this.prisma.outbox.findMany({
      where: { status, retries: { lt: 5 } },
      take: 30,
    });
    return data.map((el) => this.fromDb(el));
  }

  async getExpiredProcessing(
    tx: Tx,
  ): Promise<IOutboxDataView<T, TPayload, TID>[]> {
    const data = (await tx.$queryRaw`
      SELECT * 
      FROM "Outbox" 
      WHERE processing_at <= NOW() - INTERVAL '30 minutes' FOR UPDATE SKIP LOCKED LIMIT 50`) satisfies IOutboxDb<
      T,
      TPayload,
      TID
    >[];
    return data.map((el) => this.fromDb(el));
  }

  async markProcessing(
    id: string,
    tx: Tx,
  ): Promise<IOutboxDataView<T, TPayload, TID>> {
    const outbox = await tx.outbox.update({
      where: { id },
      data: { status: 'PROCESSING', processingAt: new Date(Date.now()) },
    });
    return this.fromDb(outbox);
  }

  async markSucceeded(
    id: string,
    tx: Tx,
  ): Promise<IOutboxDataView<T, TPayload, TID>> {
    const outbox = await tx.outbox.update({
      where: { id },
      data: { status: 'SUCCEEDED' },
    });
    return this.fromDb(outbox);
  }

  async markFailed(
    id: string,
    tx: Tx,
  ): Promise<IOutboxDataView<T, TPayload, TID>> {
    const outbox = await tx.outbox.update({
      where: { id },
      data: { status: 'FAILED' },
    });
    return this.fromDb(outbox);
  }

  async incrementRetries(
    id: string,
    tx: Tx,
  ): Promise<IOutboxDataView<T, TPayload, TID>> {
    const outbox = await tx.outbox.update({
      where: { id },
      data: {
        retries: {
          increment: 1,
        },
      },
    });
    return this.fromDb(outbox);
  }
}
