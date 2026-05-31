export interface IReview {
  id: string;
  propertyId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
  author?: {
    username: string;
    avatarUrl: string | null;
  };
}

export interface IReviewSearchParams {
  page?: number;
  limit?: number;
}

export interface ICreateReviewData {
  propertyId: string;
  rate: number;
  text: string;
}

export interface IUpdateReviewData {
  propertyId: string;
  rate?: number;
  text?: string;
}
