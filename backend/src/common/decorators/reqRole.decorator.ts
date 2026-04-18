import { SetMetadata } from '@nestjs/common';
import { Roles } from '../constants/roleLevels';

export const ReqRole = (roles: Roles) => SetMetadata('roles', roles);
