import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import type {
  IPropertyQueryRepo,
  IPropertyView,
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
  ): Promise<IPropertyView[]> {
    return await this.repository.getList(query.searchParams);
  }
}
