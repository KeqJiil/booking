import { Address } from '../domain/value-objects/address.value';
import { WrongInputDataError } from '../../../common/exceptions/entityDomain.exceptions';

describe('Address VO', () => {
  describe('creating valid address', () => {
    it('create valid object', () => {
      const address = new Address('Munich', 'FRG', 'some street');
      expect(address).toBeDefined();
    });

    it('normalize: values are lowercased and trimmed', () => {
      const address = new Address('MUNICH   ', 'FRG', '    soME street  ');
      expect(address.city).toBe('munich');
      expect(address.country).toBe('frg');
      expect(address.address).toBe('some street');
    });
  });

  describe('validation of empty fields', () => {
    it('empty city → WrongInputDataError', () => {
      expect(() => new Address('', 'FRG', 'some street')).toThrow(
        WrongInputDataError,
      );
    });

    it('empty country → WrongInputDataError', () => {
      expect(() => new Address('Kyiv', '', 'Street 1')).toThrow(
        WrongInputDataError,
      );
    });

    it('empty address → WrongInputDataError', () => {
      expect(() => new Address('Kyiv', 'Ukraine', '')).toThrow(
        WrongInputDataError,
      );
    });

    it('only whitespaces in city field → WrongInputDataError', () => {
      expect(() => new Address('      ', 'Ukraine', 'Street 123123')).toThrow(
        WrongInputDataError,
      );
    });
  });

  describe('equals()', () => {
    it('same addresses → true', () => {
      const a = new Address('Kyiv', 'Ukraine', 'Khreshchatyk 1');
      const b = new Address('Kyiv', 'Ukraine', 'Khreshchatyk 1');
      expect(a.equals(b)).toBe(true);
    });

    it('different city → false', () => {
      const a = new Address('Kyiv', 'Ukraine', 'St 1');
      const b = new Address('Lviv', 'Ukraine', 'St 1');
      expect(a.equals(b)).toBe(false);
    });

    it('different country → false', () => {
      const a = new Address('Rome', 'USA', 'St 1');
      const b = new Address('Rome', 'Italy', 'St 1');
      expect(a.equals(b)).toBe(false);
    });

    it('different address → false', () => {
      const a = new Address('Rome', 'Italy', 'St 2');
      const b = new Address('Rome', 'Italy', 'St 1');
      expect(a.equals(b)).toBe(false);
    });

    it('equals is normalized', () => {
      const a = new Address('PARIS', 'FRANCE', 'EIFFEL TOWER');
      const b = new Address('paris', 'france', 'eiffel tower');
      expect(a.equals(b)).toBe(true);
    });
  });
});
