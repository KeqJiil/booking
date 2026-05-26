import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { TransactionRepo } from 'src/infrastructure/repo/transactions/repo/Transaction.repository';
import { OutboxRepository } from 'src/infrastructure/repo/outbox/repo/outbox.repository';
import { PRISMA_TRANSACTION_CLIENT } from 'src/common/constants/providerConstants';

@Global()
@Module({
  providers: [
    PrismaService,
    TransactionRepo,
    { provide: PRISMA_TRANSACTION_CLIENT, useExisting: TransactionRepo },
    OutboxRepository,
  ],
  exports: [PrismaService, OutboxRepository, PRISMA_TRANSACTION_CLIENT],
})
export class PrismaModule {}
