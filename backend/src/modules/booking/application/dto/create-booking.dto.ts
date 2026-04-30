import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({
    example: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
    format: 'uuid',
    description: 'ID of property',
  })
  @IsUUID()
  @IsNotEmpty()
  propertyId: string;

  @ApiProperty({
    example: '2026-06-01T14:00:00Z',
    format: 'date-time',
  })
  @IsDate()
  @IsNotEmpty()
  startDate: Date;

  @ApiProperty({
    example: '2026-06-01T14:00:00Z',
    format: 'date-time',
  })
  @IsDate()
  @IsNotEmpty()
  endDate: Date;
}
