import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class DeleteImagesDto {
  @ApiProperty({
    type: [String],
    example: [
      'https://cdn.example.com/img1.jpg',
      'https://cdn.example.com/img2.jpg',
    ],
    description: 'Array of image URLs to delete',
  })
  @IsArray()
  @IsString({ each: true })
  urls: string[];
}
