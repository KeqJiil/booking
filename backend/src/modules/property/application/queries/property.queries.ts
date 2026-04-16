import { IPropertySearchParams } from '../../domain/repo-interface/IPropertyRepo.interface';

export class FindPropertyByIdQuery {
  constructor(public readonly id: string) {}
}

export class FindPropertyBySearchParamsQuery {
  constructor(public readonly searchParams: IPropertySearchParams) {}
}
