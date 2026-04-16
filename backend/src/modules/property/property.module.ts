import { Module } from '@nestjs/common';
import { PropertyController } from './property.controller';
import { PrismaPropertyRepository } from './infrastructure/repo/PrismaProperty.repository';
import { DeletePropertyHandler } from './application/commands/delete-property.handler';
import { EditPropertyHandler } from './application/commands/edit-property.handler';
import { CreatePropertyHandler } from './application/commands/create-property.handler';
import { FindPropertyHandler } from './application/queries/find-property.handler';
import { FindPropertiesHandler } from './application/queries/find-properties.handler';

@Module({
  controllers: [PropertyController],
  providers: [
    { provide: 'IPropertyRepo', useClass: PrismaPropertyRepository },
    DeletePropertyHandler,
    EditPropertyHandler,
    CreatePropertyHandler,
    FindPropertyHandler,
    FindPropertiesHandler,
  ],
})
export class PropertyModule {}
