import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { AddImagesCommandHandler } from '../application/commands/create-images.handler';
import { AddImagesCommand } from '../application/commands/property.commands';
import type { IPropertyRepo } from '../domain/repo-interface/IPropertyRepo.interface';
import type { ITransactionRepo } from 'src/infrastructure/repo/transactions/interfaces/TransactionRepo.interface';
import { PropertyEntity } from '../domain/entities/Property.entity';
import { Address } from '../domain/value-objects/address.value';
import { TRANSACTION_REPO } from 'src/common/constants/providerConstants';
import { IImage } from '../domain/entities/Image.entity';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('AddImagesCommandHandler', () => {
  let handler: AddImagesCommandHandler;
  let repository: jest.Mocked<IPropertyRepo>;
  let transactions: jest.Mocked<ITransactionRepo>;

  const mockTx = {} as any;

  const makeProperty = (hostId = 'host-1', images: IImage[] = []) =>
    PropertyEntity.create(
      {
        name: 'Test Property',
        description: 'A long enough description for the property',
        price: 100,
        maxGuests: 4,
        hostId,
        typeId: 'type-1',
        address: new Address('Kyiv', 'Ukraine', 'Khreshchatyk 1'),
      },
      images,
    );

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AddImagesCommandHandler,
        { provide: 'IPropertyRepo', useValue: createMock<IPropertyRepo>() },
        { provide: TRANSACTION_REPO, useValue: createMock<ITransactionRepo>() },
      ],
    }).compile();

    handler = module.get(AddImagesCommandHandler);
    repository = module.get('IPropertyRepo');
    transactions = module.get(TRANSACTION_REPO);

    transactions.startTransaction.mockImplementation(async (cb) => cb(mockTx));
  });

  describe('happy path', () => {
    it('adding new url', async () => {
      const property = makeProperty('host-1');
      repository.getEntityById.mockResolvedValue(property);
      repository.save.mockResolvedValue(undefined);
      const command = new AddImagesCommand(
        ['url1', 'url2'],
        'prop-1',
        'host-1',
      );
      await handler.execute(command);
      expect(repository.save).toHaveBeenCalledTimes(1);
      expect(property.images.length).toBe(2);
    });

    it('old images saves after new ones were added', async () => {
      const property = makeProperty('host-1', [{ url: 'url-1', id: 'id-1' }]);
      repository.getEntityById.mockResolvedValue(property);
      const command = new AddImagesCommand(['new-url'], 'prop-1', 'host-1');
      await handler.execute(command);
      expect(property.images.length).toBe(2);
    });
  });

  describe('not host', () => {
    it('entity.isHost(userId) === false → ForbiddenException', async () => {
      const property = makeProperty('host-1');
      repository.getEntityById.mockResolvedValue(property);
      const command = new AddImagesCommand(['url1'], 'prop-1', 'host-2');
      await expect(handler.execute(command)).rejects.toThrow(
        ForbiddenException,
      );
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('repository error', () => {
    it('getEntityById throws', async () => {
      repository.getEntityById.mockImplementation(() => {
        throw new NotFoundException();
      });
      const command = new AddImagesCommand(['url1'], 'prop-1', 'host-1');
      await expect(handler.execute(command)).rejects.toThrow();
    });
  });
});
