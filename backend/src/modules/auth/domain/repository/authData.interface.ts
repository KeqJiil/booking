import { AuthUser } from '../entity/AuthUser';
import { UserId } from '../typedId/user.id';
import { Email } from '../VO/emailVo';

export interface IAuthDataRepository {
  getById(id: UserId): Promise<AuthUser>;
  getByEmail(email: Email): Promise<AuthUser>;
  save(data: AuthUser): Promise<void>;
}
