import { IsStrongPassword } from 'class-validator';

export class ForgotNewPasswordDto {
  @IsStrongPassword()
  password: string;
}
