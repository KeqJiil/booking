export type UserRole = 'USER' | 'HOST' | 'ADMIN';

export interface IUser {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  avatarUrl: string | null;
  isVerified: boolean;
  isDeleted: boolean;
  createdAt: string;
}

export interface IUserSettings {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  avatarUrl: string | null;
}

export interface IUpdateSettingsData {
  username?: string;
  email?: string;
}

export interface IChangePasswordData {
  oldPassword: string;
  newPassword: string;
}
