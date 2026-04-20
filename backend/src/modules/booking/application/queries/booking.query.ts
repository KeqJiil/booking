import { ISearchParams } from '../../domain/repo-interfaces/IBookingRepo.interface';

export class GetMyBookingsQuery {
  constructor(
    public readonly userId: string,
    public readonly searchParams: ISearchParams,
  ) {}
}

export class GetBookingByIdQuery {
  constructor(public readonly id: string) {}
}

export class GetBookingsByPropertyQuery {
  constructor(
    public readonly propertyId: string,
    public readonly searchParams: ISearchParams,
  ) {}
}
