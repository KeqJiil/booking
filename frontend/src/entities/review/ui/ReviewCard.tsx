import type { IReview } from '../model/types';

interface ReviewCardProps {
  review: IReview;
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <div>
      <div>
        <span>{review.author?.username ?? 'User'}</span>
        <span>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
      </div>
      <p>{review.comment}</p>
      <p>
        {new Date(review.createdAt).toLocaleDateString('ru-RU')}
      </p>
    </div>
  );
}
