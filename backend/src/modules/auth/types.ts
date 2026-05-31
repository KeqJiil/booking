import { Roles } from 'src/common/constants/roleLevels';

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
  userId: string;
}

export interface ITokens {
  refresh: string;
  access: string;
}
