import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { EventPublisher } from '@nestjs/cqrs';
import { DeletePropertyHandler } from '../application/commands/delete-property.handler';
import type { IPropertyRepo } from '../domain/repo-interface/IPropertyRepo.interface';
import type { ITransactionRepo } from 'src/infrastructure/repo/transactions/interfaces/TransactionRepo.interface';
import { PropertyEntity } from '../domain/entities/Property.entity';
import { Address } from '../domain/value-objects/address.value';
import { TRANSACTION_REPO } from 'src/common/constants/providerConstants';
import { DeletePropertyCommand } from '../application/commands/property.commands';
import { ConflictException } from '@nestjs/common';
import { NotAllowedError } from '../../../common/exceptions/entityDomain.exceptions';

describe('DeletePropertyHandler', () => {
  let handler: DeletePropertyHandler;
  let repository: jest.Mocked<IPropertyRepo>;
  let transactions: jest.Mocked<ITransactionRepo>;
  let publisher: jest.Mocked<EventPublisher>;

  const mockTx = {} as any;

  const validData = {
    name: 'Test Property',
    description: 'A long enough description for the property',
    price: 100,
    maxGuests: 4,
    hostId: 'host-1',
    typeId: 'type-1',
    address: new Address('Wasras', 'Poland', 'St 1'),
  };

  const makeProperty = (hostId = 'host-1') =>
    PropertyEntity.create({ ...validData, hostId }, []);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeletePropertyHandler,
        { provide: 'IPropertyRepo', useValue: createMock<IPropertyRepo>() },
        { provide: EventPublisher, useValue: createMock<EventPublisher>() },
        { provide: TRANSACTION_REPO, useValue: createMock<ITransactionRepo>() },
      ],
    }).compile();

    handler = module.get(DeletePropertyHandler);
    repository = module.get('IPropertyRepo');
    publisher = module.get(EventPublisher);
    transactions = module.get(TRANSACTION_REPO);

    publisher.mergeObjectContext.mockImplementation((aggregate) => {
      aggregate.commit = jest.fn();
      return aggregate;
    });

    transactions.startTransaction.mockImplementation(async (cb) => cb(mockTx));
  });

  describe('happy path — HOST', () => {
    it('host deletes its own property without future bookings', async () => {
      const property = makeProperty('host-1');
      repository.getEntityById.mockResolvedValue(property);
      repository.checkBookings.mockResolvedValue(false);
      repository.save.mockResolvedValue(undefined);
      await handler.execute(
        new DeletePropertyCommand('prop-1', 'host-1', 'HOST'),
      );
      expect(repository.save).toHaveBeenCalledTimes(1);
      expect(property.status).toBe('DELETED');
    });
  });

  describe('happy path — ADMIN', () => {
    it('admin deletes property', async () => {
      const property = makeProperty('host-1');
      const spy = jest.spyOn(property, 'deleteProperty');
      repository.getEntityById.mockResolvedValue(property);
      repository.checkBookings.mockResolvedValue(false);
      repository.save.mockResolvedValue(undefined);
      await handler.execute(
        new DeletePropertyCommand('prop-1', 'admin-1', 'ADMIN'),
      );
      expect(repository.save).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith('admin-1', true);
      expect(property.status).toBe('DELETED');
    });
  });

  describe('future bookings exist', () => {
    it('if there are bookings → ConflictException, save was not called', async () => {
      const property = makeProperty('host-1');
      repository.getEntityById.mockResolvedValue(property);
      repository.checkBookings.mockResolvedValue(true);
      await expect(
        handler.execute(new DeletePropertyCommand('prop-1', 'host-1', 'HOST')),
      ).rejects.toThrow(ConflictException);
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('not owner trying to delete', () => {
    it('neither host nor admin → deleteProperty doesnt do anything', async () => {
      const property = makeProperty('host-1');
      repository.getEntityById.mockResolvedValue(property);
      repository.checkBookings.mockResolvedValue(false);
      repository.save.mockResolvedValue(undefined);
      await expect(
        handler.execute(
          new DeletePropertyCommand('prop-1', 'hacker-1', 'USER'),
        ),
      ).rejects.toThrow(NotAllowedError);
    });
  });
});
