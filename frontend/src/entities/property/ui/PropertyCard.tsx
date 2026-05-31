import type { IProperty } from '../model/types';

interface PropertyCardProps {
  property: IProperty;
  onClick?: () => void;
}

export function PropertyCard({ property, onClick }: PropertyCardProps) {
  return (
    <div
      onClick={onClick}
    >
      {property.images[0] && (
        <img
          src={property.images[0]}
          alt={property.title}
        />
      )}
      <div>
        <p>{property.title}</p>
        <p>{property.city}, {property.country}</p>
        <p>
          <strong>${property.pricePerNight}</strong> / night
        </p>
        {property.rating > 0 && (
          <p>★ {property.rating.toFixed(1)} ({property.reviewCount})</p>
        )}
      </div>
    </div>
  );
}
