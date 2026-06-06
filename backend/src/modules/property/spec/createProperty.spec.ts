import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { EventPublisher } from '@nestjs/cqrs';
import { CreatePropertyHandler } from '../application/commands/create-property.handler';
import type { IPropertyRepo } from '../domain/repo-interface/IPropertyRepo.interface';
import { CreatePropertyCommand } from '../application/commands/property.commands';
import { WrongInputDataError } from '../../../common/exceptions/entityDomain.exceptions';

// CreatePropertyHandler использует EventPublisher.mergeObjectContext(property)
// Нужно мокнуть publisher.mergeObjectContext → возвращает объект с commit()
// Проще всего: publisher.mergeObjectContext.mockReturnValue({ commit: jest.fn() })

describe('CreatePropertyHandler', () => {
  let handler: CreatePropertyHandler;
  let repository: jest.Mocked<IPropertyRepo>;
  let publisher: jest.Mocked<EventPublisher>;

  const commandData = {
    name: 'Test Property',
    description: 'A long enough description for the property',
    price: 100,
    maxGuests: 4,
    hostId: 'host-1',
    typeId: 'type-1',
    address: 'st 1',
    city: 'city-1',
    country: 'country-1',
    images: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreatePropertyHandler,
        { provide: 'IPropertyRepo', useValue: createMock<IPropertyRepo>() },
        { provide: EventPublisher, useValue: createMock<EventPublisher>() },
      ],
    }).compile();

    handler = module.get(CreatePropertyHandler);
    repository = module.get('IPropertyRepo');
    publisher = module.get(EventPublisher);

    publisher.mergeObjectContext.mockImplementation((aggregate) => {
      aggregate.commit = jest.fn();
      return aggregate;
    });
  });

  describe('happy path', () => {
    it('creates property, saves and returns { id }', async () => {
      repository.save.mockResolvedValue(undefined);
      const result = await handler.execute(
        new CreatePropertyCommand(commandData),
      );
      expect(repository.save).toHaveBeenCalled();
      expect(result).toEqual({ id: expect.any(String) });
    });

    it('commit() is called on object with events', async () => {
      repository.save.mockResolvedValue(undefined);
      await handler.execute(new CreatePropertyCommand(commandData));
      expect(publisher.mergeObjectContext).toHaveBeenCalled();
    });

    it('mergeObjectContext is called with new entity', async () => {
      repository.save.mockResolvedValue(undefined);
      await handler.execute(new CreatePropertyCommand(commandData));
      expect(publisher.mergeObjectContext).toHaveBeenCalledWith(
        expect.any(Object),
      );
    });
  });

  describe('repository error', () => {
    it('repository.save throws', async () => {
      repository.save.mockRejectedValue(new Error());
      await expect(
        handler.execute(new CreatePropertyCommand(commandData)),
      ).rejects.toThrow(Error);
    });
  });

  describe('invalid data', () => {
    it('too short description → PropertyEntity.create throws WrongInputDataError', async () => {
      const data = { ...commandData, description: '1' };
      await expect(
        handler.execute(new CreatePropertyCommand(data)),
      ).rejects.toThrow(WrongInputDataError);
      expect(repository.save).not.toHaveBeenCalled();
    });
  });
});
