import { PrismaService } from 'src/database/prisma.service';
import {
  IPropertyType,
  IPropertyTypeRepo,
} from '../../domain/repo-interface/IPropertyTypeRepo.interface';

export class PrismaPropertyTypeRepository implements IPropertyTypeRepo {
  constructor(private readonly prisma: PrismaService) {}

  async getAll(): Promise<IPropertyType[]> {
    return await this.prisma.propertyType.findMany({
      select: {
        name: true,
        id: true,
      },
    });
  }

  async findById(id: string): Promise<IPropertyType | null> {
    return await this.prisma.propertyType.findUnique({
      where: { id },
    });
  }

  async findByName(name: string): Promise<IPropertyType | null> {
    return await this.prisma.propertyType.findUnique({
      where: { name },
    });
  }

  async save(data: IPropertyType): Promise<void> {
    await this.prisma.propertyType.upsert({
      create: {
        ...data,
      },
      update: {
        name: data.name,
      },
      where: {
        id: data.id,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.propertyType.delete({ where: { id } });
  }
}
