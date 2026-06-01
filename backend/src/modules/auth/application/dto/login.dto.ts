import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

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
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  password: string;
}
