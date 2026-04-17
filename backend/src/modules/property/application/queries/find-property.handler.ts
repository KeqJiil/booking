import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import type { IPropertyQueryRepo } from '../../domain/repo-interface/IPropertyRepo.interface';
import { Inject } from '@nestjs/common';
import { FindPropertyByIdQuery } from './property.queries';

@QueryHandler(FindPropertyByIdQuery)
export class FindPropertyHandler implements IQueryHandler<FindPropertyByIdQuery> {
  constructor(
    @Inject('IPropertyRepoQuery') private repository: IPropertyQueryRepo,
  ) {}

  async execute(query: FindPropertyByIdQuery): Promise<any> {
    return await this.repository.getById(query.id);
  }
}
