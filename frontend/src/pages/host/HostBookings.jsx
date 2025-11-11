import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { format, isValid, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from 'react-toastify';
import {
  CalendarIcon, UserIcon, EnvelopeIcon, PhoneIcon, HomeIcon,
  CheckCircleIcon, XCircleIcon, ClockIcon, FunnelIcon, ArrowPathIcon
} from '@heroicons/react/24/outline';

// Config
const STATUS = {
  confirmed: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: CheckCircleIcon, label: 'Confirmada' },
  pending: { bg: 'bg-amber-50', text: 'text-amber-700', icon: ClockIcon, label: 'Pendiente' },
  cancelled: { bg: 'bg-red-50', text: 'text-red-700', icon: XCircleIcon, label: 'Cancelada' },
  in_progress: { bg: 'bg-blue-50', text: 'text-blue-700', icon: ClockIcon, label: 'En Progreso' },
  completed: { bg: 'bg-slate-50', text: 'text-slate-700', icon: CheckCircleIcon, label: 'Completada' }
};

const PAYMENT = {
  confirmed: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Confirmado' },
  pending: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Pendiente' },
  rejected: { bg: 'bg-red-50', text: 'text-red-700', label: 'Rechazado' }
};

// Utils
const fmtDate = (d, f = "dd MMM yyyy") => {
  if (!d) return 'N/A';
  const date = parseISO(d);
  return isValid(date) ? format(date, f, { locale: es }) : 'N/A';
};

const fmtMoney = (n) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n);

// Components
const Stat = ({ title, value, from, to }) => (
  <div className="bg-white dark:bg-neutral-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-neutral-700 hover:shadow-lg transition-all duration-300">
    <p className="text-xs font-medium text-slate-500 dark:text-neutral-400 uppercase tracking-wide">{title}</p>
    <p className={`mt-3 text-4xl font-bold bg-gradient-to-br ${from} ${to} bg-clip-text text-transparent`}>{value}</p>
  </div>
);

