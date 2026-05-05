import { Roles } from 'src/common/constants/roleLevels';

export interface ISession {
  userId: string;
  refresh: string;
  createdAt: number;
  expiresAt: number;
}

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
