import { IsArray } from 'class-validator';

export class DeleteImagesDto {
  @IsArray()
  urls: string[];
}
