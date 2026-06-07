import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { UserService } from './user.service';
import { Authorization } from 'src/common/decorators/authorization.decorator';
import { UserSettingsDto } from './dto/settings.dto';
import { AccessInfo } from 'src/common/decorators/accessInfo.decorator';
import type { Roles } from 'src/common/constants/roleLevels';

@ApiTags('User')
@ApiBearerAuth()
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: 'Get own account settings (USER)' })
  @ApiResponse({
    status: 200,
    description: 'User settings object',
    schema: { example: { theme: 'DARK', notifications: true } },
  })
  @Authorization('USER')
  @HttpCode(200)
  @Get('settings')
  async getSettings(@AccessInfo('id') id: string) {
    return await this.userService.getSettings(id);
  }

  @ApiOperation({ summary: 'Update own account settings (USER)' })
  @ApiBody({ type: UserSettingsDto })
  @ApiResponse({
    status: 200,
    description: 'Updated settings object',
    schema: { example: { theme: 'LIGHT', notifications: false } },
  })
  @Authorization('USER')
  @HttpCode(200)
  @Patch('settings')
  async changeSettings(
    @Body() settings: UserSettingsDto,
    @AccessInfo('id') id: string,
  ) {
    return await this.userService.changeSettings(id, settings);
  }

  @ApiOperation({ summary: 'Change user role (ADMIN only)' })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    description: 'Target user UUID',
  })
  @ApiBody({ schema: { example: { role: 'HOST' } } })
  @ApiResponse({ status: 200, description: 'Role updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Authorization('ADMIN')
  @HttpCode(200)
  @Patch(':id/role')
  async changeRole(@Param('id') userId: string, @Body() role: { role: Roles }) {
    return await this.userService.changeRole(userId, role.role);
  }

  @ApiOperation({ summary: 'Delete own account (USER)' })
  @ApiResponse({ status: 201, description: 'Account deleted successfully' })
  @Authorization('USER')
  @HttpCode(201)
  @Delete('my/delete')
  async deleteMyAccount(@AccessInfo('id') id: string) {
    return await this.userService.deleteUser(id);
  }

  @ApiOperation({ summary: 'Delete any user account (ADMIN only)' })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    description: 'Target user UUID',
  })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Authorization('ADMIN')
  @HttpCode(200)
  @Delete(':id/delete')
  async deleteAccount(@Param('id') id: string) {
    return await this.userService.deleteUser(id);
  }

  @ApiOperation({ summary: 'Restore soft-deleted user (ADMIN only)' })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    description: 'Target user UUID',
  })
  @ApiResponse({ status: 200, description: 'User restored successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Authorization('ADMIN')
  @HttpCode(200)
  @Patch(':id/restore')
  async restoreUser(@Param('id') id: string) {
    return await this.userService.restoreUser(id);
  }
}
