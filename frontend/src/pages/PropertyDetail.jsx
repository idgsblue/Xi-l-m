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
  const [bookedDates, setBookedDates] = useState([]);

  useEffect(() => {
    loadProperty();
    loadBookedDates();
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

  const loadBookedDates = async () => {
    try {
      const response = await api.get(`/bookings/property/${id}/booked-dates`);
      if (response.data.bookedDates) {
        // Convertir las fechas a objetos Date
        const dates = response.data.bookedDates.map(dateStr => new Date(dateStr));
        setBookedDates(dates);
      }
    } catch (error) {
      console.error('Error cargando fechas ocupadas:', error);
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

  // Función para deshabilitar fechas ocupadas en el DatePicker
  const isDateDisabled = (date) => {
    return bookedDates.some(bookedDate => 
      bookedDate.toDateString() === date.toDateString()
    );
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
    <div className="bg-white dark:bg-neutral-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Título y ubicación */}
        <div className="mb-6">
          <h1 className="heading-1 dark:text-neutral-100">{property.title}</h1>
          <div className="mt-2 flex items-center text-neutral-600 dark:text-neutral-400">
            <MapPinIcon className="h-5 w-5 mr-1 icon-accent" />
            <span>{property.location}</span>
          </div>
        </div>

        {/* Galería de imágenes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          <div className="relative">
            {property.images && property.images.length > 0 ? (
              <img
                src={property.images[imageIndex]?.image_url || property.images[imageIndex]}
                alt={property.title}
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
          <div className="bg-primary-50 dark:bg-neutral-800 rounded-lg p-6 border border-neutral-200 dark:border-neutral-700">
            <div className="mb-4">
              <span className="text-3xl font-bold text-accent-900 dark:text-accent-200">
                ${parseFloat(property.price_per_night).toFixed(2)}
              </span>
              <span className="text-neutral-600 dark:text-neutral-400"> MXN / noche</span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label">
                  Check-in
                </label>
                <DatePicker
                  selected={checkIn}
                  onChange={setCheckIn}
                  selectsStart
                  startDate={checkIn}
                  endDate={checkOut}
                  minDate={new Date()}
                  excludeDates={bookedDates}
                  filterDate={(date) => !isDateDisabled(date)}
                  placeholderText="Selecciona fecha"
                  className="input w-full"
                  dateFormat="dd/MM/yyyy"
                />
              </div>

              <div>
                <label className="label">
                  Check-out
                </label>
                <DatePicker
                  selected={checkOut}
                  onChange={setCheckOut}
                  selectsEnd
                  startDate={checkIn}
                  endDate={checkOut}
                  minDate={checkIn || new Date()}
                  excludeDates={bookedDates}
                  filterDate={(date) => !isDateDisabled(date)}
                  placeholderText="Selecciona fecha"
                  className="input w-full"
                  dateFormat="dd/MM/yyyy"
                />
              </div>

              <div>
                <label className="label">
                  Huéspedes
                </label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className="input w-full"
                >
                  {[...Array(property.capacity)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1} {i === 0 ? 'huésped' : 'huéspedes'}
                    </option>
                  ))}
                </select>
              </div>

              {availability && (
                <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
                  <div className="flex justify-between text-sm text-neutral-700 dark:text-neutral-300">
                    <span>
                      ${parseFloat(property.price_per_night).toFixed(2)} x {availability.nights} noches
                    </span>
                    <span>${availability.totalPrice}</span>
                  </div>
                  <div className="mt-2 flex justify-between font-semibold text-neutral-900 dark:text-neutral-100">
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
            <div className="border-b border-neutral-200 dark:border-neutral-700 pb-6 mb-6">
              <h2 className="heading-2 mb-4 dark:text-neutral-100">
                Acerca de este lugar
              </h2>
              <p className="text-neutral-600 dark:text-neutral-300">{property.description}</p>
            </div>

            <div className="border-b border-neutral-200 dark:border-neutral-700 pb-6 mb-6">
              <h2 className="heading-2 mb-4 dark:text-neutral-100">
                Tipo de alojamiento
              </h2>
              <div className="flex items-center text-neutral-900 dark:text-neutral-100">
                <HomeIcon className="h-5 w-5 mr-3 icon-neutral" />
                <span>{property.accommodationType?.name}</span>
              </div>
            </div>

            <div className="border-b border-neutral-200 dark:border-neutral-700 pb-6 mb-6">
              <h2 className="heading-2 mb-4 dark:text-neutral-100">
                Capacidad
              </h2>
              <div className="flex items-center text-neutral-900 dark:text-neutral-100">
                <UsersIcon className="h-5 w-5 mr-3 icon-neutral" />
                <span>Hasta {property.capacity} huéspedes</span>
              </div>
            </div>

            {property.services && property.services.length > 0 && (
              <div className="border-b border-neutral-200 dark:border-neutral-700 pb-6 mb-6">
                <h2 className="heading-2 mb-4 dark:text-neutral-100">
                  Servicios
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {property.services.map((service) => (
                    <div key={service.id} className="flex items-center">
                      <SparklesIcon className="h-5 w-5 mr-2 icon-accent" />
                      <div>
                        <p className="font-medium text-neutral-900 dark:text-neutral-100">{service.name}</p>
                        {service.description && (
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">{service.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="card mb-6">
              <h3 className="heading-2 mb-4 dark:text-neutral-100">
                Anfitrión
              </h3>
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-primary-300 dark:bg-primary-700 flex items-center justify-center">
                  <span className="text-xl font-semibold text-neutral-600 dark:text-neutral-300">
                    {property.host?.full_name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="ml-4">
                  <p className="font-medium text-accent-900 dark:text-accent-200">{property.host?.full_name}</p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Anfitrión verificado</p>
                </div>
              </div>
            </div>

            <div className="bg-secondary-50 dark:bg-neutral-800 rounded-lg p-6 border border-neutral-200 dark:border-neutral-700">
              <h3 className="heading-2 mb-2 dark:text-neutral-100">
                Política de cancelación
              </h3>
              <ul className="text-sm text-neutral-600 dark:text-neutral-300 space-y-1">
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