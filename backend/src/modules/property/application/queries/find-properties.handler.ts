import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import type { IPropertyQueryRepo } from '../../domain/repo-interface/IPropertyRepo.interface';
import { Inject } from '@nestjs/common';
import { FindPropertyBySearchParamsQuery } from './property.queries';

@QueryHandler(FindPropertyBySearchParamsQuery)
export class FindPropertiesHandler implements IQueryHandler<FindPropertyBySearchParamsQuery> {
  constructor(
    @Inject('IPropertyRepo') private repository: IPropertyQueryRepo,
  ) {}

  async execute(query: FindPropertyBySearchParamsQuery): Promise<any> {
    return await this.repository.getList(query.searchParams);
  }
}
