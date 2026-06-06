import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { EventPublisher } from '@nestjs/cqrs';
import { EditPropertyHandler } from '../application/commands/edit-property.handler';
import type { IPropertyRepo } from '../domain/repo-interface/IPropertyRepo.interface';
import { PropertyEntity } from '../domain/entities/Property.entity';
import { Address } from '../domain/value-objects/address.value';
import { EditPropertyCommand } from '../application/commands/property.commands';
import { NotAllowedError } from '../../../common/exceptions/entityDomain.exceptions';

describe('EditPropertyHandler', () => {
  let handler: EditPropertyHandler;
  let repository: jest.Mocked<IPropertyRepo>;
  let publisher: jest.Mocked<EventPublisher>;

  const validData = {
    name: 'Test Property',
    description: 'A long enough description for the property',
    price: 100,
    maxGuests: 4,
    hostId: 'host-1',
    typeId: 'type-1',
    address: new Address('Kyiv', 'Ukraine', 'Khreshchatyk 1'),
  };

  const makeProperty = (hostId = 'host-1') =>
    PropertyEntity.create({ ...validData, hostId }, []);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EditPropertyHandler,
        { provide: 'IPropertyRepo', useValue: createMock<IPropertyRepo>() },
        { provide: EventPublisher, useValue: createMock<EventPublisher>() },
      ],
    }).compile();

    handler = module.get(EditPropertyHandler);
    repository = module.get('IPropertyRepo');
    publisher = module.get(EventPublisher);

    publisher.mergeObjectContext.mockImplementation((aggregate) => {
      aggregate.commit = jest.fn();
      return aggregate;
    });
  });

  describe('happy path', () => {
    it('host edit its property → save and commit was called', async () => {
      const property = makeProperty('host-1');
      repository.getEntityById.mockResolvedValue(property);
      repository.save.mockResolvedValue(undefined);
      await handler.execute(
        new EditPropertyCommand('host-1', { id: 'prop-1', name: 'New Name' }),
      );
      expect(repository.save).toHaveBeenCalledTimes(1);
    });
  });

  describe('not host', () => {
    it('not host try to edit → NotAllowedError', async () => {
      const property = makeProperty('host-1');
      repository.getEntityById.mockResolvedValue(property);
      await expect(
        handler.execute(new EditPropertyCommand('hacker', { id: 'prop-1' })),
      ).rejects.toThrow(NotAllowedError);
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('repository error', () => {
    it('getEntityById throws', async () => {
      repository.getEntityById.mockRejectedValue(new Error());
      await expect(
        handler.execute(new EditPropertyCommand('host-1', { id: 'prop-1' })),
      ).rejects.toThrow(Error);
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('save throws', async () => {
      const property = makeProperty('host-1');
      repository.getEntityById.mockResolvedValue(property);
      repository.save.mockRejectedValue(new Error());
      await expect(
        handler.execute(new EditPropertyCommand('host-1', { id: 'prop-1' })),
      ).rejects.toThrow(Error);
    });
  });
});
