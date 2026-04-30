import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class NewAddressDto {
  @ApiProperty({ example: 'France', description: 'Country name' })
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiProperty({ example: 'Paris', description: 'City name' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 'Rue de Rivoli, 75001', description: 'Full address' })
  @IsString()
  @IsNotEmpty()
  address: string;
}
