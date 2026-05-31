import { AggregateRoot } from '@nestjs/cqrs';
import { UserId } from '../typedId/user.id';
import { Email } from '../VO/emailVo';
import { UserCreatedEvent } from '../events/authUser.events';
import { AuthId } from '../typedId/auth.id';

export class AuthUser extends AggregateRoot {
  private constructor(
    private readonly _id: AuthId,
    private readonly _userId: UserId,
    private _email: Email,
    private hashedPassword: string,
  ) {
    super();
  }

  static create(id: AuthId, userId: UserId, email: Email, hashed: string) {
    const user = new AuthUser(id, userId, email, hashed);
    user.apply(new UserCreatedEvent(id, userId, email));
    return user;
  }

  static fromPersist(id: AuthId, userId: UserId, email: Email, hashed: string) {
    return new AuthUser(id, userId, email, hashed);
  }

  changePassword(newPassword: string) {
    this.hashedPassword = newPassword;
  }

  toPersist() {
    return {
      id: this._id.toString(),
      userId: this._userId.toString(),
      email: this._email.toString(),
      password: this.hashedPassword,
    };
  }

  get password() {
    return this.hashedPassword;
  }

  get id() {
    return this._id;
  }

  get email() {
    return this._email;
  }

  get userId() {
    return this._userId;
  }
}
