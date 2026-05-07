import { Injectable } from '@nestjs/common';
import { MinioService } from 'src/infrastructure/minio/minio.service';

@Injectable()
export class UploadService {
  constructor(private readonly minio: MinioService) {}

  async uploadUserAvatar() {}

  async uploadPropertyImages() {}
}
