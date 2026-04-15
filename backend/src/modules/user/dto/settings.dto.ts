import { Themes } from '@prisma/client';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';

export class UserSettingsDto {
  @IsOptional()
  @IsEnum(Themes)
  theme?: Themes;

  @IsOptional()
  @IsBoolean()
  notifications?: boolean;
}
