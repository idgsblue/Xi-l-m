import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import DatePicker from 'react-datepicker';
import { toast } from 'react-toastify';
import {
  MapPinIcon,
  UsersIcon,
  HomeIcon,
  SparklesIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [guests, setGuests] = useState(1);
  const [availability, setAvailability] = useState(null);
  const [imageIndex, setImageIndex] = useState(0);

  useEffect(() => {
    loadProperty();
  }, [id]);

  useEffect(() => {
    if (checkIn && checkOut) {
      checkAvailability();
    }
  }, [checkIn, checkOut]);

  const loadProperty = async () => {
    try {
      const response = await api.get(`/properties/${id}`);
      setProperty(response.data.property);
    } catch (error) {
      toast.error('Error cargando la propiedad');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const checkAvailability = async () => {
    try {
      const params = new URLSearchParams({
        propertyId: id,
        checkIn: checkIn.toISOString().split('T')[0],
        checkOut: checkOut.toISOString().split('T')[0]
      });
      
      const response = await api.get(`/bookings/check-availability?${params}`);
      setAvailability(response.data);
    } catch (error) {
      console.error('Error verificando disponibilidad:', error);
    }
  };

  const handleBooking = () => {
    if (!user) {
      toast.info('Debes iniciar sesión para reservar');
      navigate('/login');
      return;
    }

    if (!checkIn || !checkOut) {
      toast.error('Selecciona las fechas de tu estadía');
      return;
    }

    navigate(`/guest/booking/${id}`, {
      state: {
        property,
        checkIn: checkIn.toISOString().split('T')[0],
        checkOut: checkOut.toISOString().split('T')[0],
        guests,
        totalPrice: availability?.totalPrice
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary-600"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-neutral-600">Propiedad no encontrada</p>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Título y ubicación */}
        <div className="mb-6">
          <h1 className="heading-1">{property.name}</h1>
          <div className="mt-2 flex items-center text-neutral-600">
            <MapPinIcon className="h-5 w-5 mr-1 icon-accent" />
            <span>{property.address}, {property.zone}</span>
          </div>
        </div>

        {/* Galería de imágenes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          <div className="relative">
            {property.images && property.images.length > 0 ? (
              <img
                src={property.images[imageIndex]?.image_url || property.images[imageIndex]}

                alt={property.name}
                className="w-full h-96 object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-96 bg-primary-200 rounded-lg flex items-center justify-center">
                <HomeIcon className="h-20 w-20 icon-muted" />
              </div>
            )}
            {property.images && property.images.length > 1 && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                {property.images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setImageIndex(idx)}
                    className={`h-2 w-2 rounded-full ${
                      idx === imageIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Panel de reserva */}
          <div className="bg-primary-50 rounded-lg p-6">
            <div className="mb-4">
              <span className="text-3xl font-bold text-accent-900">
                ${property.pricePerNight}
              </span>
              <span className="text-neutral-600"> MXN / noche</span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Check-in
                </label>
                <DatePicker
                  selected={checkIn}
                  onChange={setCheckIn}
                  selectsStart
                  startDate={checkIn}
                  endDate={checkOut}
                  minDate={new Date()}
                  placeholderText="Selecciona fecha"
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Check-out
                </label>
                <DatePicker
                  selected={checkOut}
                  onChange={setCheckOut}
                  selectsEnd
                  startDate={checkIn}
                  endDate={checkOut}
                  minDate={checkIn || new Date()}
                  placeholderText="Selecciona fecha"
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Huéspedes
                </label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className="input w-full"
                >
                  {[...Array(property.maxGuests)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1} {i === 0 ? 'huésped' : 'huéspedes'}
                    </option>
                  ))}
                </select>
              </div>

              {availability && (
                <div className="border-t pt-4">
                  <div className="flex justify-between text-sm">
                    <span>
                      ${property.pricePerNight} x {availability.nights} noches
                    </span>
                    <span>${availability.totalPrice}</span>
                  </div>
                  <div className="mt-2 flex justify-between font-semibold">
                    <span>Total</span>
                    <span>${availability.totalPrice} MXN</span>
                  </div>
                </div>
              )}

              <button
                onClick={handleBooking}
                disabled={!availability?.available}
                className={`w-full px-4 py-3 text-base font-semibold ${
                  availability?.available
                    ? 'btn-primary'
                    : 'bg-neutral-400 text-white cursor-not-allowed rounded-md shadow-sm'
                }`}
              >
                {availability?.available ? 'Reservar' : 'No disponible'}
              </button>

              {availability && !availability.available && (
                <p className="text-sm text-red-600 text-center">
                  La propiedad no está disponible en estas fechas
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Información de la propiedad */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="border-b pb-6 mb-6">
              <h2 className="heading-2 mb-4">
                Acerca de este lugar
              </h2>
              <p className="text-neutral-600">{property.description}</p>
            </div>

            <div className="border-b pb-6 mb-6">
              <h2 className="heading-2 mb-4">
                Características
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <UsersIcon className="h-5 w-5 mr-3 icon-neutral" />
                  <span>Hasta {property.maxGuests} huéspedes</span>
                </div>
                <div className="flex items-center">
                  <HomeIcon className="h-5 w-5 mr-3 icon-neutral" />
                  <span>{property.bedrooms} habitaciones</span>
                </div>
                <div className="flex items-center">
                  <SparklesIcon className="h-5 w-5 mr-3 icon-neutral" />
                  <span>{property.bathrooms} baños</span>
                </div>
              </div>
            </div>

            {property.amenities && property.amenities.length > 0 && (
              <div className="border-b pb-6 mb-6">
                <h2 className="heading-2 mb-4">
                  Amenidades
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {property.amenities.map((amenity, idx) => (
                    <div key={idx} className="flex items-center">
                      <span className="text-neutral-600">• {amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="card mb-6">
              <h3 className="heading-2 mb-4">
                Anfitrión
              </h3>
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-primary-300 flex items-center justify-center">
                  <span className="text-xl font-semibold text-neutral-600">
                    {property.host?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="ml-4">
                  <p className="font-medium text-accent-900">{property.host?.name}</p>
                  <p className="text-sm text-neutral-600">Anfitrión verificado</p>
                </div>
              </div>
            </div>

            <div className="bg-secondary-50 rounded-lg p-6">
              <h3 className="heading-2 mb-2">
                Política de cancelación
              </h3>
              <ul className="text-sm text-neutral-600 space-y-1">
                <li>• Cancelación gratuita hasta 7 días antes</li>
                <li>• 50% de reembolso hasta 3 días antes</li>
                <li>• Sin reembolso con menos de 3 días</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;