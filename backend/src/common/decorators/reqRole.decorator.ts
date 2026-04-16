import { Reflector } from '@nestjs/core';
import { Roles } from '../constants/roleLevels';

export const ReqRole = Reflector.createDecorator<Roles>();
