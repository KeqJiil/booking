import {
  Body,
  Controller,
  HttpCode,
  Param,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './application/dto/login.dto';
import { Cookies } from 'src/common/decorators/cookies.decorator';
import { RegisterDto } from './application/dto/register.dto';
import type { Request, Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { ForgotPasswordDto } from './application/dto/forgotPassword.dto';
import { ForgotNewPasswordDto } from './application/dto/newPassword.dto';

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
  constructor(private readonly authService: AuthService) {}

  @Post('refresh')
  @HttpCode(201)
  async refreshTokens(
    @Cookies('refreshtoken') token: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } =
      await this.authService.refreshTokens(token);
    res.cookie('refreshtoken', refreshToken, this.refreshConfig);
    return accessToken;
  }

  @Post('login')
  @HttpCode(201)
  async login(
    @Body() data: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } = await this.authService.login(
      data,
      req.ip!,
    );
    res.cookie('refreshtoken', refreshToken, this.refreshConfig);
    return accessToken;
  }

  @Post('register')
  @HttpCode(201)
  async register(@Body() data: RegisterDto) {
    await this.authService.register(data);
  }

  @Post('verify/:id')
  @HttpCode(201)
  async verify(
    @Res({ passthrough: true }) res: Response,
    @Param('id') uuid: string,
  ) {
    const { accessToken, refreshToken } = await this.authService.verify(uuid);
    res.cookie('refreshtoken', refreshToken, this.refreshConfig);
    return accessToken;
  }

  @Post('forgot-password')
  @HttpCode(200)
  async forgotPassword(@Body() email: ForgotPasswordDto) {
    await this.authService.forgotPassword(email.email);
  }

  @Post('new-password/:id')
  @HttpCode(200)
  async newForgotPassword(
    @Param('id') uuid: string,
    @Body() newPassword: ForgotNewPasswordDto,
  ) {
    await this.authService.newPassword(newPassword.password, uuid);
  }

  @Post('revoke-all')
  @HttpCode(204)
  async revokeAll(
    @Cookies('refreshtoken') token: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logoutAllSessions(token);
    res.clearCookie('refreshtoken', this.refreshConfig);
  }

  @Post('logout')
  @HttpCode(204)
  async logout(
    @Cookies('refreshtoken') token: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const logout = await this.authService.logout(token);
    if (logout) {
      res.clearCookie('refreshtoken', this.refreshConfig);
    }
  }
}

//TOCTOU
//
