import { Processor } from '@nestjs/bullmq';
import { CommandBus } from '@nestjs/cqrs';
import { Job } from 'bullmq';
import { eventNames } from 'src/common/constants/eventnames';
import {
  AddImagesCommand,
  DeleteImagesCommand,
} from '../../application/commands/property.commands';
import { IUpdateImagesData } from '../../application/types/IAddImagesData.interface';

@Processor('upload')
export class PropertyUploadProcessor {
  constructor(private readonly commandBus: CommandBus) {}

  async process(job: Job) {
    switch (job.name as keyof typeof eventNames) {
      case 'property_images_added': {
        const data = job.data as IUpdateImagesData;
        await this.commandBus.execute(
          new AddImagesCommand(data.urls, data.propertyId, data.userId),
        );
        break;
      }
      case 'property_images_deleted': {
        const data = job.data as IUpdateImagesData;
        await this.commandBus.execute(
          new DeleteImagesCommand(data.urls, data.propertyId, data.userId),
        );
        break;
      }
    }
  }
}
