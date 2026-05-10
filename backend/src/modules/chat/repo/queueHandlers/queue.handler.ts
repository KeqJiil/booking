import { Processor, WorkerHost } from '@nestjs/bullmq';
import { ChatService } from '../../app/chat.service';
import { Job } from 'bullmq';
import { ICreateChat } from '../../domain/interfaces/ICreateChat.interface';

@Processor('chat')
export class ChatQueueHandler extends WorkerHost {
  constructor(private readonly chatService: ChatService) {
    super();
  }

  async process(job: Job) {
    const data = job.data as ICreateChat;
    await this.chatService.createChat({
      usersId: data.usersId,
      bookingId: data.bookingId,
      name: data.propertyId,
    });
  }
}
