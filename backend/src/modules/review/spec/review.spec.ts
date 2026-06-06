import { ReviewService } from '../application/review.service';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { RedisService } from 'src/infrastructure/redis/redis.service';
import { createMock } from '@golevelup/ts-jest';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaReviewRepository } from '../infrastructure/repo/IReview.repository';
import { eventNames } from 'src/common/constants/eventnames';
import { REDIS } from 'src/common/constants/providerConstants';

jest.mock('crypto', () => ({
  randomUUID: jest.fn().mockReturnValue('fake-uuid-123'),
}));

describe('review service', () => {
  let service: ReviewService;
  let cache: jest.Mocked<RedisService>;
  let repo: jest.Mocked<PrismaReviewRepository>;
  let eventEmitter: EventEmitter2;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: REDIS, useValue: createMock<RedisService>() },
        { provide: EventEmitter2, useValue: createMock<EventEmitter2>() },
        ReviewService,
        {
          provide: 'ReviewRepo',
          useValue: createMock<PrismaReviewRepository>(),
        },
      ],
    }).compile();

    service = module.get<ReviewService>(ReviewService);
    cache = module.get(REDIS);
    repo = module.get('ReviewRepo');
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
    jest.clearAllMocks();
  });

  describe('createReview', () => {
    const dto = { text: 'Great place!', rate: 5, propertyId: 'prop-1' };
    const userId = 'user-1';

    it('should throw NotFoundException', async () => {
      cache.get.mockResolvedValue(null);

      await expect(service.createReview(dto, userId)).rejects.toThrow(
        NotFoundException,
      );

      expect(repo.save).not.toHaveBeenCalled();
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    it('should create a review', async () => {
      const fakeCacheData = { bookingId: 'booking-777' };
      cache.get.mockResolvedValue(fakeCacheData);
      repo.save.mockResolvedValue(undefined);
      await service.createReview(dto, userId);

      expect(cache.get).toHaveBeenCalledWith(`review:${userId}`);

      expect(repo.save).toHaveBeenCalledWith({
        ...dto,
        bookingId: fakeCacheData.bookingId,
        userId: userId,
        id: expect.any(String),
      });

      expect(eventEmitter.emit).toHaveBeenCalledTimes(2);
    });
  });

  describe('changeReview', () => {
    const reviewId = 'rev-412';
    const dto = { text: 'Updated text', rate: 4 };
    const userId = 'user-1';

    it('should edit review', async () => {
      repo.changeReveiew.mockResolvedValue(undefined);

      await service.changeReview(reviewId, dto, userId);

      expect(repo.changeReveiew).toHaveBeenCalledWith(
        { id: reviewId, ...dto },
        userId,
      );
      expect(eventEmitter.emit).toHaveBeenCalledWith(expect.any(String), {
        ...dto,
        userId,
      });
    });
  });

  describe('deleteReview', () => {
    it('should delete review', async () => {
      const reviewId = 'rev-123';
      const userId = 'user-99';

      await service.deleteReview(reviewId, userId);

      expect(repo.deleteReview).toHaveBeenCalledWith(reviewId, userId);
    });

    it('should not delete review', async () => {
      repo.deleteReview.mockRejectedValue(new NotFoundException());

      await expect(service.deleteReview('invalid', 'userId')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getReviewsByProperty', () => {
    it('should return reviews', async () => {
      const mockResult = [
        {
          id: '1',
          text: 'nice',
          rating: 3,
          description: '123123123',
          bookingId: '222',
          propertyId: '1231',
          reviewerId: 'user-1',
          createdAt: new Date(34124612784621),
        },
      ];
      repo.getReviewsByProperty.mockResolvedValue(mockResult);

      const result = await service.getReviewsByProperty('prop-1', {});

      expect(result).toEqual(mockResult);
      expect(repo.getReviewsByProperty).toHaveBeenCalledWith('prop-1', {});
    });
  });

  describe('getMyReviews', () => {
    it('should return reviews for the user', async () => {
      const mockResult = [
        {
          id: '1',
          text: 'nice',
          rating: 3,
          description: '123123123',
          bookingId: '222',
          propertyId: '1231',
          reviewerId: 'user-1',
          createdAt: new Date(34124612784621),
        },
      ];
      repo.getMyReviews.mockResolvedValue(mockResult);

      const result = await service.getMyReviews('user-1', {});

      expect(result).toEqual(mockResult);
      expect(repo.getMyReviews).toHaveBeenCalledWith('user-1', {});
    });
  });

  describe('createReview event names', () => {
    it('should emit new_review_created and new_review_received with correct payload', async () => {
      const dto = { text: 'Great!', rate: 5, propertyId: 'prop-1' };
      const userId = 'user-1';
      cache.get.mockResolvedValue({ bookingId: 'booking-777' });
      repo.save.mockResolvedValue(undefined);

      await service.createReview(dto, userId);

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        eventNames.new_review_created,
        { ...dto, userId },
      );
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        eventNames.new_review_received,
        { ...dto, userId },
      );
    });
  });

  describe('changeReview error', () => {
    it('repo throws → propagates error and does not emit event', async () => {
      repo.changeReveiew.mockRejectedValue(new NotFoundException());

      await expect(
        service.changeReview('rev-1', { text: 'upd', rate: 3 }, 'user-1'),
      ).rejects.toThrow(NotFoundException);

      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });
  });
});
