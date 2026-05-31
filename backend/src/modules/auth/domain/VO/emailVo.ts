import { WrongInputDataError } from 'src/common/exceptions/entityDomain.exceptions';

export class Email {
  private constructor(private readonly email: string) {}

  static create(email: string) {
    const trimmed = email.trim();
    if (!trimmed.includes('@')) {
      throw new WrongInputDataError('Wrong email data provided');
    }
    return new Email(trimmed);
  }

  equals(other: Email) {
    return this.email === other.toString();
  }

  toString() {
    return this.email;
  }
}
