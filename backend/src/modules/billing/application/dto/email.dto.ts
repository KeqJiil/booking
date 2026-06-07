import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class EmailDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email for Stripe account creation',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
