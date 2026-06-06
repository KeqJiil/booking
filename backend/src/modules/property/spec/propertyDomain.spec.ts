import { PropertyEntity } from '../domain/entities/Property.entity';
import { Address } from '../domain/value-objects/address.value';
import {
  NotAllowedError,
  WrongInputDataError,
} from '../../../common/exceptions/entityDomain.exceptions';

describe('PropertyEntity', () => {
  const validData = {
    name: 'Test Property',
    description: 'This is a long enough description',
    price: 100,
    maxGuests: 2,
    hostId: 'user1',
    typeId: 'type1',
    address: new Address('City', 'Country', 'Street'),
  };

  it('should create entity', () => {
    const entity = PropertyEntity.create(validData, []);
    expect(entity.props.name).toBe('Test Property');
  });

  it('should throw an error', () => {
    const invalidData = { ...validData, description: 'short' };
    expect(() => PropertyEntity.create(invalidData, [])).toThrow(
      WrongInputDataError,
    );
  });

  it('should let be deleted', () => {
    const entity = PropertyEntity.create(validData, []);
    entity.deleteProperty('user1', false);
    expect(entity.status).toBe('DELETED');
  });

  it('shouldnt let someone else change', () => {
    const entity = PropertyEntity.create(validData, []);
    expect(() => entity.deleteProperty('hacker', false)).toThrow(
      NotAllowedError,
    );
  });
});
