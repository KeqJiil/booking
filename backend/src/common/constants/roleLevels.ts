export const roles = {
  ADMIN: 'ADMIN',
  USER: 'USER',
  HOST: 'HOST',
} as const;

export type Roles = (typeof roles)[keyof typeof roles];

export const roleLevels = {
  [roles.USER]: 1,
  [roles.HOST]: 2,
  [roles.ADMIN]: 3,
} as const;
