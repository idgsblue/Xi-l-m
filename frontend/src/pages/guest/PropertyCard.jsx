import React from 'react';
import { Link } from 'react-router-dom';
import { MapPinIcon, UsersIcon, StarIcon } from '@heroicons/react/24/outline';

const PropertyCard = ({ property }) => {
const imageUrl = property.images && property.images.length > 0
    ? (property.images[0]?.image_url || property.images[0])
    : '/placeholder-property.jpg';

  return (
    <Link
      to={`/property/${property.id}`}
      className="card group block overflow-hidden hover:shadow-lg transition-shadow duration-200"
    >
      <div className="relative">
        <img
          src={imageUrl}
          alt={property.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
          onError={(e) => {
            e.target.src = '/placeholder-property.jpg';
          }}
        />
        {property.status === 'pending' && (
          <div className="absolute top-2 right-2 badge-warning">
            Pendiente
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-accent-900 dark:text-accent-200 group-hover:text-secondary-600 dark:group-hover:text-secondary-400 transition-colors">
          {property.title}
        </h3>

        <div className="mt-1 flex items-center text-sm text-neutral-600 dark:text-neutral-400">
          <MapPinIcon className="h-4 w-4 mr-1 icon-accent" />
          <span className="truncate">{property.location}</span>
        </div>

        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">
          {property.shortDescription || property.description}
        </p>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-400">
            <UsersIcon className="h-4 w-4 mr-1 icon-neutral" />
            <span>{property.capacity} huéspedes</span>
          </div>

          <div className="text-right">
            <span className="text-lg font-bold text-accent-900 dark:text-accent-200">
            ${parseFloat(property.price_per_night).toFixed(2)}
            </span>
            <span className="text-sm text-neutral-600 dark:text-neutral-400"> /noche</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;