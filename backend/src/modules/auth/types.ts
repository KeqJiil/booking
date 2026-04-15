import { Roles } from '@prisma/client';

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
