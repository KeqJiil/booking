import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { TransactionRepo } from 'src/infrastructure/repo/transactions/repo/Transaction.repository';
import { OutboxRepository } from 'src/infrastructure/repo/outbox/repo/outbox.repository';

@Global()
@Module({
  providers: [PrismaService, TransactionRepo, OutboxRepository],
  exports: [PrismaService, TransactionRepo, OutboxRepository],
})
export class PrismaModule {}
