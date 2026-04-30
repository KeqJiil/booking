import { ApiProperty } from '@nestjs/swagger';
import { Themes } from '@prisma/client';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';

export class UserSettingsDto {
  @ApiProperty({
    example: 'DARK',
    description: 'User theme',
  })
  @IsOptional()
  @IsEnum(Themes)
  theme?: Themes;

  @ApiProperty({
    example: true,
    description: 'Notification status',
  })
  @IsOptional()
  @IsBoolean()
  notifications?: boolean;
}
