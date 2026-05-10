import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Queue } from 'bullmq';
import { eventNames } from 'src/common/constants/eventnames';
import type { IPropertyImageChange } from './interfaces/IPropertyImageCreated.interface';

@Injectable()
export class PropertyBullBridge {
  constructor(@InjectQueue('property') private propertyQueue: Queue) {}

  @OnEvent(eventNames.property_images_added)
  async imagesAdded(payload: IPropertyImageChange) {
    await this.propertyQueue.add(eventNames.property_images_added, payload);
  }

  @OnEvent(eventNames.property_images_deleted)
  async imagesDeleted(payload: IPropertyImageChange) {
    await this.propertyQueue.add(eventNames.property_images_deleted, payload);
  }
}
