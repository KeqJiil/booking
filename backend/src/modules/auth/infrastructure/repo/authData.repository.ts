import { Injectable } from '@nestjs/common';
import { IAuthDataRepository } from '../../domain/repository/authData.interface';
import { AuthUser } from '../../domain/entity/AuthUser';
import { Email } from '../../domain/VO/emailVo';
import { UserId } from '../../domain/typedId/user.id';
import { PrismaService } from 'src/database/prisma.service';
import { AuthId } from '../../domain/typedId/auth.id';
import { IAuthDataPrisma } from './AuthDataPrisma.types';

@Injectable()
export class AuthDataPrismaRepository implements IAuthDataRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toDomain(authUser: IAuthDataPrisma) {
    const { id, userId, email, passwordHash, isEmailVerified } = authUser;
    const authId = new AuthId(id);
    const userTypedId = new UserId(userId);
    const emailVO = Email.create(email);
    return AuthUser.fromPersist(
      authId,
      userTypedId,
      emailVO,
      passwordHash,
      isEmailVerified,
    );
  }

  async save(data: AuthUser): Promise<void> {
    const { id, userId, email, password } = data.toPersist();
    await this.prisma.authCredential.upsert({
      where: {
        id,
      },
      update: {
        email,
        passwordHash: password,
      },
      create: {
        id,
        userId,
        email,
        passwordHash: password,
      },
    });
  }

  async getByEmail(emailToFind: Email): Promise<AuthUser | null> {
    const authUser = await this.prisma.authCredential.findUnique({
      where: { email: emailToFind.toString() },
      select: {
        userId: true,
        passwordHash: true,
        id: true,
        email: true,
        isEmailVerified: true,
      },
    });
    if (!authUser) return null;
    return this.toDomain(authUser);
  }

  async getById(id: UserId): Promise<AuthUser | null> {
    const authUser = await this.prisma.authCredential.findUnique({
      where: { id: id.toString() },
      select: {
        userId: true,
        passwordHash: true,
        id: true,
        email: true,
        isEmailVerified: true,
      },
    });
    if (!authUser) return null;
    return this.toDomain(authUser);
  }
}
