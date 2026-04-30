import { QueryBus } from '@nestjs/cqrs';
import {
  IPropertyAdapterToBooking,
  IPropertyDataForBook,
} from '../../domain/repo-interfaces/IPropertyAdapter.interface';
import { FindPropertyByIdQuery } from 'src/modules/property/application/queries/property.queries';
import { Injectable, NotFoundException } from '@nestjs/common';
import { IPropertyView } from 'src/modules/property/domain/repo-interface/IPropertyRepo.interface';

@Injectable()
export class PropertyProviderAdapter implements IPropertyAdapterToBooking {
  constructor(private readonly queryBus: QueryBus) {}

  async getData(propertyId: string): Promise<IPropertyDataForBook> {
    const property = await this.queryBus.execute<
      FindPropertyByIdQuery,
      IPropertyView
    >(new FindPropertyByIdQuery(propertyId));
    if (!property) throw new NotFoundException('Property not found');
    return {
      price: property.price,
      hostId: property.hostId,
    };
  }
}
