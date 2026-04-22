import { Inject, Injectable, NotFoundException } from '@nestjs/common';
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
    const result = await this.prisma.findById(id);
    if (!result) throw new NotFoundException();
    return result;
  }

  async getByName(name: string) {
    const result = await this.prisma.findByName(name);
    if (!result) throw new NotFoundException();
    return result;
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
