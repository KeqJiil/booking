import { Reflector } from '@nestjs/core';
import { Roles } from 'generated/prisma/enums';

export const ReqRole = Reflector.createDecorator<Roles>();
