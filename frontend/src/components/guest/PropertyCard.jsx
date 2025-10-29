import React from 'react';
import { Link } from 'react-router-dom';
import { MapPinIcon, UsersIcon, StarIcon } from '@heroicons/react/24/outline';

const PropertyCard = ({ property }) => {
  const imageUrl = property.images && property.images.length > 0
    ? `${process.env.REACT_APP_API_URL?.replace('/api', '')}${property.images[0]}`
    : '/placeholder-property.jpg';

  return (
    <Link 
      to={`/property/${property.id}`}
      className="group block bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow duration-200"
    >
      <div className="relative">
        <img
          src={imageUrl}
          alt={property.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
          onError={(e) => {
            e.target.src = '/placeholder-property.jpg';
          }}
        />
        {property.status === 'pending' && (
          <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-semibold">
            Pendiente
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
          {property.name}
        </h3>
        
        <div className="mt-1 flex items-center text-sm text-gray-600">
          <MapPinIcon className="h-4 w-4 mr-1" />
          <span className="truncate">{property.zone}</span>
        </div>
        
        <p className="mt-2 text-sm text-gray-600 line-clamp-2">
          {property.shortDescription || property.description}
        </p>
        
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-600">
            <UsersIcon className="h-4 w-4 mr-1" />
            <span>{property.maxGuests} huéspedes</span>
          </div>
          
          <div className="text-right">
            <span className="text-lg font-bold text-gray-900">
              ${property.pricePerNight}
            </span>
            <span className="text-sm text-gray-600"> /noche</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;