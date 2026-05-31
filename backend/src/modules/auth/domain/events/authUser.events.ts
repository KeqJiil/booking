import { AuthId } from '../typedId/auth.id';
import { UserId } from '../typedId/user.id';
import { Email } from '../VO/emailVo';

export class UserCreatedEvent {
  constructor(
    public readonly id: AuthId,
    public readonly userId: UserId,
    public readonly email: Email,
  ) {}
}
