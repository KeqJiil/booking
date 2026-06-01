import { UserId } from '../../domain/typedId/user.id';
import { Email } from '../../domain/VO/emailVo';

export interface IForgotPasswordPayload {
  email: Email;
  userId: UserId;
  uuid: string;
}
