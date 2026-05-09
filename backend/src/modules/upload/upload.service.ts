import { ForbiddenException, Injectable } from '@nestjs/common';
import { MinioService } from 'src/infrastructure/minio/minio.service';
import { UserService } from '../user/user.service';
import { QueryBus } from '@nestjs/cqrs';
import { FindPropertyByIdQuery } from '../property/application/queries/property.queries';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { eventNames } from 'src/common/constants/eventnames';

@Injectable()
export class UploadService {
  constructor(
    private readonly minio: MinioService,
    private readonly userService: UserService,
    private readonly queryBus: QueryBus,
    @InjectQueue('upload') private readonly queue: Queue,
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

  async uploadPropertyImages(
    files: Express.Multer.File[],
    hostId: string,
    id: string,
  ) {
    const { userId } = await this.queryBus.execute(
      new FindPropertyByIdQuery(id),
    );
    if (userId !== hostId) throw new ForbiddenException();

    const urls = await Promise.all(
      files.map((el) => this.minio.uploadFile(el)),
    );

    await this.queue.add(eventNames.property_images_added, {
      urls,
      propertyId: id,
      userId: hostId,
    });
  }

  async deletePropertyImages(
    urlsToDelete: string[],
    hostId: string,
    id: string,
  ) {
    const { userId } = await this.queryBus.execute(
      new FindPropertyByIdQuery(id),
    );
    if (userId !== hostId) throw new ForbiddenException();

    const urls = await Promise.all(
      urlsToDelete.map((el) => this.minio.deleteService(el)),
    );

    await this.queue.add(eventNames.property_images_deleted, {
      urls,
      userId: hostId,
      propertyId: id,
    });
  }
}
