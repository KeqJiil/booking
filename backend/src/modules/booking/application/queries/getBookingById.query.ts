import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetBookingByIdQuery } from './booking.query';
import type {
  IBookingRepoQuery,
  IQueryBookings,
} from '../../domain/repo-interfaces/IBookingRepo.interface';
import { Inject } from '@nestjs/common';

@QueryHandler(GetBookingByIdQuery)
export class GetBookingByIdHandler implements IQueryHandler<GetBookingByIdQuery> {
  constructor(
    @Inject('BookingRepoQuery') private readonly repo: IBookingRepoQuery,
  ) {}

  async execute(query: GetBookingByIdQuery): Promise<IQueryBookings | null> {
    return await this.repo.getBookingById(query.id);
  }
}
