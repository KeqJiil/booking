import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Authorization } from 'src/common/decorators/authorization.decorator';
import { UserSettingsDto } from './dto/settings.dto';
import { AccessInfo } from 'src/common/decorators/accessInfo.decorator';
import { ChangePasswordDto } from './dto/password.dto';
import type { Roles } from 'src/common/constants/roleLevels';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Authorization('USER')
  @HttpCode(200)
  @Get('settings')
  async getSettings(@AccessInfo('id') id: string) {
    return await this.userService.getSettings(id);
  }

  @Authorization('USER')
  @HttpCode(200)
  @Patch('settings')
  async changeSettings(
    @Body() settings: UserSettingsDto,
    @AccessInfo('id') id: string,
  ) {
    return await this.userService.changeSettings(id, settings);
  }

  @Authorization('ADMIN')
  @HttpCode(200)
  @Patch(':id/role')
  async changeRole(@Param('id') userId: string, @Body() role: { role: Roles }) {
    return await this.userService.changeRole(userId, role.role);
  }

  @Authorization('USER')
  @HttpCode(200)
  @Patch('change-password')
  async changePassword(
    @Body() { password, newPassword }: ChangePasswordDto,
    @AccessInfo('id') id: string,
  ) {
    return await this.userService.changePassword(id, password, newPassword);
  }

  @Authorization('USER')
  @HttpCode(2001)
  @Delete('my/delete')
  async deleteMyAccount(@AccessInfo('id') id: string) {
    return await this.userService.deleteUser(id);
  }

  @Authorization('ADMIN')
  @HttpCode(200)
  @Delete(':id/delete')
  async deleteAccount(@Body() id: string) {
    return await this.userService.deleteUser(id);
  }

  @Authorization('ADMIN')
  @HttpCode(200)
  @Patch(':id/restore')
  async restoreUser(@Body() id: string) {
    return await this.userService.restoreUser(id);
  }
}
