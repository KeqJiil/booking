import { WrongInputDataError } from 'src/common/exceptions/entityDomain.exceptions';

export class Username {
  private constructor(private readonly username: string) {}

  static create(username: string) {
    const trimmed = username.trim();
    if (trimmed.length > 20 || trimmed.length < 4) {
      throw new WrongInputDataError('Username length is not valid');
    }
    return new Username(username);
  }

  equals(other: Username) {
    return other.toString() === this.username;
  }

  toString() {
    return this.username;
  }
}
