import { Module } from '@nestjs/common';
import { PropertyTypeController } from './propertyType.controller';
import { PrismaPropertyTypeRepository } from './infrastructure/repo/PrismaPropertyType.repository';

@Module({
  controllers: [PropertyTypeController],
  providers: [
    { provide: 'IPropertyTypeRepo', useClass: PrismaPropertyTypeRepository },
  ],
})
export class PropertyTypeModule {}
