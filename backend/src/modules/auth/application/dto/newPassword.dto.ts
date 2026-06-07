import { ApiProperty } from '@nestjs/swagger';
import { IsStrongPassword } from 'class-validator';

export class ForgotNewPasswordDto {
  @ApiProperty({
    example: 'Str0ngP@ssw0rd!',
    description: 'New strong password (min 8 chars, uppercase, number, symbol)',
  })
  @IsStrongPassword()
  password: string;
}
