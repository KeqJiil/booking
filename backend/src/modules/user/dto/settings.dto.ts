import { ApiPropertyOptional } from '@nestjs/swagger';
import { Themes } from '@prisma/client';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';

export class UserSettingsDto {
  @ApiPropertyOptional({
    enum: Themes,
    example: 'DARK',
    description: 'UI theme preference',
  })
  @IsOptional()
  @IsEnum(Themes)
  theme?: Themes;

  @ApiPropertyOptional({
    example: true,
    description: 'Enable or disable push notifications',
  })
  @IsOptional()
  @IsBoolean()
  notifications?: boolean;
}
