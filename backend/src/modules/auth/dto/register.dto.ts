import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  Length,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'test@test.com',
    description: `User's email`,
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '12345678QWErtY!',
    description: `User's password`,
  })
  @IsStrongPassword()
  password: string;

  @ApiProperty({
    example: 'Bob',
    description: 'User name',
  })
  @IsString()
  @IsNotEmpty()
  @Length(4, 20)
  name: string;
}
