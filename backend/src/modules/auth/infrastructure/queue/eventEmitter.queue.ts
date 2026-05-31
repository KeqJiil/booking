import { Injectable } from '@nestjs/common';
import { IAuthQueue } from '../../application/abstractions/queue.interface';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class EventEmitterAuthQueue implements IAuthQueue {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  post(eventName: string, payload: unknown): void {
    this.eventEmitter.emit(eventName, payload);
  }
}
