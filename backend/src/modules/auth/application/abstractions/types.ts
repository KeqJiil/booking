import { Roles } from 'src/common/constants/roleLevels';
import { UserId } from '../../domain/typedId/user.id';

export interface IPayload {
  id: string;
  sessionId: string;
  role: Roles;
}

export interface IJwtAccess {
  role: Roles;
  id: string;
}

export interface IRegisterData {
  uuid: string;
  userId: UserId;
}

export interface ITokens {
  refresh: string;
  access: string;
}
