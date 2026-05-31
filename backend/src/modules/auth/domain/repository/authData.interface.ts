import { AuthUser } from '../entity/AuthUser';
import { UserId } from '../typedId/user.id';
import { Email } from '../VO/emailVo';

export interface IAuthDataRepository {
  getById(id: UserId): Promise<AuthUser | null>;
  getByEmail(email: Email): Promise<AuthUser | null>;
  save(data: AuthUser): Promise<void>;
}
