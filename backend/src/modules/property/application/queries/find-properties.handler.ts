import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import type {
  IPropertyQueryRepo,
  IPropertyListView,
  IPaginatedResponse,
} from '../../domain/repo-interface/IPropertyRepo.interface';
import { Inject } from '@nestjs/common';
import { FindPropertyBySearchParamsQuery } from './property.queries';

@QueryHandler(FindPropertyBySearchParamsQuery)
export class FindPropertiesHandler implements IQueryHandler<FindPropertyBySearchParamsQuery> {
  constructor(
    @Inject('IPropertyRepoQuery') private repository: IPropertyQueryRepo,
  ) {}

  async execute(
    query: FindPropertyBySearchParamsQuery,
  ): Promise<IPaginatedResponse<IPropertyListView>> {
    return await this.repository.getList(query.searchParams);
  }
}
