import {
  IsOptional,
  IsString,
  IsNumber,
  IsInt,
  Min,
  IsEnum,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  type IOrderByProperty,
  orderBy,
} from '../../domain/repo-interface/IPropertyRepo.interface';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  type IOrderStyle,
  orderStyle,
} from 'src/common/constants/searchParamsConsts';

export class PropertySearchParamsDto {
  @ApiPropertyOptional({ description: 'Search by property name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Filter by type UUID' })
  @IsOptional()
  @IsString()
  typeId?: string;

  @ApiPropertyOptional({ minimum: 0, example: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ minimum: 1, example: 500 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  maxPrice?: number;

  @ApiPropertyOptional({ description: 'Filter by host UUID' })
  @IsOptional()
  @IsString()
  hostId?: string;

  @ApiPropertyOptional({ example: 'Italy' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ example: 'Rome' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({
    enum: orderBy,
    description: 'Sorting order',
  })
  @IsOptional()
  @IsEnum(orderBy)
  orderBy?: IOrderByProperty;

  @ApiPropertyOptional({
    enum: orderStyle,
    description: 'Sorting style',
  })
  @IsOptional()
  @IsEnum(orderStyle)
  orderStyle?: IOrderStyle;

  @ApiPropertyOptional({
    default: 10,
    minimum: 5,
    description: 'Pagination limit',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(5)
  @Max(50)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Pagination cursor' })
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional({ minimum: 1, example: 2 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  maxGuests?: number;
}
