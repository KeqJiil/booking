import {
  IsOptional,
  IsString,
  IsNumber,
  IsInt,
  Min,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  type IOrderByProperty,
  orderBy,
} from '../../domain/repo-interface/IPropertyRepo.interface';

export class PropertySearchParamsDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  typeId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  maxPrice?: number;

  @IsOptional()
  @IsString()
  hostId?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsEnum(orderBy)
  orderBy?: IOrderByProperty;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(5)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  maxGuests?: number;
}
