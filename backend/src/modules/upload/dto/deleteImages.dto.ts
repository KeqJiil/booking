import { IsArray, IsString } from 'class-validator';

export class DeleteImagesDto {
  @IsArray()
  @IsString({ each: true })
  urls: string[];
}
