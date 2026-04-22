import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class CreateReviewDto {
  @IsString()
  @Min(5)
  @IsNotEmpty()
  text: string;

  @IsUUID()
  @IsNotEmpty()
  propertyId: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  @IsNotEmpty()
  rate: number;
}
