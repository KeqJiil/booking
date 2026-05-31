import { UserId } from '../auth/domain/typedId/user.id';

export interface IUserCreate {
  userId: UserId;
  name: string;
}
