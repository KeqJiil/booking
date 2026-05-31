import { Roles } from 'src/common/constants/roleLevels';

export interface IAccessTokenPayload {
  userId: string;
  role: Roles;
}

export interface IRefreshTokenPayload {
  userId: string;
  role: Roles;
  sessionId: string;
}
