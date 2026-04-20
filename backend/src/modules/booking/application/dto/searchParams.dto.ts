import { IsDate, IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import {
  bookingStatuses,
  type TBookingStatus,
} from 'src/common/constants/bookingStatuses';
import {
  orderByBooking,
  type TOrderByBooking,
} from '../../domain/repo-interfaces/IBookingRepo.interface';

export class SearchParamsBookingsDto {
  @IsDate()
  @IsOptional()
  startDate?: Date;

  @IsDate()
  @IsOptional()
  endDate?: Date;

  @IsNumber()
  @IsOptional()
  @Min(1)
  totalPrice?: number;

  @IsEnum(bookingStatuses)
  @IsOptional()
  status?: TBookingStatus;

  @IsNumber()
  @IsOptional()
  @Min(1)
  days?: number;

  @IsEnum(orderByBooking)
  @IsOptional()
  orderBy?: TOrderByBooking;
}
