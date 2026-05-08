import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { TransactionRepo } from 'src/infrastructure/repo/transactions/repo/Transaction.repository';

@Global()
@Module({
  providers: [PrismaService, TransactionRepo],
  exports: [PrismaService, TransactionRepo],
})
export class PrismaModule {}
