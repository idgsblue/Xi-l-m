import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
  XMarkIcon,
  CheckIcon,
  LockClosedIcon,
  ArrowLeftIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isToday, isBefore, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';

const AvailabilityCalendar = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [property, setProperty] = useState(null);
  const [calendar, setCalendar] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Estados para selección
  const [selectedDates, setSelectedDates] = useState([]);
  const [selectionMode, setSelectionMode] = useState(null); // 'block' | 'unblock'
  const [showRangeSelector, setShowRangeSelector] = useState(false);
  const [rangeStart, setRangeStart] = useState('');
  const [rangeEnd, setRangeEnd] = useState('');

  useEffect(() => {
    loadProperty();
  }, [id]);

  useEffect(() => {
    if (property) {
      loadCalendar();
    }
  }, [currentMonth, property]);

  const loadProperty = async () => {
    try {
      const response = await api.get(`/properties/${id}`);
      setProperty(response.data.property);
    } catch (error) {
      toast.error('Error cargando propiedad');
      navigate('/host/properties');
    }
  };

  const loadCalendar = async () => {
    setLoading(true);
    try {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;

      const response = await api.get(`/availability/${id}/${year}/${month}`);
      
      setCalendar(response.data.calendar || []);
      setStats(response.data.stats || null);
    } catch (error) {
      console.error('Error loading calendar:', error);
      toast.error('Error cargando calendario');
    } finally {
      setLoading(false);
    }
  };

  const handleDateClick = (day) => {
    // No permitir seleccionar fechas pasadas
    if (day.status === 'past') {
      toast.warning('No puedes modificar fechas pasadas');
      return;
    }

    // No permitir modificar fechas con reservas
    if (day.status === 'booked') {
      toast.info('Esta fecha tiene una reserva activa');
      return;
    }

    const dateString = day.date;
    const isSelected = selectedDates.includes(dateString);

    if (isSelected) {
      setSelectedDates(selectedDates.filter(d => d !== dateString));
    } else {
      setSelectedDates([...selectedDates, dateString]);
    }
  };

  const handleBlockSelected = async () => {
    if (selectedDates.length === 0) {
      toast.warning('Selecciona al menos una fecha');
      return;
    }

    setSaving(true);
    try {
      await api.post(`/availability/${id}`, {
        dates: selectedDates,
        isAvailable: false
      });

      toast.success(`${selectedDates.length} fecha(s) bloqueada(s) exitosamente`);
      setSelectedDates([]);
      loadCalendar();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error bloqueando fechas');
    } finally {
      setSaving(false);
    }
  };

  const handleUnblockSelected = async () => {
    if (selectedDates.length === 0) {
      toast.warning('Selecciona al menos una fecha');
      return;
    }

    setSaving(true);
    try {
      await api.post(`/availability/${id}`, {
        dates: selectedDates,
        isAvailable: true
      });

      toast.success(`${selectedDates.length} fecha(s) desbloqueada(s) exitosamente`);
      setSelectedDates([]);
      loadCalendar();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error desbloqueando fechas');
    } finally {
      setSaving(false);
    }
  };

  const handleBlockRange = async () => {
    if (!rangeStart || !rangeEnd) {
      toast.warning('Selecciona fechas de inicio y fin');
      return;
    }

    if (new Date(rangeEnd) <= new Date(rangeStart)) {
      toast.error('La fecha de fin debe ser posterior a la de inicio');
      return;
    }

    setSaving(true);
    try {
      await api.post(`/availability/${id}/block-range`, {
        startDate: rangeStart,
        endDate: rangeEnd
      });

      toast.success('Rango bloqueado exitosamente');
      setShowRangeSelector(false);
      setRangeStart('');
      setRangeEnd('');
      loadCalendar();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error bloqueando rango');
    } finally {
      setSaving(false);
    }
  };

  const getDayClassName = (day) => {
    const isSelected = selectedDates.includes(day.date);
    const baseClasses = 'relative h-20 border border-gray-200 p-2 cursor-pointer transition-all hover:shadow-md';

    if (day.status === 'past') {
      return `${baseClasses} bg-gray-100 text-gray-400 cursor-not-allowed opacity-50`;
    }

    if (day.status === 'booked') {
      return `${baseClasses} bg-red-100 border-red-300 cursor-not-allowed`;
    }

    if (day.status === 'blocked') {
      return `${baseClasses} bg-orange-100 border-orange-300 ${isSelected ? 'ring-2 ring-orange-500' : ''}`;
    }

    if (isSelected) {
      return `${baseClasses} bg-blue-100 border-blue-400 ring-2 ring-blue-500`;
    }

    return `${baseClasses} bg-white hover:bg-gray-50`;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'available':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
            <CheckIcon className="h-3 w-3 mr-1" />
            Disponible
          </span>
        );
      case 'blocked':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
            <LockClosedIcon className="h-3 w-3 mr-1" />
            Bloqueada
          </span>
        );
      case 'booked':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
            <CalendarIcon className="h-3 w-3 mr-1" />
            Reservada
          </span>
        );
      case 'past':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
            Pasada
          </span>
        );
      default:
        return null;
    }
  };

  const previousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
    setSelectedDates([]);
  };

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
    setSelectedDates([]);
  };

  const getDaysInMonth = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  };

  const getWeekdayHeaders = () => {
    return ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  };

  const getLeadingEmptyDays = () => {
    const firstDay = startOfMonth(currentMonth);
    return firstDay.getDay(); // 0 = Sunday, 6 = Saturday
  };

  if (!property) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/host/properties')}
          className="inline-flex items-center text-secondary-600 hover:text-secondary-800 mb-4"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Volver a Mis Propiedades
        </button>

        <h1 className="text-3xl font-bold text-accent-900">
          Gestión de Disponibilidad
        </h1>
        <p className="mt-2 text-neutral-600">
          {property.title}
        </p>
      </div>

      {/* Info Alert */}
      <div className="mb-6 card bg-blue-50 border-blue-200">
        <div className="flex">
          <div className="flex-shrink-0">
            <InformationCircleIcon className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Cómo usar el calendario
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Haz clic en las fechas para seleccionarlas (múltiples)</li>
                <li>Usa los botones "Bloquear" o "Desbloquear" para cambiar la disponibilidad</li>
                <li>Las fechas con reservas no pueden modificarse</li>
                <li>Puedes bloquear rangos completos con el selector de rango</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="card bg-white">
            <div className="text-xs font-medium text-neutral-500">Total Días</div>
            <div className="mt-1 text-2xl font-bold text-accent-900">{stats.totalDays}</div>
          </div>
          <div className="card bg-green-50">
            <div className="text-xs font-medium text-green-700">Disponibles</div>
            <div className="mt-1 text-2xl font-bold text-green-600">{stats.availableDays}</div>
          </div>
          <div className="card bg-red-50">
            <div className="text-xs font-medium text-red-700">Reservadas</div>
            <div className="mt-1 text-2xl font-bold text-red-600">{stats.bookedDays}</div>
          </div>
          <div className="card bg-orange-50">
            <div className="text-xs font-medium text-orange-700">Bloqueadas</div>
            <div className="mt-1 text-2xl font-bold text-orange-600">{stats.blockedDays}</div>
          </div>
          <div className="card bg-gray-50">
            <div className="text-xs font-medium text-gray-600">Pasadas</div>
            <div className="mt-1 text-2xl font-bold text-gray-500">{stats.pastDays}</div>
          </div>
        </div>
      )}

      {/* Controles */}
      <div className="card mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Navegación de mes */}
          <div className="flex items-center space-x-4">
            <button
              onClick={previousMonth}
              className="p-2 rounded-md hover:bg-gray-100"
              disabled={loading}
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            
            <h2 className="text-xl font-semibold text-accent-900 min-w-[180px] text-center">
              {format(currentMonth, 'MMMM yyyy', { locale: es })}
            </h2>
            
            <button
              onClick={nextMonth}
              className="p-2 rounded-md hover:bg-gray-100"
              disabled={loading}
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Acciones */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowRangeSelector(!showRangeSelector)}
              className="btn-neutral text-sm"
            >
              {showRangeSelector ? 'Cancelar Rango' : 'Bloquear Rango'}
            </button>

            {selectedDates.length > 0 && (
              <>
                <button
                  onClick={handleBlockSelected}
                  disabled={saving}
                  className="btn-error text-sm disabled:opacity-50"
                >
                  <LockClosedIcon className="h-4 w-4 mr-1" />
                  Bloquear ({selectedDates.length})
                </button>
                
                <button
                  onClick={handleUnblockSelected}
                  disabled={saving}
                  className="btn-primary text-sm disabled:opacity-50"
                >
                  <CheckIcon className="h-4 w-4 mr-1" />
                  Desbloquear ({selectedDates.length})
                </button>
                
                <button
                  onClick={() => setSelectedDates([])}
                  className="p-2 text-neutral-600 hover:text-neutral-800"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Selector de Rango */}
        {showRangeSelector && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-neutral-900 mb-3">
              Bloquear Rango de Fechas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Fecha Inicio
                </label>
                <input
                  type="date"
                  value={rangeStart}
                  onChange={(e) => setRangeStart(e.target.value)}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Fecha Fin
                </label>
                <input
                  type="date"
                  value={rangeEnd}
                  onChange={(e) => setRangeEnd(e.target.value)}
                  min={rangeStart || format(new Date(), 'yyyy-MM-dd')}
                  className="input"
                />
              </div>
              <button
                onClick={handleBlockRange}
                disabled={saving || !rangeStart || !rangeEnd}
                className="btn-primary disabled:opacity-50"
              >
                Bloquear Rango
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Calendario */}
      <div className="card">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary-600"></div>
          </div>
        ) : (
          <div>
            {/* Cabecera de días de la semana */}
            <div className="grid grid-cols-7 gap-px bg-gray-200 mb-1">
              {getWeekdayHeaders().map((day) => (
                <div
                  key={day}
                  className="bg-gray-50 py-2 text-center text-sm font-semibold text-neutral-700"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Grid de días */}
            <div className="grid grid-cols-7 gap-1">
              {/* Días vacíos al inicio del mes */}
              {[...Array(getLeadingEmptyDays())].map((_, index) => (
                <div key={`empty-${index}`} className="h-20 bg-gray-50"></div>
              ))}

              {/* Días del mes */}
              {calendar.map((day) => (
                <div
                  key={day.date}
                  onClick={() => handleDateClick(day)}
                  className={getDayClassName(day)}
                >
                  <div className="flex flex-col h-full">
                    <div className="flex justify-between items-start">
                      <span className={`text-sm font-semibold ${
                        day.status === 'past' ? 'text-gray-400' :
                        day.status === 'booked' ? 'text-red-700' :
                        day.status === 'blocked' ? 'text-orange-700' :
                        isToday(new Date(day.date)) ? 'text-blue-600' :
                        'text-neutral-900'
                      }`}>
                        {day.dayOfMonth}
                      </span>
                      {isToday(new Date(day.date)) && (
                        <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                      )}
                    </div>
                    
                    <div className="mt-auto">
                      {getStatusBadge(day.status)}
                    </div>

                    {day.bookingId && (
                      <div className="mt-1 text-xs text-red-600 font-medium">
                        Reserva #{day.bookingId}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Leyenda */}
      <div className="mt-6 card bg-gray-50">
        <h3 className="text-sm font-semibold text-neutral-900 mb-3">Leyenda</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center">
            <div className="w-6 h-6 bg-white border-2 border-gray-300 rounded mr-2"></div>
            <span className="text-sm text-neutral-700">Disponible</span>
          </div>
          <div className="flex items-center">
            <div className="w-6 h-6 bg-orange-100 border-2 border-orange-300 rounded mr-2"></div>
            <span className="text-sm text-neutral-700">Bloqueada</span>
          </div>
          <div className="flex items-center">
            <div className="w-6 h-6 bg-red-100 border-2 border-red-300 rounded mr-2"></div>
            <span className="text-sm text-neutral-700">Reservada</span>
          </div>
          <div className="flex items-center">
            <div className="w-6 h-6 bg-gray-100 border-2 border-gray-300 rounded mr-2 opacity-50"></div>
            <span className="text-sm text-neutral-700">Fecha pasada</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityCalendar;