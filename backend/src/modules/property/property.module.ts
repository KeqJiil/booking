import { Module } from '@nestjs/common';
import { PropertyController } from './property.controller';
import { PrismaPropertyRepository } from './infrastructure/repo/PrismaProperty.repository';

@Module({
  controllers: [PropertyController],
  providers: [PrismaPropertyRepository],
})
export class PropertyModule {}
