import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiHeader,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import { PropertySearchParamsDto } from './application/dto/searchParams.dto';
import { CreatePropertyDTO } from './application/dto/createProperty.dto';
import { ChangePropertyDTO } from './application/dto/changeProperty.dto';
import { AccessInfo } from 'src/common/decorators/accessInfo.decorator';
import { Authorization } from 'src/common/decorators/authorization.decorator';
import { IdempotencyAccess } from 'src/common/decorators/idempotency.decorator';
import { IdempotencyGuard } from 'src/common/guards/Idempotency.guard';
import {
  CreatePropertyCommand,
  DeletePropertyCommand,
  EditPropertyCommand,
} from './application/commands/property.commands';
import {
  FindPropertyByIdQuery,
  FindPropertyBySearchParamsQuery,
} from './application/queries/property.queries';
import type { Roles } from 'src/common/constants/roleLevels';

@ApiTags('Property')
@Controller('property')
export class PropertyController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({
    summary: 'Search properties with filters and cursor pagination',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of properties',
    schema: {
      example: {
        items: [
          {
            id: 'uuid',
            name: 'Modern Loft',
            price: 120,
            city: 'Berlin',
            country: 'Germany',
            maxGuests: 4,
          },
        ],
        nextCursor: 'uuid',
      },
    },
  })
  @Get()
  @HttpCode(200)
  async getPropertyList(@Query() searchParams: PropertySearchParamsDto) {
    return await this.queryBus.execute(
      new FindPropertyBySearchParamsQuery(searchParams),
    );
  }

  @ApiOperation({ summary: 'Get property details by ID' })
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    description: 'Property UUID',
  })
  @ApiResponse({
    status: 200,
    description: 'Property object with images and reviews',
    schema: {
      example: {
        id: 'uuid',
        name: 'Modern Loft',
        description: 'Spacious loft in city center',
        price: 120,
        maxGuests: 4,
        city: 'Berlin',
        country: 'Germany',
        images: [],
        reviews: [],
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Property not found' })
  @Get(':id')
  @HttpCode(200)
  async getPropertyById(@Param('id') id: string) {
    return await this.queryBus.execute(new FindPropertyByIdQuery(id));
  }

  @ApiOperation({ summary: 'Create a new property listing (HOST only)' })
  @ApiBearerAuth()
  @ApiHeader({
    name: 'X-Idempotency-Key',
    required: true,
    description: 'Unique key to prevent duplicate creation',
  })
  @ApiBody({ type: CreatePropertyDTO })
  @ApiResponse({
    status: 201,
    description: 'Property created',
    schema: { example: { id: 'uuid' } },
  })
  @ApiResponse({
    status: 403,
    description: 'Only HOST role can create properties',
  })
  @ApiResponse({
    status: 409,
    description: 'Duplicate request (idempotency conflict)',
  })
  @Authorization('HOST')
  @UseGuards(IdempotencyGuard)
  @Post('')
  @HttpCode(201)
  async createProperty(
    @IdempotencyAccess() idempotencyKey: string,
    @Body() createProperty: CreatePropertyDTO,
    @AccessInfo('id') id: string,
  ) {
    return await this.commandBus.execute(
      new CreatePropertyCommand({
        ...createProperty,
        hostId: id,
        images: [],
      }),
    );
  }

  @ApiOperation({
    summary: 'Update property fields (HOST only, must be owner)',
  })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    description: 'Property UUID',
  })
  @ApiBody({ type: ChangePropertyDTO })
  @ApiResponse({ status: 200, description: 'Property updated successfully' })
  @ApiResponse({ status: 403, description: 'Not the owner of this property' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  @Authorization('HOST')
  @Patch(':id')
  @HttpCode(200)
  async changeProperty(
    @Param('id') id: string,
    @Body() changeProperty: ChangePropertyDTO,
    @AccessInfo('id') userId: string,
  ) {
    await this.commandBus.execute(
      new EditPropertyCommand(userId, {
        id,
        name: changeProperty.name,
        description: changeProperty.description,
        maxGuests: changeProperty.maxGuests,
        price: changeProperty.price,
        typeId: changeProperty.typeId,
        ...(changeProperty.newAddress
          ? {
              city: changeProperty.newAddress.city,
              country: changeProperty.newAddress.country,
              address: changeProperty.newAddress.address,
            }
          : {}),
      }),
    );
  }

  @ApiOperation({ summary: 'Delete property (HOST = own only, ADMIN = any)' })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    type: String,
    format: 'uuid',
    description: 'Property UUID',
  })
  @ApiResponse({ status: 200, description: 'Property deleted successfully' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Property not found' })
  @Authorization('HOST')
  @Delete(':id')
  @HttpCode(200)
  async deleteProperty(
    @Param('id') id: string,
    @AccessInfo('role') role: Roles,
    @AccessInfo('id') userId: string,
  ) {
    await this.commandBus.execute(new DeletePropertyCommand(id, userId, role));
  }
}
