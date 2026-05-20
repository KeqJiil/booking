import { Module } from '@nestjs/common';
import { PropertyController } from './property.controller';
import { PrismaPropertyRepository } from './infrastructure/repo/PrismaProperty.repository';
import { DeletePropertyHandler } from './application/commands/delete-property.handler';
import { EditPropertyHandler } from './application/commands/edit-property.handler';
import { CreatePropertyHandler } from './application/commands/create-property.handler';
import { FindPropertyHandler } from './application/queries/find-property.handler';
import { FindPropertiesHandler } from './application/queries/find-properties.handler';
import { PrismaPropertyQueryRepository } from './infrastructure/repo/PrismaPropertyQuery.repository';
import { PrismaModule } from 'src/database/prisma.module';
import { PropertyDeletedHandler } from './application/events/propertyDeleted.handler';
import { PropertyCreatedHandler } from './application/events/propertyCreated.handler';
import { PropertyChangedHandler } from './application/events/propertyChanged.handler';
import { IdempotencyModule } from '../idempotency/idempotency.module';
import { TransactionRepo } from 'src/infrastructure/repo/transactions/repo/Transaction.repository';
import { PropertyUploadProcessor } from './infrastructure/queueHandlers/queue.handler';
import { AddImagesCommandHandler } from './application/commands/create-images.handler';
import { DeleteImagesCommandHandler } from './application/commands/delete-images.handler';
import { TRANSACTION_REPO } from 'src/common/constants/providerConstants';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    PrismaModule,
    IdempotencyModule,
    BullModule.registerQueue({ name: 'property' }),
  ],
  controllers: [PropertyController],
  providers: [
    { provide: 'IPropertyRepo', useClass: PrismaPropertyRepository },
    { provide: 'IPropertyRepoQuery', useClass: PrismaPropertyQueryRepository },
    DeletePropertyHandler,
    EditPropertyHandler,
    CreatePropertyHandler,
    FindPropertyHandler,
    FindPropertiesHandler,
    PropertyDeletedHandler,
    PropertyCreatedHandler,
    PropertyChangedHandler,
    PropertyUploadProcessor,
    AddImagesCommandHandler,
    DeleteImagesCommandHandler,
    { provide: TRANSACTION_REPO, useClass: TransactionRepo },
  ],
})
export class PropertyModule {}
