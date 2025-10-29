import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'react-toastify';
import { 
  CalendarIcon, 
  MapPinIcon, 
  UsersIcon,
  XCircleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const response = await api.get('/bookings/my-bookings');
      setBookings(response.data.bookings);
    } catch (error) {
      toast.error('Error cargando reservas');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm('¿Estás seguro de que quieres cancelar esta reserva?')) {
      return;
    }

    setCancellingId(bookingId);
    try {
      await api.post(`/bookings/${bookingId}/cancel`, {
        reason: 'Cancelado por el huésped'
      });
      toast.success('Reserva cancelada exitosamente');
      loadBookings();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error cancelando reserva');
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircleIcon className="h-5 w-5" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5" />;
      case 'cancelled':
        return <XCircleIcon className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmada';
      case 'pending':
        return 'Pendiente';
      case 'cancelled':
        return 'Cancelada';
      case 'completed':
        return 'Completada';
      default:
        return status;
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') {
      return ['confirmed', 'pending'].includes(booking.status) && 
             new Date(booking.checkIn) > new Date();
    }
    return booking.status === filter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mis Reservas</h1>
        <p className="mt-2 text-gray-600">Gestiona todas tus reservas en un solo lugar</p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todas ({bookings.length})
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'upcoming'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Próximas
          </button>
          <button
            onClick={() => setFilter('confirmed')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'confirmed'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Confirmadas
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'pending'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pendientes
          </button>
          <button
            onClick={() => setFilter('cancelled')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'cancelled'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Canceladas
          </button>
        </div>
      </div>

      {/* Lista de reservas */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <p className="text-gray-600">No tienes reservas {filter !== 'all' && getStatusText(filter).toLowerCase()}</p>
          <Link
            to="/search"
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Buscar propiedades
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {getStatusIcon(booking.status)}
                        <span className="ml-1">{getStatusText(booking.status)}</span>
                      </span>
                      <span className="ml-3 text-sm text-gray-500">
                        Reserva #{booking.id}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {booking.property.name}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                      <div className="flex items-center">
                        <MapPinIcon className="h-4 w-4 mr-2" />
                        {booking.property.address}
                      </div>
                      <div className="flex items-center">
                        <UsersIcon className="h-4 w-4 mr-2" />
                        {booking.numberOfGuests} {booking.numberOfGuests === 1 ? 'huésped' : 'huéspedes'}
                      </div>
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        {format(new Date(booking.checkIn), "dd MMM yyyy", { locale: es })} - 
                        {format(new Date(booking.checkOut), "dd MMM yyyy", { locale: es })}
                      </div>
                      <div className="font-semibold text-gray-900">
                        Total: ${booking.totalPrice} MXN
                      </div>
                    </div>

                    {booking.specialRequests && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Solicitudes especiales:</span> {booking.specialRequests}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="ml-4 flex flex-col space-y-2">
                    <Link
                      to={`/property/${booking.propertyId}`}
                      className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                    >
                      Ver propiedad
                    </Link>
                    
                    {booking.status === 'confirmed' && new Date(booking.checkIn) > new Date() && (
                      <button
                        onClick={() => handleCancel(booking.id)}
                        disabled={cancellingId === booking.id}
                        className="text-sm text-red-600 hover:text-red-500 font-medium disabled:opacity-50"
                      >
                        {cancellingId === booking.id ? 'Cancelando...' : 'Cancelar reserva'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Información del anfitrión */}
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-600">
                    Anfitrión: <span className="font-medium">{booking.property.host.name}</span>
                    {booking.property.host.phone && (
                      <span> • Tel: {booking.property.host.phone}</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;