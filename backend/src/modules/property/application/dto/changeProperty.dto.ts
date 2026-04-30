import { Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { NewAddressDto } from './newAddress.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ChangePropertyDTO {
  @ApiPropertyOptional({
    example: 'Beautiful House',
    description: 'New name of property',
    minLength: 4,
  })
  @IsOptional()
  @IsString()
  @MinLength(4)
  name?: string;

  @ApiPropertyOptional({
    example: 'Beautiful house with 4 rooms and a large garden',
    description: 'New description of property',
    minLength: 20,
  })
  @IsOptional()
  @IsString()
  @MinLength(20)
  description?: string;

  @ApiPropertyOptional({
    type: () => NewAddressDto,
    description: 'Updated address details',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => NewAddressDto)
  newAddress?: NewAddressDto;

  @ApiPropertyOptional({ example: 4, minimum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxGuests?: number;

  @ApiPropertyOptional({ example: 150, minimum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  price?: number;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID('4')
  typeId?: string;
}
