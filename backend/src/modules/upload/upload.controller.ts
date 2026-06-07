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
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { unlink } from 'fs/promises';

import { UploadService } from './upload.service';
import { Authorization } from 'src/common/decorators/authorization.decorator';
import { AccessInfo } from 'src/common/decorators/accessInfo.decorator';
import { DeleteImagesDto } from './dto/deleteImages.dto';

@ApiTags('Upload')
@ApiBearerAuth()
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @ApiOperation({
    summary:
      'Upload property images (HOST only, max 20 files, 10 MB each, jpeg/png/webp)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiParam({
    name: 'id',
    description: 'Property UUID',
    type: String,
    format: 'uuid',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: { type: 'array', items: { type: 'string', format: 'binary' } },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Images uploaded successfully' })
  @ApiResponse({
    status: 400,
    description: 'Invalid file type or size exceeded',
  })
  @ApiResponse({ status: 403, description: 'Not the owner of this property' })
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

  @ApiOperation({ summary: 'Delete property images by URL list (HOST only)' })
  @ApiParam({
    name: 'id',
    description: 'Property UUID',
    type: String,
    format: 'uuid',
  })
  @ApiBody({ type: DeleteImagesDto })
  @ApiResponse({ status: 200, description: 'Images deleted successfully' })
  @ApiResponse({ status: 403, description: 'Not the owner of this property' })
  @Authorization('HOST')
  @Delete('property/:id')
  async deletePropertyImages(
    @Body() urls: DeleteImagesDto,
    @Param('id') id: string,
    @AccessInfo('id') userId: string,
  ) {
    await this.uploadService.deletePropertyImages(urls.urls, userId, id);
  }

  @ApiOperation({
    summary: 'Upload user avatar (USER only, max 1 file, 5 MB, jpeg/png/webp)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiParam({
    name: 'id',
    description: 'User UUID',
    type: String,
    format: 'uuid',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Avatar uploaded successfully' })
  @ApiResponse({
    status: 400,
    description: 'Invalid file type or size exceeded',
  })
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
