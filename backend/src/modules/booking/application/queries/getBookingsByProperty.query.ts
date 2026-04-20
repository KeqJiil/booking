import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetBookingsByPropertyQuery } from './booking.query';
import type {
  IBookingRepoQuery,
  IQueryBookings,
} from '../../domain/repo-interfaces/IBookingRepo.interface';

@QueryHandler(GetBookingsByPropertyQuery)
export class GetBookingsByPropertyHandler implements IQueryHandler<GetBookingsByPropertyQuery> {
  constructor(
    @Inject('BookingRepoQuery') private readonly repo: IBookingRepoQuery,
  ) {}

  async execute(query: GetBookingsByPropertyQuery): Promise<IQueryBookings[]> {
    return await this.repo.getBookingByProperty(
      query.propertyId,
      query.searchParams,
    );
  }
}
