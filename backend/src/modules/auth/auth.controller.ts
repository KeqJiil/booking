import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Res,
} from '@nestjs/common';
import { LoginDto } from './application/dto/login.dto';
import { Cookies } from 'src/common/decorators/cookies.decorator';
import { RegisterDto } from './application/dto/register.dto';
import type { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { ForgotPasswordDto } from './application/dto/forgotPassword.dto';
import { ForgotNewPasswordDto } from './application/dto/newPassword.dto';
import { CommandBus } from '@nestjs/cqrs';
import {
  ChangePasswordCommand,
  ForgotChangePasswordCommand,
  ForgotPasswordCommand,
  LoginCommand,
  LogoutCommand,
  RefreshCommand,
  RegisterCommand,
  RevokeAllSessionsCommand,
  VerifyAccountCommand,
} from './application/commands/auth.commands';
import { Authorization } from 'src/common/decorators/authorization.decorator';
import { AccessInfo } from 'src/common/decorators/accessInfo.decorator';
import { ChangePasswordDto } from '../user/dto/password.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  private refreshConfig = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/auth',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  } as const;
  constructor(private readonly commandBus: CommandBus) {}

  @Post('refresh')
  @HttpCode(201)
  async refreshTokens(
    @Cookies('refreshtoken') token: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { access, refresh } = await this.commandBus.execute(
      new RefreshCommand(token),
    );
    res.cookie('refreshtoken', refresh, this.refreshConfig);
    return access;
  }

  @Post('login')
  @HttpCode(201)
  async login(
    @Body() data: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { access, refresh } = await this.commandBus.execute(
      new LoginCommand(data),
    );
    res.cookie('refreshtoken', refresh, this.refreshConfig);
    return access;
  }

  @Post('register')
  @HttpCode(201)
  async register(@Body() data: RegisterDto) {
    await this.commandBus.execute(new RegisterCommand(data));
  }

  @Get('verify/:id')
  @HttpCode(201)
  async verify(@Param('id') uuid: string) {
    await this.commandBus.execute(new VerifyAccountCommand(uuid));
  }

  @Post('forgot-password')
  @HttpCode(200)
  async forgotPassword(@Body() { email }: ForgotPasswordDto) {
    await this.commandBus.execute(new ForgotPasswordCommand(email));
  }

  @Post('new-password/:id')
  @HttpCode(200)
  async newForgotPassword(
    @Param('id') uuid: string,
    @Body() { password }: ForgotNewPasswordDto,
  ) {
    await this.commandBus.execute(
      new ForgotChangePasswordCommand(password, uuid),
    );
  }

  @Authorization('USER')
  @HttpCode(200)
  @Patch('change-password')
  async changePassword(
    @Body() data: ChangePasswordDto,
    @AccessInfo('id') id: string,
  ) {
    await this.commandBus.execute(
      new ChangePasswordCommand(id, data.password, data.newPassword),
    );
  }

  @Post('revoke-all')
  @HttpCode(204)
  async revokeAll(
    @Cookies('refreshtoken') token: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.commandBus.execute(new RevokeAllSessionsCommand(token));
    res.clearCookie('refreshtoken', this.refreshConfig);
  }

  @Post('logout')
  @HttpCode(204)
  async logout(
    @Cookies('refreshtoken') token: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.commandBus.execute(new LogoutCommand(token));
    res.clearCookie('refreshtoken', this.refreshConfig);
  }
}

//TOCTOU
//
