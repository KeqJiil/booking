import { Injectable } from '@nestjs/common';
import { OutboxRepository } from '../../../../infrastructure/repo/outbox/repo/outbox.repository';
import { IOutboxDb } from '../../../../infrastructure/repo/outbox/interfaces/outboxDb.interface';
import {
  IBillingOutboxTypes,
  IOutboxBillingPayload,
  IOutboxBillingViewData,
} from './billingOutbox.types';
import { PaymentId } from '../../domain/typedId/paymentId';
import { JsonValue } from '@prisma/client/runtime/client';
import { PrismaService } from '../../../../database/prisma.service';

@Injectable()
export class BillingOutboxRepository extends OutboxRepository<
  IBillingOutboxTypes,
  IOutboxBillingPayload,
  PaymentId
> {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  protected serializePayload(raw: object): JsonValue {
    return raw as unknown as JsonValue;
  }

  protected fromDb(
    raw: IOutboxDb<string, object, string>,
  ): IOutboxBillingViewData {
    return {
      ...raw,
      payload: raw.payload as IOutboxBillingPayload,
      type: raw.type as IBillingOutboxTypes,
      itemId: new PaymentId(raw.itemId),
    } as IOutboxBillingViewData;
  }
}
