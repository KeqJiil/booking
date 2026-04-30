import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  Min,
  MinLength,
} from 'class-validator';
export class CreatePropertyDTO {
  @ApiProperty({
    example: 'Modern Loft in Center',
    description: 'The name of the property',
    minLength: 4,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  name: string;

  @ApiProperty({
    example:
      'A spacious modern loft located in the heart of the city with amazing views.',
    description: 'Detailed description of the property',
    minLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(20)
  description: string;

  @ApiProperty({
    example: 120,
    description: 'Price per night',
    minimum: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  price: number;

  @ApiProperty({
    example: 2,
    description: 'Maximum number of guests allowed',
    minimum: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  maxGuests: number;

  @ApiProperty({
    example: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
    description: 'UUID of the property type',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  typeId: string;

  @ApiProperty({ example: 'Berlin', description: 'City location' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 'Germany', description: 'Country location' })
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiProperty({
    example: 'Alexanderplatz 1, 10178',
    description: 'Full street address',
  })
  @IsString()
  @IsNotEmpty()
  address: string;
}
