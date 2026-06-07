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
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { Authorization } from 'src/common/decorators/authorization.decorator';
import { PropertyTypeDto } from './application/dto/propertyType.dto';
import { PropertyTypeService } from './application/propertyType.service';

@ApiTags('Property Types')
@Controller('property-type')
export class PropertyTypeController {
  constructor(private readonly propertyTypeService: PropertyTypeService) {}

  @ApiOperation({ summary: 'Get all property types (public)' })
  @ApiResponse({
    status: 200,
    description: 'Array of all property types',
    schema: {
      example: [
        { id: 'uuid', name: 'Houses' },
        { id: 'uuid', name: 'Apartments' },
      ],
    },
  })
  @Get('')
  @HttpCode(200)
  async getPropertyTypes() {
    return await this.propertyTypeService.getAll();
  }

  @ApiOperation({ summary: 'Get property type by name (public)' })
  @ApiParam({ name: 'name', type: String, description: 'Property type name' })
  @ApiResponse({
    status: 200,
    description: 'Property type object',
    schema: { example: { id: 'uuid', name: 'Houses' } },
  })
  @ApiResponse({ status: 404, description: 'Property type not found' })
  @Get('name/:name')
  @HttpCode(200)
  async getPropertyTypesByName(@Param('name') data: string) {
    return await this.propertyTypeService.getByName(data);
  }

  @ApiOperation({ summary: 'Get property type by ID (public)' })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    description: 'Property type UUID',
  })
  @ApiResponse({
    status: 200,
    description: 'Property type object',
    schema: { example: { id: 'uuid', name: 'Houses' } },
  })
  @ApiResponse({ status: 404, description: 'Property type not found' })
  @Get(':id')
  @HttpCode(200)
  async getPropertyTypesById(@Param('id') data: string) {
    return await this.propertyTypeService.getById(data);
  }

  @ApiOperation({ summary: 'Create a new property type (ADMIN only)' })
  @ApiBearerAuth()
  @ApiBody({ type: PropertyTypeDto })
  @ApiResponse({
    status: 201,
    description: 'Property type created',
    schema: { example: { id: 'uuid', name: 'Houses' } },
  })
  @ApiResponse({
    status: 409,
    description: 'Property type with this name already exists',
  })
  @Authorization('ADMIN')
  @Post('')
  @HttpCode(201)
  async createPropertyType(@Body() propertyType: PropertyTypeDto) {
    return await this.propertyTypeService.createType(propertyType.name);
  }

  @ApiOperation({ summary: 'Update property type name (ADMIN only)' })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    description: 'Property type UUID',
  })
  @ApiBody({ type: PropertyTypeDto })
  @ApiResponse({
    status: 200,
    description: 'Property type updated',
    schema: { example: { id: 'uuid', name: 'Villas' } },
  })
  @ApiResponse({ status: 404, description: 'Property type not found' })
  @Authorization('ADMIN')
  @Patch(':id')
  @HttpCode(200)
  async changePropertyType(
    @Body() propertyType: PropertyTypeDto,
    @Param('id') id: string,
  ) {
    return await this.propertyTypeService.changeType({ ...propertyType, id });
  }

  @ApiOperation({ summary: 'Delete property type (ADMIN only)' })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    description: 'Property type UUID',
  })
  @ApiResponse({ status: 200, description: 'Property type deleted' })
  @ApiResponse({ status: 404, description: 'Property type not found' })
  @Authorization('ADMIN')
  @Delete(':id')
  @HttpCode(200)
  async deletePropertyType(@Param('id') id: string) {
    return await this.propertyTypeService.deleteType(id);
  }
}
