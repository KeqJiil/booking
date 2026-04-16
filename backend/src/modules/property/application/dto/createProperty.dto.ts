import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  Min,
  MinLength,
} from 'class-validator';
import { ILiveStatus, LiveStatus } from '../../domain/entities/Property.entity';

export class CreatePropertyDTO {
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(20)
  description: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  price: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  maxGuests: number;

  @IsEnum(LiveStatus)
  @IsNotEmpty()
  status: ILiveStatus;

  @IsUUID()
  @IsNotEmpty()
  typeId: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsString()
  @IsNotEmpty()
  address: string;
}
