import { IsNotEmpty, IsUUID } from 'class-validator';

export class DeleteMessageDto {
  @IsUUID()
  @IsNotEmpty()
  chatId: string;

  @IsUUID()
  @IsNotEmpty()
  messageId: string;
}
