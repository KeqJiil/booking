import { ForbiddenException, Injectable } from '@nestjs/common';
import { MinioService } from 'src/infrastructure/minio/minio.service';
import { UserService } from '../user/user.service';
import { QueryBus } from '@nestjs/cqrs';
import { FindPropertyByIdQuery } from '../property/application/queries/property.queries';
import { eventNames } from 'src/common/constants/eventnames';
import { IPropertyImageChange } from 'src/infrastructure/bullmq/proccessors/property/interfaces/IPropertyImageCreated.interface';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class UploadService {
  constructor(
    private readonly minio: MinioService,
    private readonly userService: UserService,
    private readonly queryBus: QueryBus,
    private readonly eventEmitter: EventEmitter2,
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

    const queueData: IPropertyImageChange = {
      urls,
      propertyId: id,
      userId: hostId,
    };

    this.eventEmitter.emit(eventNames.property_images_added, queueData);
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

    const queueData: IPropertyImageChange = {
      urls,
      userId: hostId,
      propertyId: id,
    };
    this.eventEmitter.emit(eventNames.property_images_deleted, queueData);
  }
}
