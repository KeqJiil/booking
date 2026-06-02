import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Logger } from 'nestjs-pino';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class AuthCronDeletion {
  constructor(
    private readonly logger: Logger,
    private readonly prisma: PrismaService,
  ) {}

  @Cron('*/10 * * * *')
  async handleCompletedBookings() {
    this.logger.log('Auth cron');
    await this.prisma.user.deleteMany({
      where: {
        authCredentials: {
          isEmailVerified: false,
          createdAt: {
            lte: new Date(Date.now() - 15 * 60 * 1000),
          },
        },
      },
    });
  }
}
