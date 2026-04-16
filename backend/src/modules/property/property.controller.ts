import { Controller, Get, HttpCode, Param, Query } from '@nestjs/common';
import { PropertySearchParamsDto } from './application/dto/searchParams.dto';

@Controller('property')
export class PropertyController {
  constructor() {}

  @Get()
  @HttpCode(200)
  async getPropertyList(@Query() searchParams: PropertySearchParamsDto) {}

  @Get(':id')
  @HttpCode(200)
  async getPropertyById(@Param('id') id: string) {}
}
