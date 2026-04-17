import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class PropertyTypeDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name: string;
}
