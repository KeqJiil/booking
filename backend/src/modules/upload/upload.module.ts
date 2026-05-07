import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { MinioModule } from 'src/infrastructure/minio/minio.module';

@Module({
  imports: [MinioModule],
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}
