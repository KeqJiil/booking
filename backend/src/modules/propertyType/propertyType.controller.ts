import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Authorization } from 'src/common/decorators/authorization.decorator';
import { PropertyTypeDto } from './application/dto/propertyType.dto';
import { PropertyTypeService } from './application/propertyType.service';

@Controller('property-type')
export class PropertyTypeController {
  constructor(private readonly propertyTypeService: PropertyTypeService) {}

  @Get('')
  @HttpCode(200)
  async getPropertyTypes() {
    return await this.propertyTypeService.getAll();
  }

  @Get(':id')
  @HttpCode(200)
  async getPropertyTypesById(@Param('id') data: string) {
    return await this.propertyTypeService.getById(data);
  }

  @Get('name/:name')
  @HttpCode(200)
  async getPropertyTypesByName(@Param('name') data: string) {
    return await this.propertyTypeService.getByName(data);
  }

  @Authorization('ADMIN')
  @Post('')
  @HttpCode(201)
  async createPropertyType(@Body() propertyType: PropertyTypeDto) {
    return await this.propertyTypeService.createType(propertyType.name);
  }

  @Authorization('ADMIN')
  @Patch(':id')
  @HttpCode(200)
  async changePropertyType(
    @Body() propertyType: PropertyTypeDto,
    @Param('id') id: string,
  ) {
    return await this.propertyTypeService.changeType({ ...propertyType, id });
  }

  @Authorization('ADMIN')
  @Delete(':id')
  @HttpCode(200)
  async deletePropertyType(@Param('id') id: string) {
    return await this.propertyTypeService.deleteType(id);
  }
}
