import { Module } from '@nestjs/common';
import { PropertyTypeController } from './propertyType.controller';
import { PrismaPropertyTypeRepository } from './infrastructure/repo/PrismaPropertyType.repository';
import { PropertyTypeService } from './application/propertyType.service';
import { PrismaModule } from 'src/database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PropertyTypeController],
  providers: [
    { provide: 'IPropertyTypeRepo', useClass: PrismaPropertyTypeRepository },
    PropertyTypeService,
  ],
})
export class PropertyTypeModule {}
