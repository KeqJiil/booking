import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsStrongPassword } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    example: '12345678qweRTY!',
    description: `User's previous password`,
  })
  @IsString()
  password: string;

  @ApiProperty({
    example: '4568762AsdfgH!',
    description: `User's new password`,
  })
  @IsStrongPassword()
  newPassword: string;
}
