import {
  CreateBucketCommand,
  DeleteObjectCommand,
  PutBucketPolicyCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import {
  HttpException,
  HttpStatus,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { createReadStream } from 'fs';
import { Logger } from 'nestjs-pino';
import { extname } from 'path';

@Injectable()
export class MinioService implements OnModuleInit {
  private readonly bucketName: string;
  constructor(
    private configService: ConfigService,
    private readonly logger: Logger,
  ) {
    this.bucketName = this.configService.getOrThrow('MINIO_BUCKET_NAME');
  }
  private s3: S3Client;

  async onModuleInit() {
    const minioUrl = this.configService.get<string>('MINIO_URL') as string;
    const accessKeyId = this.configService.get<string>(
      'MINIO_ACCESS_KEY',
    ) as string;
    const secretAccessKey = this.configService.get<string>(
      'MINIO_SECRET_KEY',
    ) as string;

    this.s3 = new S3Client({
      region: 'us-east-1',
      endpoint: minioUrl,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: true,
    });
    await this.createBucketIfNotExists('my-public-bucket');
    await this.makeBucketPublic('my-public-bucket');
  }

  async createBucketIfNotExists(bucketName: string) {
    try {
      await this.s3.send(new CreateBucketCommand({ Bucket: bucketName }));
      this.logger.log(`Bucket '${bucketName}' created or already exists.`);
    } catch (err) {
      if (
        err?.name === 'BucketAlreadyOwnedByYou' ||
        err?.name === 'BucketAlreadyExists'
      ) {
        this.logger.log(`Bucket '${bucketName}' already exists.`);
      } else {
        this.logger.error('Error creating bucket:', err);
        throw err;
      }
    }
  }

  async makeBucketPublic(bucketName: string) {
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'PublicRead',
          Effect: 'Allow',
          Principal: '*',
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${bucketName}/*`],
        },
      ],
    };

    const command = new PutBucketPolicyCommand({
      Bucket: bucketName,
      Policy: JSON.stringify(policy),
    });

    try {
      await this.s3.send(command);
      this.logger.log(`Bucket '${bucketName}' is now public.`);
    } catch (err) {
      this.logger.error('Error setting bucket policy:', err);
      throw err;
    }
  }

  async uploadFile(filePath: Express.Multer.File) {
    try {
      const fileContent = createReadStream(filePath.path);
      const fileExtension = extname(filePath.originalname);
      const fileName = `${randomUUID()}${fileExtension}`;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
        Body: fileContent,
        ContentType: filePath.mimetype,
      });

      const s = await this.s3.send(command);
      this.logger.debug(s);
      this.logger.debug(
        `${this.configService.getOrThrow('MINIO_URL')}/${this.bucketName}/${fileName}`,
      );
      return fileName;
    } catch (err) {
      this.logger.error('Error uploading file:', err);
      throw new HttpException(
        'Failed to upload file',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteService(fileName: string) {
    if (!fileName || typeof fileName !== 'string') {
      throw new HttpException('Invalid file name', HttpStatus.BAD_REQUEST);
    }

    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
      });
      await this.s3.send(command);
      this.logger.debug('file deleted', fileName);
      return fileName;
    } catch (err) {
      this.logger.error('Error Delete file:', err);
      throw new HttpException(
        'Can not Delete File',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
