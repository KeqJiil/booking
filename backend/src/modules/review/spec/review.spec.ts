import { ReviewService } from '../application/review.service';
import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { NotFoundException } from '@nestjs/common';

jest.mock('crypto', () => ({
  randomUUID: jest.fn().mockReturnValue('fake-uuid-123'),
}));

describe('review', () => {
  let service: ReviewService;

  const mockCache = {
    get: jest.fn(),
  };

  const mockRepo = {
    save: jest.fn(),
    changeReveiew: jest.fn(),
    deleteReview: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewService,
        { provide: CACHE_MANAGER, useValue: mockCache },
        {
          provide: 'ReviewRepo',
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<ReviewService>(ReviewService);
    jest.clearAllMocks();
  });

  describe('createReview', () => {
    const dto = { text: 'Great place!', rate: 5, propertyId: 'prop-1' };
    const userId = 'user-1';

    it('should throw NotFoundException', async () => {
      mockCache.get.mockResolvedValue(null);

      await expect(service.createReview(dto, userId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockRepo.save).not.toHaveBeenCalled();
    });

    it('should create review', async () => {
      const fakeCacheData = { bookingId: 'booking-777' };
      mockCache.get.mockResolvedValue(fakeCacheData);

      await service.createReview(dto, userId);

      expect(mockCache.get).toHaveBeenCalledWith(userId);

      expect(mockRepo.save).toHaveBeenCalledWith({
        ...dto,
        bookingId: 'booking-777',
        userId: 'user-1',
        id: 'fake-uuid-123',
      });
    });
  });

  describe('changeReview', () => {
    const dto = { text: 'Good place!', rate: 4, id: '412412341312' };
    const userId = 'user-1';

    it('should change sucsesfully', async () => {
      await service.changeReview(dto, userId);
      expect(mockRepo.changeReveiew).toHaveBeenCalledWith(dto, userId);
      expect(mockRepo.changeReveiew).toHaveBeenCalledTimes(1);
    });

    it('should throw an error', async () => {});
  });

  describe('deleteReview', () => {
    it('should delete review', async () => {
      const reviewId = 'rev-123';
      const userId = 'user-99';

      await service.deleteReview(reviewId, userId);

      expect(mockRepo.deleteReview).toHaveBeenCalledWith(reviewId, userId);
    });
  });
});