const Badge = ({ status, config }) => {
  const cfg = config[status] || {};
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text} border ${cfg.bg.replace('50', '200')}`}>
      {Icon && <Icon className="h-3.5 w-3.5" />}
      {cfg.label}
    </span>
  );
};

const Row = ({ b }) => (
  <tr className="hover:bg-slate-50/50 dark:hover:bg-neutral-700/50 transition-colors">
    <td className="px-4 py-4 text-sm font-bold text-slate-900 dark:text-neutral-100">#{b.id}</td>
    <td className="px-4 py-4">
      <div className="flex items-start gap-2">
        <div className="p-2 bg-slate-100 dark:bg-neutral-700 rounded-lg">
          <HomeIcon className="h-4 w-4 text-slate-600 dark:text-neutral-300" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900 dark:text-neutral-100 truncate">{b.property?.title}</p>
          <p className="text-xs text-slate-500 dark:text-neutral-400 truncate">{b.property?.location}</p>
        </div>
      </div>
    </td>
    <td className="px-4 py-4">
      <div className="space-y-1">
        <div className="flex items-center gap-1.5 text-sm font-medium text-slate-900 dark:text-neutral-100">
          <UserIcon className="h-3.5 w-3.5 text-slate-400 dark:text-neutral-400" />
          <span className="truncate">{b.guest?.full_name}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-neutral-400">
          <EnvelopeIcon className="h-3 w-3" />
          <span className="truncate">{b.guest?.email}</span>
        </div>
        {b.guest?.phone && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-neutral-400">
            <PhoneIcon className="h-3 w-3" />
            {b.guest.phone}
          </div>
        )}
      </div>
    </td>
    <td className="px-4 py-4">
      <div className="flex items-center gap-1.5 text-sm text-slate-900 dark:text-neutral-100 font-medium">
        <CalendarIcon className="h-4 w-4 text-slate-400 dark:text-neutral-400" />
        <span className="whitespace-nowrap">{fmtDate(b.checkIn, "dd MMM")} - {fmtDate(b.checkOut, "dd MMM yy")}</span>
      </div>
      <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1 pl-5">{b.numberOfGuests} {b.numberOfGuests === 1 ? "huésped" : "huéspedes"}</p>
    </td>
    <td className="px-4 py-4"><Badge status={b.booking_status} config={STATUS} /></td>
    <td className="px-4 py-4"><Badge status={b.payment_status} config={PAYMENT} /></td>
    <td className="px-4 py-4 text-sm font-bold text-slate-900 dark:text-neutral-100">{fmtMoney(b.total_price)}</td>
  </tr>
);

const Filters = ({ f, stats, onChange, onClear, onRefresh }) => (
  <div className="bg-gradient-to-br from-white to-slate-50 dark:from-neutral-800 dark:to-neutral-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-neutral-700">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
      {stats?.propertyStats?.length > 0 && (
        <select value={f.property_id} onChange={(e) => onChange('property_id', e.target.value)}
          className="px-3 py-2.5 border border-slate-300 dark:border-neutral-600 rounded-xl text-sm bg-white dark:bg-neutral-700 dark:text-neutral-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all">
          <option value="">📍 Todas</option>
          {stats.propertyStats.map(p => (
            <option key={p.property_id} value={p.property_id}>{p.title} ({p.total})</option>
          ))}
        </select>
      )}
      <select value={f.booking_status} onChange={(e) => onChange('booking_status', e.target.value)}
        className="px-3 py-2.5 border border-slate-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all">
        <option value="">📋 Estados</option>
        <option value="pending">Pendientes</option>
        <option value="confirmed">Confirmadas</option>
        <option value="in_progress">En Progreso</option>
        <option value="completed">Completadas</option>
        <option value="cancelled">Canceladas</option>
      </select>
      <select value={f.payment_status} onChange={(e) => onChange('payment_status', e.target.value)}
        className="px-3 py-2.5 border border-slate-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all">
        <option value="">💳 Pagos</option>
        <option value="pending">Pendientes</option>
        <option value="confirmed">Confirmados</option>
        <option value="rejected">Rechazados</option>
      </select>
      <select value={f.date_filter} onChange={(e) => onChange('date_filter', e.target.value)}
        className="px-3 py-2.5 border border-slate-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all">
        <option value="">📅 Fechas</option>
        <option value="upcoming">Próximas</option>
        <option value="current">Actuales</option>
        <option value="past">Pasadas</option>
      </select>
      <button onClick={onClear}
        className="px-4 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all duration-200">
        Limpiar
      </button>
      <button onClick={onRefresh}
        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
        style={{ backgroundColor: '#535911' }}
        onMouseEnter={(e) => e.target.style.backgroundColor = '#3d4109'}
        onMouseLeave={(e) => e.target.style.backgroundColor = '#535911'}>
        <ArrowPathIcon className="h-4 w-4" />
        Actualizar
      </button>
    </div>
  </div>
);

const HostBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ property_id: '', booking_status: '', payment_status: '', date_filter: '' });

  useEffect(() => { loadBookings(); }, [filters]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => v && params.append(k, v));
      const { data } = await api.get(`/bookings/host/bookings?${params}`);
      setBookings(data.bookings || []);
      setStats(data.stats || null);
    } catch (err) {
      console.error('Error:', err);
      toast.error('Error cargando reservas');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !stats) {
    return (
      <>
        <div className="flex items-center justify-center min-h-screen">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-emerald-600 absolute top-0"></div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-neutral-100 tracking-tight">Reservas Recibidas</h1>
            <p className="mt-2 text-slate-600 dark:text-neutral-400">Gestiona todas las reservas de tus propiedades</p>
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-neutral-200 bg-white dark:bg-neutral-800 border-2 border-slate-200 dark:border-neutral-600 rounded-xl hover:border-slate-300 dark:hover:border-neutral-500 hover:shadow-md transition-all duration-200">
            <FunnelIcon className="h-5 w-5" />
            {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            <Stat title="Total" value={stats.total || 0} from="from-blue-600" to="to-blue-500" />
            <Stat title="Pendientes" value={stats.pending || 0} from="from-amber-600" to="to-amber-500" />
            <Stat title="Confirmadas" value={stats.confirmed || 0} from="from-emerald-600" to="to-emerald-500" />
            <Stat title="En Progreso" value={stats.in_progress || 0} from="from-blue-600" to="to-cyan-500" />
            <Stat title="Completadas" value={stats.completed || 0} from="from-slate-600" to="to-slate-500" />
          </div>
        )}

        {/* Filters */}
        {showFilters && (
          <div className="mb-8">
            <Filters
              f={filters}
              stats={stats}
              onChange={(k, v) => setFilters(p => ({ ...p, [k]: v }))}
              onClear={() => setFilters({ property_id: '', booking_status: '', payment_status: '', date_filter: '' })}
              onRefresh={loadBookings}
            />
          </div>
        )}

        {/* Table / Cards */}
        {bookings.length === 0 ? (
          <div className="bg-gradient-to-br from-white to-slate-50 dark:from-neutral-800 dark:to-neutral-900 rounded-2xl p-16 text-center shadow-sm border border-slate-200 dark:border-neutral-700">
            <div className="inline-flex p-4 bg-slate-100 dark:bg-neutral-700 rounded-2xl mb-4">
              <CalendarIcon className="h-12 w-12 text-slate-400 dark:text-neutral-400" />
            </div>
            <p className="text-lg font-semibold text-slate-900 dark:text-neutral-100">No hay reservas</p>
            <p className="mt-2 text-slate-600 dark:text-neutral-400">Aquí aparecerán las reservas cuando lleguen</p>
          </div>
        ) : (
          <>
            {/* Vista Desktop - Tabla */}
            <div className="hidden lg:block bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-slate-200 dark:border-neutral-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-neutral-700">
                  <thead className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-neutral-700 dark:to-neutral-800">
                    <tr>
                      {['Reserva', 'Propiedad', 'Huésped', 'Fechas', 'Estado', 'Pago', 'Total'].map(h => (
                        <th key={h} className="px-4 py-4 text-left text-xs font-bold text-slate-600 dark:text-neutral-300 uppercase tracking-wider">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-neutral-700">
                    {bookings.map(b => <Row key={b.id} b={b} />)}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Vista Mobile - Cards */}
            <div className="lg:hidden space-y-4">
              {bookings.map(b => (
                <div key={b.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-sm font-bold text-slate-900">#{b.id}</span>
                    <Badge status={b.booking_status} config={STATUS} />
                  </div>
                  
                  <div className="flex items-start gap-3 mb-3 pb-3 border-b border-slate-100">
                    <div className="p-2 bg-slate-100 rounded-lg flex-shrink-0">
                      <HomeIcon className="h-5 w-5 text-slate-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-900">{b.property?.title}</p>
                      <p className="text-xs text-slate-500">{b.property?.location}</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2 text-sm">
                      <UserIcon className="h-4 w-4 text-slate-400 flex-shrink-0" />
                      <span className="text-slate-900 font-medium truncate">{b.guest?.full_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <EnvelopeIcon className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{b.guest?.email}</span>
                    </div>
                    {b.guest?.phone && (
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <PhoneIcon className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                        <span>{b.guest.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-900 mb-3">
                    <CalendarIcon className="h-4 w-4 text-slate-400 flex-shrink-0" />
                    <span className="font-medium">{fmtDate(b.checkIn, "dd MMM")} - {fmtDate(b.checkOut, "dd MMM yy")}</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-3">{b.numberOfGuests} {b.numberOfGuests === 1 ? "huésped" : "huéspedes"}</p>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <Badge status={b.payment_status} config={PAYMENT} />
                    <span className="text-lg font-bold text-slate-900">{fmtMoney(b.total_price)}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default HostBookings;