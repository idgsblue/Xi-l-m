import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { format, isValid, parseISO } from "date-fns";

import { es } from "date-fns/locale";

import { toast } from 'react-toastify';
import {
  CalendarIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  HomeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const formatDateSafe = (dateStr, fmt = "dd MMM yyyy") => {
  if (!dateStr) return null;
  const date = parseISO(dateStr);
  return isValid(date) ? format(date, fmt, { locale: es }) : null;
};

const HostBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedProperty, setSelectedProperty] = useState('all');
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [bookingsRes, propertiesRes] = await Promise.all([
        api.get('/bookings/host/bookings'),
        api.get('/properties/host/my-properties')
      ]);
      
      setBookings(bookingsRes.data.bookings);
      setProperties(propertiesRes.data.properties.filter(p => p.status === 'approved'));
    } catch (error) {
      toast.error('Error cargando reservas');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'badge-success';
      case 'pending':
        return 'badge-warning';
      case 'cancelled':
        return 'badge-error';
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

  const filteredBookings = bookings.filter(booking => {
    if (filter !== 'all' && booking.status !== filter) return false;
    if (selectedProperty !== 'all' && booking.propertyId !== parseInt(selectedProperty)) return false;
    return true;
  });

  const upcomingBookings = bookings.filter(
    b => b.status === 'confirmed' && new Date(b.checkIn) > new Date()
  );

  const totalRevenue = bookings
    .filter(b => b.status === 'confirmed' || b.status === 'completed')
    .reduce((sum, b) => sum + parseFloat(b.totalPrice), 0);

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
        <h1 className="text-3xl font-bold text-accent-900">Reservas Recibidas</h1>
        <p className="mt-2 text-neutral-600">Gestiona las reservas de tus propiedades</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card">
          <div className="text-sm font-medium text-neutral-500">Total Reservas</div>
          <div className="mt-2 text-3xl font-bold text-accent-900">{bookings.length}</div>
        </div>
        <div className="card">
          <div className="text-sm font-medium text-neutral-500">Próximas</div>
          <div className="mt-2 text-3xl font-bold text-secondary-600">{upcomingBookings.length}</div>
        </div>
        <div className="card">
          <div className="text-sm font-medium text-neutral-500">Confirmadas</div>
          <div className="mt-2 text-3xl font-bold text-success-600">
            {bookings.filter(b => b.status === 'confirmed').length}
          </div>
        </div>
        <div className="card">
          <div className="text-sm font-medium text-neutral-500">Ingresos Totales</div>
          <div className="mt-2 text-3xl font-bold text-accent-900">${totalRevenue.toFixed(2)}</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="card mb-6">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Propiedad
            </label>
            <select
              value={selectedProperty}
              onChange={(e) => setSelectedProperty(e.target.value)}
              className="input"
            >
              <option value="all">Todas las propiedades</option>
              {properties.map(property => (
                <option key={property.id} value={property.id}>
                  {property.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Estado
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  filter === 'all'
                    ? 'btn-primary'
                    : 'btn-neutral'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setFilter('confirmed')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  filter === 'confirmed'
                    ? 'btn-primary'
                    : 'btn-neutral'
                }`}
              >
                Confirmadas
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  filter === 'pending'
                    ? 'btn-primary'
                    : 'btn-neutral'
                }`}
              >
                Pendientes
              </button>
              <button
                onClick={() => setFilter('cancelled')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  filter === 'cancelled'
                    ? 'btn-primary'
                    : 'btn-neutral'
                }`}
              >
                Canceladas
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de reservas */}
      {filteredBookings.length === 0 ? (
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
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-primary-200">
              {filteredBookings.map((booking) => (
                <tr key={booking.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-accent-900">
                    #{booking.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <HomeIcon className="h-5 w-5 icon-muted mr-2" />
                      <div>
                        <div className="text-sm font-medium text-accent-900">
                          {booking.property.name}
                        </div>
                        <div className="text-sm text-neutral-500">
                          {booking.property.zone}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="flex items-center text-sm font-medium text-accent-900">
                        <UserIcon className="h-4 w-4 icon-muted mr-1" />
                        {booking.guest.name}
                      </div>
                      <div className="flex items-center text-sm text-neutral-500">
                        <EnvelopeIcon className="h-4 w-4 icon-muted mr-1" />
                        {booking.guest.email}
                      </div>
                      {booking.guest.phone && (
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
      {formatDateSafe(booking.checkIn, "dd MMM") && formatDateSafe(booking.checkOut, "dd MMM yyyy") ? (
        <>
          {formatDateSafe(booking.checkIn, "dd MMM")} - {formatDateSafe(booking.checkOut, "dd MMM yyyy")}
        </>
      ) : (
        "Fechas no disponibles"
      )}
    </div>
    <div className="text-neutral-500">
      {booking.numberOfGuests} {booking.numberOfGuests === 1 ? "huésped" : "huéspedes"}
    </div>
  </div>
</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                      {getStatusIcon(booking.status)}
                      <span className="ml-1">{getStatusText(booking.status)}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-accent-900">
                    ${booking.totalPrice}
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

export default HostBookings;