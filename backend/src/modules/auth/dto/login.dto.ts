import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsStrongPassword } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'test@test.com',
    description: `User's email`,
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '12345678QwerTY!',
    description: `User's password`,
  })
  @IsStrongPassword()
  password: string;
}
