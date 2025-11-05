import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'react-toastify';
import {
  CalendarIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  HomeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  FunnelIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const HostBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    property_id: '',
    booking_status: '',
    payment_status: '',
    date_filter: ''
  });

  useEffect(() => {
    loadBookings();
  }, [filters]);

  const loadBookings = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
      });

      const { data } = await api.get(`/bookings/host/bookings?${params}`);

      setBookings(data.bookings || []);
      setStats(data.stats || null);
    } catch (error) {
      console.error('Error cargando reservas:', error);
      toast.error('Error cargando reservas');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      property_id: '',
      booking_status: '',
      payment_status: '',
      date_filter: ''
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'badge-success';
      case 'pending':
        return 'badge-warning';
      case 'cancelled':
        return 'badge-error';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
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
      case 'in_progress':
        return 'En Progreso';
      case 'completed':
        return 'Completada';
      default:
        return status;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-accent-900">Reservas Recibidas</h1>
          <p className="mt-2 text-neutral-600">Gestiona las reservas de tus propiedades</p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
        >
          <FunnelIcon className="h-5 w-5 mr-2" />
          {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
        </button>
      </div>

      {/* Estadísticas Globales */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <StatCard title="Total" value={stats.total || 0} color="blue" />
          <StatCard title="Pendientes" value={stats.pending || 0} color="yellow" />
          <StatCard title="Confirmadas" value={stats.confirmed || 0} color="green" />
          <StatCard title="En Progreso" value={stats.in_progress || 0} color="blue" />
          <StatCard title="Completadas" value={stats.completed || 0} color="gray" />
        </div>
      )}

      {/* Filtros */}
      {showFilters && (
        <div className="card mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* Filtro por Propiedad */}
            {stats?.propertyStats && stats.propertyStats.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Propiedad
                </label>
                <select
                  value={filters.property_id}
                  onChange={(e) => handleFilterChange('property_id', e.target.value)}
                  className="input w-full"
                >
                  <option value="">Todas las propiedades</option>
                  {stats.propertyStats.map(prop => (
                    <option key={prop.property_id} value={prop.property_id}>
                      {prop.title} ({prop.total} reservas)
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Estado de Reserva */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Estado de Reserva
              </label>
              <select
                value={filters.booking_status}
                onChange={(e) => handleFilterChange('booking_status', e.target.value)}
                className="input w-full"
              >
                <option value="">Todos los estados</option>
                <option value="pending">Pendientes</option>
                <option value="confirmed">Confirmadas</option>
                <option value="in_progress">En Progreso</option>
                <option value="completed">Completadas</option>
                <option value="cancelled">Canceladas</option>
              </select>
            </div>

            {/* Estado de Pago */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Estado de Pago
              </label>
              <select
                value={filters.payment_status}
                onChange={(e) => handleFilterChange('payment_status', e.target.value)}
                className="input w-full"
              >
                <option value="">Todos los pagos</option>
                <option value="pending">Pendientes</option>
                <option value="confirmed">Confirmados</option>
                <option value="rejected">Rechazados</option>
              </select>
            </div>

            {/* Filtro por Fecha */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Periodo
              </label>
              <select
                value={filters.date_filter}
                onChange={(e) => handleFilterChange('date_filter', e.target.value)}
                className="input w-full"
              >
                <option value="">Todas las fechas</option>
                <option value="upcoming">Próximas</option>
                <option value="current">Actuales</option>
                <option value="past">Pasadas</option>
              </select>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex gap-2 justify-end">
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Limpiar Filtros
            </button>
            <button
              onClick={loadBookings}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowPathIcon className="h-5 w-5 mr-2" />
              Actualizar
            </button>
          </div>
        </div>
      )}

      {/* Stats por Propiedad */}
      {stats?.propertyStats && stats.propertyStats.length > 0 && !filters.property_id && (
        <div className="card mb-6">
          <h2 className="text-lg font-semibold mb-4 text-accent-900">Reservas por Propiedad</h2>
          <div className="space-y-2">
            {stats.propertyStats.map(prop => (
              <div
                key={prop.property_id}
                className="flex justify-between items-center p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
                onClick={() => handleFilterChange('property_id', prop.property_id.toString())}
              >
                <div>
                  <p className="font-medium text-accent-900">{prop.title}</p>
                  <p className="text-sm text-neutral-600">{prop.location}</p>
                </div>
                <div className="flex gap-4 text-sm">
                  <span className="text-yellow-600 font-medium">Pendientes: {prop.pending}</span>
                  <span className="text-green-600 font-medium">Confirmadas: {prop.confirmed}</span>
                  <span className="text-neutral-600 font-medium">Total: {prop.total}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista de reservas */}
      {bookings.length === 0 ? (
        <div className="card text-center">
          <CalendarIcon className="mx-auto h-12 w-12 icon-muted" />
          <p className="mt-2 text-neutral-600">No hay reservas que mostrar</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <table className="min-w-full divide-y divide-primary-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Reserva
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Propiedad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Huésped
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Fechas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Pago
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-primary-200">
              {bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-accent-900">
                    #{booking.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <HomeIcon className="h-5 w-5 icon-muted mr-2" />
                      <div>
                        <div className="text-sm font-medium text-accent-900">
                          {booking.property?.title}
                        </div>
                        <div className="text-sm text-neutral-500">
                          {booking.property?.location}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="flex items-center text-sm font-medium text-accent-900">
                        <UserIcon className="h-4 w-4 icon-muted mr-1" />
                        {booking.guest?.full_name}
                      </div>
                      <div className="flex items-center text-sm text-neutral-500">
                        <EnvelopeIcon className="h-4 w-4 icon-muted mr-1" />
                        {booking.guest?.email}
                      </div>
                      {booking.guest?.phone && (
                        <div className="flex items-center text-sm text-neutral-500">
                          <PhoneIcon className="h-4 w-4 icon-muted mr-1" />
                          {booking.guest.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-accent-900">
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 icon-muted mr-1" />
                        {format(new Date(booking.check_in_date), "dd MMM", { locale: es })} -
                        {format(new Date(booking.check_out_date), "dd MMM yyyy", { locale: es })}
                      </div>
                      <div className="text-neutral-500">
                        {booking.number_of_guests} {booking.number_of_guests === 1 ? 'huésped' : 'huéspedes'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.booking_status)}`}>
                      {getStatusIcon(booking.booking_status)}
                      <span className="ml-1">{getStatusText(booking.booking_status)}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      booking.payment_status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      booking.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {booking.payment_status === 'confirmed' ? 'Confirmado' :
                       booking.payment_status === 'pending' ? 'Pendiente' : 'Rechazado'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-accent-900">
                    {formatCurrency(booking.total_price)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, color = 'blue' }) => {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    yellow: 'from-yellow-500 to-yellow-600',
    gray: 'from-gray-500 to-gray-600',
    red: 'from-red-500 to-red-600'
  };

  return (
    <div className="card">
      <div className="text-sm font-medium text-neutral-500">{title}</div>
      <div className={`mt-2 text-3xl font-bold bg-gradient-to-r ${colors[color]} bg-clip-text text-transparent`}>
        {value}
      </div>
    </div>
  );
};

export default HostBookings;
