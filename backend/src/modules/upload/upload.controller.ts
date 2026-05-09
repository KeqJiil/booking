import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { unlink } from 'fs/promises';
import { Authorization } from 'src/common/decorators/authorization.decorator';
import { AccessInfo } from 'src/common/decorators/accessInfo.decorator';
import { DeleteImagesDto } from './dto/deleteImages.dto';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Authorization('HOST')
  @Post('property/:id')
  @UseInterceptors(
    FilesInterceptor('files', 20, {
      storage: diskStorage({
        destination: './temp',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async addPropertyImages(
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 10 }),
          new FileTypeValidator({ fileType: 'image/(jpeg|png|webp)' }),
        ],
      }),
    )
    files: Express.Multer.File[],
    @Param('id') id: string,
    @AccessInfo('id') userId: string,
  ) {
    try {
      await this.uploadService.uploadPropertyImages(files, userId, id);
    } finally {
      for (const file of files) {
        await unlink(file.path);
      }
    }
  }

  @Authorization('HOST')
  @Delete('property/:id')
  async deletePropertyImages(
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 10 }),
          new FileTypeValidator({ fileType: 'image/(jpeg|png|webp)' }),
        ],
      }),
    )
    @Body()
    urls: DeleteImagesDto,
    @Param('id') id: string,
    @AccessInfo('id') userId: string,
  ) {
    await this.uploadService.deletePropertyImages(urls.urls, userId, id);
  }

  @Authorization('USER')
  @Post('user/avatar/:id')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './temp',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async uploadUserAvatar(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }),
          new FileTypeValidator({ fileType: 'image/(jpeg|png|webp)' }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Param('id') id: string,
    @AccessInfo('id') userId: string,
  ) {
    try {
      await this.uploadService.uploadUserAvatar(file, userId, id);
    } finally {
      await unlink(file.path);
    }
  }
}
