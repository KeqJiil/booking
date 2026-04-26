import { IsNotEmpty, IsUUID } from 'class-validator';

export class DeleteChatDto {
  @IsUUID()
  @IsNotEmpty()
  chatId: string;

  @IsUUID()
  @IsNotEmpty()
  userChatId: string;
}
