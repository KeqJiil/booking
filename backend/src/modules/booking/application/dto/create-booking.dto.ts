import { IsDate, IsNotEmpty, IsNumber, IsUUID, Min } from 'class-validator';

export class CreateBookingDto {
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  priceAtMoment: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  days: number;

  @IsUUID()
  @IsNotEmpty()
  propertyId: string;

  @IsDate()
  @IsNotEmpty()
  startDate: Date;

  @IsDate()
  @IsNotEmpty()
  endDate: Date;

  @IsUUID()
  @IsNotEmpty()
  hostId: string;
}
