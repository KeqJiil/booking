import { api } from '@/shared/api/axios.interceptors';
import type { IReview, IReviewSearchParams } from '../model/types';

// GET /review — get current user's reviews (role: USER)
export const getMyReviews = async (params?: IReviewSearchParams): Promise<IReview[]> => {
  const { data } = await api.get('/review', { params });
  return data;
};

// GET /review/:id — get reviews by property ID (public)
export const getPropertyReviews = async (propertyId: string): Promise<IReview[]> => {
  const { data } = await api.get(`/review/${propertyId}`);
  return data;
};
