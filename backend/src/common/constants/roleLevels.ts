import { Roles } from 'generated/prisma/enums';

export const roleLevels = {
  [Roles.USER]: 1,
  [Roles.HOST]: 2,
  [Roles.ADMIN]: 3,
} as const;
