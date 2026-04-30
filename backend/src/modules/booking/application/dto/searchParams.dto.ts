import { IsDate, IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import {
  bookingStatuses,
  type TBookingStatus,
} from 'src/common/constants/bookingStatuses';
import {
  orderByBooking,
  type TOrderByBooking,
} from '../../domain/repo-interfaces/IBookingRepo.interface';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class SearchParamsBookingsDto {
  @ApiPropertyOptional({ type: String, format: 'date-time' })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  startDate?: Date;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  endDate?: Date;

  @ApiPropertyOptional({ minimum: 1, example: 1000 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  totalPrice?: number;

  @ApiPropertyOptional({
    enum: bookingStatuses,
    description: 'Filter by booking status',
  })
  @IsEnum(bookingStatuses)
  @IsOptional()
  status?: TBookingStatus;

  @ApiPropertyOptional({ minimum: 1, example: 7 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  days?: number;

  @ApiPropertyOptional({
    enum: orderByBooking,
    description: 'Sorting criteria',
  })
  @IsEnum(orderByBooking)
  @IsOptional()
  orderBy?: TOrderByBooking;
}
