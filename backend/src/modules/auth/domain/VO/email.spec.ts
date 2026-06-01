import { Email } from './emailVo';
import { WrongInputDataError } from 'src/common/exceptions/entityDomain.exceptions';

describe('Email VO', () => {
  describe('create()', () => {
    it.each([
      'user@example.com',
      'USER@DOMAIN.ORG',
      'hello.world+tag@sub.domain.io',
    ])('should accept valid email: %s', (input) => {
      expect(() => Email.create(input)).not.toThrow();
    });

    it.each(['not-an-email', '@domain.com', 'user@', 'user@domain', '', '   '])(
      'should reject invalid email: %s',
      (input) => {
        expect(() => Email.create(input)).toThrow(WrongInputDataError);
      },
    );

    it('should trim whitespace', () => {
      const email = Email.create('  test@example.com  ');
      expect(email.toString()).toBe('test@example.com');
    });

    it('should lowercase the value', () => {
      const email = Email.create('HELLO@WORLD.COM');
      expect(email.toString()).toBe('hello@world.com');
    });
  });

  describe('equals()', () => {
    it('should return true for equal emails', () => {
      const a = Email.create('test@example.com');
      const b = Email.create('TEST@EXAMPLE.COM');
      expect(a.equals(b)).toBe(true);
    });

    it('should return false for different emails', () => {
      const a = Email.create('a@example.com');
      const b = Email.create('b@example.com');
      expect(a.equals(b)).toBe(false);
    });
  });

  describe('toString()', () => {
    it('should return the normalised email string', () => {
      expect(Email.create(' Me@Example.COM  ').toString()).toBe(
        'me@example.com',
      );
    });
  });

  describe('edge cases', () => {
    it('two differently-cased emails should be considered equal', () => {
      const a = Email.create('Admin@Example.COM');
      const b = Email.create('admin@example.com');
      expect(a.equals(b)).toBe(true);
    });

    it('email with surrounding spaces equals the same email without spaces', () => {
      const a = Email.create('  user@example.com  ');
      const b = Email.create('user@example.com');
      expect(a.equals(b)).toBe(true);
    });
  });
});
