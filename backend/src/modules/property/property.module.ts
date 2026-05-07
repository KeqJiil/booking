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
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue({
      name: 'property',
    }),
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
  ],
})
export class PropertyModule {}
