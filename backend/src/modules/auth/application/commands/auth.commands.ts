import { Command } from '@nestjs/cqrs';
import { ITokens } from '../../types';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';

export class LoginCommand extends Command<ITokens> {
  constructor(
    public readonly data: LoginDto,
    public readonly ip: string,
  ) {
    super();
  }
}

export class RegisterCommand extends Command<void> {
  constructor(public readonly data: RegisterDto) {
    super();
  }
}

export class RefreshCommand extends Command<ITokens> {
  constructor(public readonly refreshToken: string) {
    super();
  }
}

export class ForgotPasswordCommand extends Command<void> {
  constructor(public readonly email: string) {
    super();
  }
}

export class VerifyAccoundCommand extends Command<ITokens> {
  constructor(public readonly uuid: string) {
    super();
  }
}

export class ChangePasswordCommand extends Command<void> {
  constructor(
    public readonly password: string,
    public readonly uuid: string,
  ) {
    super();
  }
}

export class LogoutCommand extends Command<void> {
  constructor(public readonly refreshToken: string) {
    super();
  }
}

export class RevokeAllSessionsCommand extends Command<void> {
  constructor(public readonly refreshToken: string) {
    super();
  }
}
