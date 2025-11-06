import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { format, isValid } from 'date-fns';
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
      setBookings(response.data.bookings || []);
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
        return 'badge-success';
      case 'pending':
        return 'badge-warning';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-neutral-100 text-neutral-800';
      default:
        return 'bg-neutral-100 text-neutral-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircleIcon className="h-5 w-5 icon-success" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5 icon-warning" />;
      case 'cancelled':
        return <XCircleIcon className="h-5 w-5 icon-error" />;
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

  // Función segura para formatear fechas
  const safeFormatDate = (dateStr) => {
    if (!dateStr) return 'Fecha no disponible';
    const date = new Date(dateStr);
    if (!isValid(date)) return 'Fecha inválida';
    return format(date, "dd MMM yyyy", { locale: es });
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') {
      const checkIn = new Date(booking.check_in_date);
      return (
        ['confirmed', 'pending'].includes(booking.booking_status) &&
        isValid(checkIn) &&
        checkIn > new Date()
      );
    }
    return booking.booking_status === filter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-accent-900">Mis Reservas</h1>
        <p className="mt-2 text-neutral-600">Gestiona todas tus reservas en un solo lugar</p>
      </div>

      {/* Filtros */}
      <div className="card mb-6">
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: `Todas (${bookings.length})` },
            { key: 'upcoming', label: 'Próximas' },
            { key: 'confirmed', label: 'Confirmadas' },
            { key: 'pending', label: 'Pendientes' },
            { key: 'cancelled', label: 'Canceladas' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === key
                  ? 'bg-secondary-600 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-primary-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de reservas */}
      {filteredBookings.length === 0 ? (
        <div className="card text-center">
          <p className="text-neutral-600">
            No tienes reservas {filter !== 'all' && getStatusText(filter).toLowerCase()}
          </p>
          <Link to="/search" className="btn-secondary mt-4 inline-flex items-center">
            Buscar propiedades
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <div key={booking.id} className="card overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.booking_status)}`}
                      >
                        {getStatusIcon(booking.booking_status)}
                        <span className="ml-1">{getStatusText(booking.booking_status)}</span>
                      </span>
                      <span className="ml-3 text-sm text-neutral-500">
                        Reserva #{booking.id}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-accent-900 mb-2">
                      {booking.property?.title || 'Propiedad sin nombre'}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-neutral-600">
                      <div className="flex items-center">
                        <MapPinIcon className="h-4 w-4 mr-2 icon-accent" />
                        {booking.property?.location || 'Ubicación no disponible'}
                      </div>
                      <div className="flex items-center">
                        <UsersIcon className="h-4 w-4 mr-2 icon-neutral" />
                        {booking.total_guests} {booking.total_guests === 1 ? 'huésped' : 'huéspedes'}
                      </div>
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-2 icon-neutral" />
                        {safeFormatDate(booking.check_in_date)} - {safeFormatDate(booking.check_out_date)}
                      </div>
                      <div className="font-semibold text-accent-900">
                        Total: ${parseFloat(booking.total_price).toFixed(2)} MXN
                      </div>
                    </div>

                    {/* Estado de pago */}
                    <div className="mt-3 flex items-center space-x-4 text-sm">
                      <span className="text-neutral-600">
                        Estado de pago: 
                        <span className={`ml-1 font-medium ${
                          booking.payment_status === 'confirmed' ? 'text-green-600' : 'text-yellow-600'
                        }`}>
                          {booking.payment_status === 'confirmed' ? 'Pagado' : 'Pendiente'}
                        </span>
                      </span>
                      {booking.transactions && booking.transactions.length > 0 && (
                        <span className="text-neutral-500">
                          • Comisión plataforma: ${parseFloat(booking.transactions[0].platform_commission).toFixed(2)} MXN
                        </span>
                      )}
                    </div>

                    {booking.cancellation_reason && (
                      <div className="mt-3 p-3 bg-red-50 rounded-md">
                        <p className="text-sm text-red-600">
                          <span className="font-medium">Motivo de cancelación:</span> {booking.cancellation_reason}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="ml-4 flex flex-col space-y-2">
                    <Link
                      to={`/property/${booking.property_id}`}
                      className="text-sm text-secondary-600 hover:text-secondary-500 font-medium"
                    >
                      Ver propiedad
                    </Link>

                    {booking.booking_status === 'confirmed' && 
                     isValid(new Date(booking.check_in_date)) && 
                     new Date(booking.check_in_date) > new Date() && (
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
                  <p className="text-sm text-neutral-600">
                    Anfitrión: <span className="font-medium">{booking.property?.host?.full_name || 'No disponible'}</span>
                    {booking.property?.host?.phone && (
                      <span> • Tel: {booking.property.host.phone}</span>
                    )}
                    {booking.property?.host?.email && (
                      <span> • Email: {booking.property.host.email}</span>
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