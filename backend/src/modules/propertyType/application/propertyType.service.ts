import { Inject, Injectable } from '@nestjs/common';
import type {
  IPropertyType,
  IPropertyTypeRepo,
} from '../domain/repo-interface/IPropertyTypeRepo.interface';
import { randomUUID } from 'crypto';

@Injectable()
export class PropertyTypeService {
  constructor(
    @Inject('IPropertyTypeRepo') private readonly prisma: IPropertyTypeRepo,
  ) {}

  async getAll() {
    return await this.prisma.getAll();
  }

  async getById(id: string) {
    return await this.prisma.findById(id);
  }

  async getByName(name: string) {
    return await this.prisma.findByName(name);
  }

  async createType(name: string) {
    const id = randomUUID();
    return await this.prisma.save({ id, name });
  }

  async changeType(data: IPropertyType) {
    return await this.prisma.save(data);
  }

  async deleteType(id: string) {
    return await this.prisma.delete(id);
  }
}
