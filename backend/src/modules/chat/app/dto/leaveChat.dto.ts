import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class DeleteChatDto {
  @ApiProperty({
    example: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  chatId: string;

  @ApiProperty({
    example: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  userChatId: string;
}
