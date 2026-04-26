import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  @MaxLength(50)
  @IsNotEmpty()
  text: string;

  @IsUUID()
  @IsNotEmpty()
  chatId: string;
}
