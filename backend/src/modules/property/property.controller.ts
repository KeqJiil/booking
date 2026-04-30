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
} from '@nestjs/common';
import { PropertySearchParamsDto } from './application/dto/searchParams.dto';
import { CreatePropertyDTO } from './application/dto/createProperty.dto';
import { AccessInfo } from 'src/common/decorators/accessInfo.decorator';
import { Authorization } from 'src/common/decorators/authorization.decorator';
import { ChangePropertyDTO } from './application/dto/changeProperty.dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  CreatePropertyCommand,
  DeletePropertyCommand,
  EditPropertyCommand,
} from './application/commands/property.commands';
import type { Roles } from 'src/common/constants/roleLevels';
import {
  FindPropertyByIdQuery,
  FindPropertyBySearchParamsQuery,
} from './application/queries/property.queries';
import { IdempotencyAccess } from 'src/common/decorators/idempotency.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Property')
@Controller('property')
export class PropertyController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @HttpCode(200)
  async getPropertyList(@Query() searchParams: PropertySearchParamsDto) {
    return await this.queryBus.execute(
      new FindPropertyBySearchParamsQuery(searchParams),
    );
  }

  @Get(':id')
  @HttpCode(200)
  async getPropertyById(@Param('id') id: string) {
    return await this.queryBus.execute(new FindPropertyByIdQuery(id));
  }

  @Authorization('HOST')
  @Post('')
  @HttpCode(201)
  async createProperty(
    @IdempotencyAccess() idempotencyKey: string | null,
    @Body() createProperty: CreatePropertyDTO,
    @AccessInfo('id') id: string,
  ) {
    await this.commandBus.execute(
      new CreatePropertyCommand({ ...createProperty, hostId: id }),
    );
  }

  @Authorization('HOST')
  @Patch(':id')
  @HttpCode(200)
  async changeProperty(
    @Param('id') id: string,
    @Body() changeProperty: ChangePropertyDTO,
    @AccessInfo('id') userId: string,
  ) {
    await this.commandBus.execute(
      new EditPropertyCommand(userId, { ...changeProperty, id }),
    );
  }

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
