import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class ChangeReviewDto {
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @IsString()
  @Min(5)
  @IsNotEmpty()
  text: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  @IsNotEmpty()
  rate: number;
}
