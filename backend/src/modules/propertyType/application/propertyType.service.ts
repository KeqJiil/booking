import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type {
  IPropertyType,
  IPropertyTypeRepo,
} from '../domain/repo-interface/IPropertyTypeRepo.interface';
import { randomUUID } from 'crypto';
import { Logger } from 'nestjs-pino';

@Injectable()
export class PropertyTypeService {
  constructor(
    @Inject('IPropertyTypeRepo') private readonly prisma: IPropertyTypeRepo,
    private readonly logger: Logger,
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
    const type = await this.prisma.save({ id, name });
    this.logger.log(
      type,
      `New type ${type.name} with id: ${type.id} was created`,
    );
    return type;
  }

  async changeType(data: IPropertyType) {
    return await this.prisma.save(data);
  }

  async deleteType(id: string) {
    const type = await this.prisma.delete(id);
    this.logger.log(type, `Type ${type.name} with id: ${type.id} was deleted`);
    return type;
  }
}
