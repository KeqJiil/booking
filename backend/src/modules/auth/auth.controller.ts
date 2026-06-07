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
import {
  ApiBearerAuth,
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CommandBus } from '@nestjs/cqrs';
import type { Response } from 'express';

import { LoginDto } from './application/dto/login.dto';
import { RegisterDto } from './application/dto/register.dto';
import { ForgotPasswordDto } from './application/dto/forgotPassword.dto';
import { ForgotNewPasswordDto } from './application/dto/newPassword.dto';
import { ChangePasswordDto } from '../user/dto/password.dto';
import { Cookies } from 'src/common/decorators/cookies.decorator';
import { Authorization } from 'src/common/decorators/authorization.decorator';
import { AccessInfo } from 'src/common/decorators/accessInfo.decorator';
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

  @ApiOperation({ summary: 'Refresh access token using refresh cookie' })
  @ApiCookieAuth('refreshtoken')
  @ApiResponse({
    status: 201,
    description: 'New access token returned',
    schema: { example: { accessToken: 'eyJ...' } },
  })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
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

  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 201,
    description: 'Access token returned, refresh token set in cookie',
    schema: { example: { accessToken: 'eyJ...' } },
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
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

  @ApiOperation({ summary: 'Register a new user account' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'User registered, verification email sent',
  })
  @ApiResponse({ status: 409, description: 'Email already taken' })
  @Post('register')
  @HttpCode(201)
  async register(@Body() data: RegisterDto) {
    await this.commandBus.execute(new RegisterCommand(data));
  }

  @ApiOperation({ summary: 'Verify user account via link from email' })
  @ApiParam({
    name: 'id',
    description: 'Verification UUID from email',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({ status: 201, description: 'Account verified successfully' })
  @ApiResponse({ status: 404, description: 'Token not found or expired' })
  @Get('verify/:id')
  @HttpCode(201)
  async verify(@Param('id') uuid: string) {
    await this.commandBus.execute(new VerifyAccountCommand(uuid));
  }

  @ApiOperation({ summary: 'Request a password reset email' })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Reset email sent if account exists',
  })
  @Post('forgot-password')
  @HttpCode(200)
  async forgotPassword(@Body() { email }: ForgotPasswordDto) {
    await this.commandBus.execute(new ForgotPasswordCommand(email));
  }

  @ApiOperation({ summary: 'Set new password using reset token from email' })
  @ApiParam({
    name: 'id',
    description: 'Password reset token UUID',
    type: String,
    format: 'uuid',
  })
  @ApiBody({ type: ForgotNewPasswordDto })
  @ApiResponse({ status: 200, description: 'Password updated successfully' })
  @ApiResponse({ status: 404, description: 'Reset token not found or expired' })
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

  @ApiOperation({ summary: 'Change password for authenticated user' })
  @ApiBearerAuth()
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 401, description: 'Wrong current password' })
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

  @ApiOperation({ summary: 'Revoke all active sessions for this account' })
  @ApiCookieAuth('refreshtoken')
  @ApiResponse({ status: 204, description: 'All sessions revoked' })
  @Post('revoke-all')
  @HttpCode(204)
  async revokeAll(
    @Cookies('refreshtoken') token: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.commandBus.execute(new RevokeAllSessionsCommand(token));
    res.clearCookie('refreshtoken', this.refreshConfig);
  }

  @ApiOperation({ summary: 'Logout from current session' })
  @ApiCookieAuth('refreshtoken')
  @ApiResponse({
    status: 204,
    description: 'Session terminated, cookie cleared',
  })
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
