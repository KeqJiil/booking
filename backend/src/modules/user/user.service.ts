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
import { Tx } from 'src/infrastructure/repo/transactions/interfaces/TransactionRepo.interface';
import { UserId } from '../auth/domain/typedId/user.id';

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
        id: user.userId.toString(),
        name: user.name,
        userSettings: {
          create: {},
        },
      },
    });
  }

  async hasValidStatus(userId: UserId) {
    const data = await this.prisma.user.findUnique({
      where: { id: userId.toString() },
      select: { status: true },
    });
    if (!data) return false;
    return data.status === 'ALIVE';
  }

  async getUserById(id: string) {
    return await this.prisma.user.findUnique({ where: { id } });
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

  async getRole(userId: UserId) {
    const role = await this.prisma.user.findUnique({
      where: {
        id: userId.toString(),
      },
      select: { role: true },
    });
    if (!role) throw new NotFoundException();
    return role;
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
    return { id: user.id, status: user.status };
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
    return { id: user.id, status: user.status };
  }

  async addPaymentAccount(userId: string, paymentAccountId: string, tx?: Tx) {
    const db = tx ?? this.prisma;
    await db.user.update({
      where: { id: userId },
      data: {
        paymentAccountId,
      },
    });
  }
}
