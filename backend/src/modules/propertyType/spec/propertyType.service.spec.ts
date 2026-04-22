import { PrismaService } from 'src/database/prisma.service';
import { PropertyTypeService } from '../application/propertyType.service';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaPropertyTypeRepository } from '../infrastructure/repo/PrismaPropertyType.repository';
import { randomUUID } from 'crypto';

jest.mock('crypto', () => ({
  ...jest.requireActual('crypto'),
  randomUUID: jest.fn(),
}));

describe('property type', () => {
  let service: PropertyTypeService;
  let prisma: PrismaService;

  const mockPrisma = {
    propertyType: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      upsert: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropertyTypeService,
        {
          provide: 'IPropertyTypeRepo',
          useClass: PrismaPropertyTypeRepository,
        },
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<PropertyTypeService>(PropertyTypeService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createType', () => {
    it('should generate uuid and call right method', async () => {
      const fakeUuid = '123e4567-e89b-12d3-a456-426614174000';

      (randomUUID as jest.Mock).mockReturnValue(fakeUuid);

      const typeName = 'building';
      mockPrisma.propertyType.upsert.mockResolvedValue({
        id: fakeUuid,
        name: typeName,
      });

      await service.createType(typeName);

      expect(prisma.propertyType.upsert).toHaveBeenCalledWith({
        where: { id: fakeUuid },
        create: { id: fakeUuid, name: typeName },
        update: { name: typeName },
      });

      expect(randomUUID).toHaveBeenCalled();
    });
  });

  describe('changeType (Update logic)', () => {
    it('shoud use upsert correctly', async () => {
      const updateData = { id: 'uuid-123', name: 'New Office Name' };

      mockPrisma.propertyType.upsert.mockResolvedValue(updateData);

      await service.changeType(updateData);

      expect(prisma.propertyType.upsert).toHaveBeenCalledWith({
        where: { id: 'uuid-123' },
        create: { ...updateData },
        update: { name: 'New Office Name' },
      });

      expect(prisma.propertyType.upsert).toHaveBeenCalledTimes(1);
    });
  });

  describe('deleteType (Delete logic)', () => {
    it('should give right ID to delete', async () => {
      const targetId = 'uuid-delete-me';

      mockPrisma.propertyType.delete.mockResolvedValue({ id: targetId });

      await service.deleteType(targetId);
      expect(prisma.propertyType.delete).toHaveBeenCalledWith({
        where: { id: targetId },
      });

      expect(prisma.propertyType.delete).toHaveBeenCalledTimes(1);
    });

    it('should throw an error', async () => {
      const targetId = 'invalid-id';

      mockPrisma.propertyType.delete.mockRejectedValue(
        new Error('Record not found'),
      );

      await expect(service.deleteType(targetId)).rejects.toThrow(
        'Record not found',
      );
    });
  });
});
