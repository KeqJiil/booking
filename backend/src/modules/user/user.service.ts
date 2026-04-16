import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { UserSettingsDto } from './dto/settings.dto';
import bcrypt from 'bcrypt';
import { Roles } from 'src/common/constants/roleLevels';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

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
    return await this.prisma.user.update({
      where: { id: userId },
      data: {
        role,
      },
    });
  }

  async changePassword(userId: string, password: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });
    if (!user) throw new NotFoundException();
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException();
    const newHashedPassword = await bcrypt.hash(newPassword, 10);
    return await this.prisma.user.update({
      where: { id: userId },
      data: { password: newHashedPassword },
    });
  }

  async deleteUser(userId: string) {
    return await this.prisma.user.update({
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
  }

  async restoreUser(userId: string) {
    return await this.prisma.user.update({
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
  }
}
