import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class EditMessageDto {
  @IsString()
  @MaxLength(50)
  @IsNotEmpty()
  text: string;

  @IsUUID()
  @IsNotEmpty()
  chatId: string;

  @IsUUID()
  @IsNotEmpty()
  messageId: string;
}
