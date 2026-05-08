import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { UserSettingsDto } from './dto/settings.dto';
import bcrypt from 'bcrypt';
import { Roles } from 'src/common/constants/roleLevels';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { eventNames } from 'src/common/constants/eventnames';
import { Logger } from 'nestjs-pino';
import { IUserCreate } from './types';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmmiter: EventEmitter2,
    private readonly logger: Logger,
  ) {}

  async createUser(user: IUserCreate) {
    return await this.prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        status: 'NOT_CONFIRMED',
        password: user.password,
        userSettings: {
          create: {},
        },
      },
    });
  }

  async getUserById(id: string) {
    return await this.prisma.user.findUnique({ where: { id } });
  }

  async getUserByEmail(email: string) {
    return await this.prisma.user.findUnique({ where: { email } });
  }

  async updateAvatar(id: string, url: string) {
    return await this.prisma.user.update({
      where: { id },
      data: { avatarUrl: url },
    });
  }

  async verifyUser(id: string) {
    return await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        status: 'ALIVE',
      },
    });
  }

  async getSettings(userId: string) {
    return await this.prisma.userSettings.findUnique({
      where: { userId },
    });
  }

  async changeSettings(userId: string, settings: UserSettingsDto) {
    return await this.prisma.userSettings.update({
      where: { userId },
      data: {
        notifications: settings.notifications,
        theme: settings.theme,
      },
    });
  }

  async changeRole(userId: string, role: Roles) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        role,
      },
    });
    this.eventEmmiter.emit(eventNames.new_role_received, {
      ...user,
      userId: user.id,
    });
  }

  async changePassword(userId: string, password: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });
    if (!user) throw new NotFoundException();
    const isMatch = await bcrypt.compare(password, user.password!);
    if (!isMatch) throw new UnauthorizedException();
    const newHashedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { password: newHashedPassword },
    });

    this.eventEmmiter.emit(eventNames.password_changed, {
      ...updatedUser,
      userId: updatedUser.id,
    });

    return updatedUser;
  }

  async deleteUser(userId: string) {
    const user = await this.prisma.user.update({
      where: {
        id: userId,
        role: {
          not: 'ADMIN',
        },
        status: {
          not: 'DELETED',
        },
      },
      data: {
        status: 'DELETED',
      },
    });
    this.logger.log(
      `User ${user.name} ${user.email} id:${user.id} was deleted`,
    );
  }

  async restoreUser(userId: string) {
    const user = await this.prisma.user.update({
      where: {
        id: userId,
        role: {
          not: 'ADMIN',
        },
        status: {
          not: 'ALIVE',
        },
      },
      data: {
        status: 'ALIVE',
      },
    });
    this.logger.log(
      `User ${user.name} ${user.email} id:${user.id} was restored`,
    );
  }
}
