import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateMessageDto {
  @ApiProperty({
    example: 'Hello, how are you?',
    maxLength: 50,
    description: 'Content of the message',
  })
  @IsString()
  @MaxLength(50)
  @IsNotEmpty()
  text: string;

  @ApiProperty({
    example: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  chatId: string;
}
