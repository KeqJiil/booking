import { IsArray } from 'class-validator';

export class UpdateImagesDto {
  @IsArray()
  urls: string[];
}
