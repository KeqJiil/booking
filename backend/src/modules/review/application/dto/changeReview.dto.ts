import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';

export class ChangeReviewDto {
  @ApiProperty({
    example: 'Amazing stay! The view was breathtaking.',
    minLength: 5,
  })
  @IsString()
  @MinLength(5)
  @IsNotEmpty()
  text: string;

  @ApiProperty({
    example: 5,
    minimum: 1,
    maximum: 5,
    description: 'Rating from 1 to 5',
  })
  @IsNumber()
  @Min(1)
  @Max(5)
  @IsNotEmpty()
  rate: number;
}
