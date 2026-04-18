import { Body, Controller, HttpCode, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Cookies } from 'src/common/decorators/cookies.decorator';
import { RegisterDto } from './dto/register.dto';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  private refreshConfig = {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
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
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } = await this.authService.login(data);
    res.cookie('refreshtoken', refreshToken, this.refreshConfig);
    return accessToken;
  }

  @Post('register')
  @HttpCode(201)
  async register(@Body() data: RegisterDto, @Res() res: Response) {
    const { accessToken, refreshToken } = await this.authService.register(data);
    res.cookie('refreshtoken', refreshToken, this.refreshConfig);
    return accessToken;
  }

  @Post('logout')
  @HttpCode(204)
  async logout(
    @Cookies('refreshtoken') token: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const logout = await this.authService.logout(token);
    if (logout) {
      res.clearCookie('refreshtoken');
      return { success: true };
    }
  }
}
