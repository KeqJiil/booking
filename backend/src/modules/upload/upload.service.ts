import { ForbiddenException, Injectable } from '@nestjs/common';
import { MinioService } from 'src/infrastructure/minio/minio.service';
import { UserService } from '../user/user.service';

@Injectable()
export class UploadService {
  constructor(
    private readonly minio: MinioService,
    private readonly userService: UserService,
  ) {}

  async uploadUserAvatar(
    file: Express.Multer.File,
    userId: string,
    id: string,
  ) {
    if (id !== userId) throw new ForbiddenException();
    const url = await this.minio.uploadFile(file);
    await this.userService.updateAvatar(userId, url);
  }

  async uploadPropertyImages() {}
}
