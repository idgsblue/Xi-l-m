import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import {
  MapPinIcon,
  UsersIcon,
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Estado de reserva
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [guests, setGuests] = useState(1);
  const [nights, setNights] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    loadProperty();
  }, [id]);

  useEffect(() => {
    calculatePrice();
  }, [checkIn, checkOut, property]);

  const loadProperty = async () => {
    try {
      const response = await api.get(`/properties/${id}`);
      setProperty(response.data.property);
    } catch (error) {
      toast.error('Error cargando propiedad');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const calculatePrice = () => {
    if (checkIn && checkOut && property) {
      const nightsCount = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      if (nightsCount > 0) {
        setNights(nightsCount);
        setTotalPrice(nightsCount * parseFloat(property.price_per_night));
      }
    }
  };

  const handleReserve = () => {
    if (!user) {
      navigate('/login', { state: { from: `/property/${id}` } });
      return;
    }

    if (!checkIn || !checkOut) {
      toast.error('Selecciona las fechas de tu estadía');
      return;
    }

    navigate(`/booking/${id}`, {
      state: {
        property,
        checkIn: checkIn.toISOString().split('T')[0],
        checkOut: checkOut.toISOString().split('T')[0],
        guests,
        totalPrice
      }
    });
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === property.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? property.images.length - 1 : prev - 1
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary-600"></div>
      </div>
    );
  }

  if (!property) return null;

  const images = property.images || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Título y ubicación */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-accent-900">{property.title}</h1>
        <div className="flex items-center mt-2 text-neutral-600">
          <MapPinIcon className="h-5 w-5 mr-1" />
          <span>{property.location}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna izquierda: Imágenes e información */}
        <div className="lg:col-span-2">
          {/* Carrusel de imágenes */}
          {images.length > 0 && (
            <div className="relative mb-6 rounded-lg overflow-hidden">
              <img
                src={images[currentImageIndex]?.image_url || '/placeholder.jpg'}
                alt={property.title}
                className="w-full h-96 object-cover"
              />
              
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full"
                  >
                    <ChevronLeftIcon className="h-6 w-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full"
                  >
                    <ChevronRightIcon className="h-6 w-6" />
                  </button>
                  
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                    {images.map((_, index) => (
                      <div
                        key={index}
                        className={`h-2 w-2 rounded-full ${
                          index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Información de la propiedad */}
          <div className="card mb-6">
            <h2 className="text-xl font-semibold mb-4">Descripción</h2>
            <p className="text-neutral-600 whitespace-pre-line">{property.description}</p>
          </div>

          <div className="card mb-6">
            <h2 className="text-xl font-semibold mb-4">Servicios</h2>
            <div className="grid grid-cols-2 gap-4">
              {property.services?.map(service => (
                <div key={service.id} className="flex items-center">
                  <span className="mr-2">{service.icon}</span>
                  <span>{service.name}</span>
                </div>
              )) || <p className="text-neutral-600">No hay servicios listados</p>}
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Información del anfitrión</h2>
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold mr-4">
                {property.host?.full_name?.charAt(0) || 'A'}
              </div>
              <div>
                <p className="font-medium">{property.host?.full_name || 'Anfitrión'}</p>
                <p className="text-sm text-neutral-600">{property.host?.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar de reserva (sticky) */}
        <div className="lg:col-span-1">
          <div className="card sticky top-4">
            <div className="flex items-baseline mb-4">
              <span className="text-2xl font-bold text-accent-900">
                ${property.price_per_night}
              </span>
              <span className="text-neutral-600 ml-2">/ noche</span>
            </div>

            <div className="space-y-4">
              {/* Fechas */}
              <div>
                <label className="block text-sm font-medium mb-2">Check-in</label>
                <DatePicker
                  selected={checkIn}
                  onChange={(date) => setCheckIn(date)}
                  selectsStart
                  startDate={checkIn}
                  endDate={checkOut}
                  minDate={new Date()}
                  className="input w-full"
                  placeholderText="Selecciona fecha"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Check-out</label>
                <DatePicker
                  selected={checkOut}
                  onChange={(date) => setCheckOut(date)}
                  selectsEnd
                  startDate={checkIn}
                  endDate={checkOut}
                  minDate={checkIn || new Date()}
                  className="input w-full"
                  placeholderText="Selecciona fecha"
                />
              </div>

              {/* Huéspedes */}
              <div>
                <label className="block text-sm font-medium mb-2">Huéspedes</label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(parseInt(e.target.value))}
                  className="input w-full"
                >
                  {[...Array(property.capacity)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1} {i === 0 ? 'huésped' : 'huéspedes'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cálculo */}
              {nights > 0 && (
                <div className="border-t pt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-neutral-600">
                      ${property.price_per_night} x {nights} {nights === 1 ? 'noche' : 'noches'}
                    </span>
                    <span className="font-medium">${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg border-t pt-2">
                    <span>Total</span>
                    <span className="text-secondary-600">${totalPrice.toFixed(2)} MXN</span>
                  </div>
                </div>
              )}

              <button
                onClick={handleReserve}
                disabled={!checkIn || !checkOut}
                className="btn-secondary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {user ? 'Reservar ahora' : 'Inicia sesión para reservar'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;