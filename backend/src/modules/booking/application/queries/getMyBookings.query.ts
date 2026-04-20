import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetMyBookingsQuery } from './booking.query';
import { Inject } from '@nestjs/common';
import type {
  IBookingRepoQuery,
  IQueryBookings,
} from '../../domain/repo-interfaces/IBookingRepo.interface';

@QueryHandler(GetMyBookingsQuery)
export class GetMyBookingsQueryHandler implements IQueryHandler<GetMyBookingsQuery> {
  constructor(
    @Inject('BookingRepoQuery') private readonly repo: IBookingRepoQuery,
  ) {}

  async execute(query: GetMyBookingsQuery): Promise<IQueryBookings[]> {
    return await this.repo.getMyBookings(query.userId, query.searchParams);
  }
}
