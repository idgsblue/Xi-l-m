import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { toast } from 'react-toastify';
import adminService from '../../services/admin.service';

const Reports = () => {
  const [reportType, setReportType] = useState('bookings');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [shouldFetch, setShouldFetch] = useState(false);

  const { data, isLoading, error, refetch } = useQuery(
    ['report', reportType, dateRange.startDate, dateRange.endDate],
    () => adminService.generateReport(reportType, dateRange.startDate, dateRange.endDate),
    {
      enabled: shouldFetch,
      onSuccess: () => {
        toast.success('Reporte generado exitosamente');
      },
      onError: (err) => {
        toast.error(err.error || 'Error al generar reporte');
      }
    }
  );

  const handleGenerateReport = (e) => {
    e.preventDefault();
    
    // Validar fechas si están presentes
    if (dateRange.startDate && dateRange.endDate) {
      if (new Date(dateRange.startDate) > new Date(dateRange.endDate)) {
        toast.error('La fecha de inicio debe ser anterior a la fecha de fin');
        return;
      }
    }

    setShouldFetch(true);
    refetch();
  };

  const handleClearDates = () => {
    setDateRange({ startDate: '', endDate: '' });
    setShouldFetch(false);
  };

  const renderBookingsReport = (report) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-neutral-600">Total Reservas</h3>
          <div className="bg-blue-100 p-2 rounded-full">
            <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
        </div>
        <p className="text-3xl font-bold text-neutral-900">{report.total || 0}</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-neutral-600">Confirmadas</h3>
          <div className="bg-green-100 p-2 rounded-full">
            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <p className="text-3xl font-bold text-green-700">{report.confirmed || 0}</p>
        <p className="text-sm text-neutral-600 mt-2">
          {report.total ? ((report.confirmed / report.total) * 100).toFixed(1) : 0}% del total
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-neutral-600">Completadas</h3>
          <div className="bg-purple-100 p-2 rounded-full">
            <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <p className="text-3xl font-bold text-purple-700">{report.completed || 0}</p>
        <p className="text-sm text-neutral-600 mt-2">
          {report.total ? ((report.completed / report.total) * 100).toFixed(1) : 0}% del total
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-neutral-600">Canceladas</h3>
          <div className="bg-red-100 p-2 rounded-full">
            <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        </div>
        <p className="text-3xl font-bold text-red-700">{report.cancelled || 0}</p>
        <p className="text-sm text-neutral-600 mt-2">
          {report.total ? ((report.cancelled / report.total) * 100).toFixed(1) : 0}% del total
        </p>
      </div>
    </div>
  );

  const renderRevenueReport = (report) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-neutral-600">Ingresos Totales</h3>
          <div className="bg-green-100 p-2 rounded-full">
            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <p className="text-4xl font-bold text-green-700">
          ${parseFloat(report.totalRevenue || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        <p className="text-sm text-neutral-600 mt-2">MXN</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-neutral-600">Reservas Pagadas</h3>
          <div className="bg-blue-100 p-2 rounded-full">
            <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
        </div>
        <p className="text-4xl font-bold text-blue-700">{report.totalBookings || 0}</p>
        <p className="text-sm text-neutral-600 mt-2">
          Promedio: ${report.totalBookings ? (report.totalRevenue / report.totalBookings).toFixed(2) : 0} MXN
        </p>
      </div>
    </div>
  );

  const renderPropertiesReport = (report) => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 text-center">
        <p className="text-3xl font-bold text-neutral-900">{report.total || 0}</p>
        <p className="text-sm text-neutral-600 mt-2">Total</p>
      </div>
      <div className="bg-green-50 rounded-lg shadow-sm border border-green-200 p-6 text-center">
        <p className="text-3xl font-bold text-green-700">{report.published || 0}</p>
        <p className="text-sm text-neutral-600 mt-2">Publicadas</p>
      </div>
      <div className="bg-yellow-50 rounded-lg shadow-sm border border-yellow-200 p-6 text-center">
        <p className="text-3xl font-bold text-yellow-700">{report.pending || 0}</p>
        <p className="text-sm text-neutral-600 mt-2">Pendientes</p>
      </div>
      <div className="bg-blue-50 rounded-lg shadow-sm border border-blue-200 p-6 text-center">
        <p className="text-3xl font-bold text-blue-700">{report.approved || 0}</p>
        <p className="text-sm text-neutral-600 mt-2">Aprobadas</p>
      </div>
      <div className="bg-red-50 rounded-lg shadow-sm border border-red-200 p-6 text-center">
        <p className="text-3xl font-bold text-red-700">{report.rejected || 0}</p>
        <p className="text-sm text-neutral-600 mt-2">Rechazadas</p>
      </div>
      <div className="bg-neutral-50 rounded-lg shadow-sm border border-neutral-200 p-6 text-center">
        <p className="text-3xl font-bold text-neutral-700">{report.blocked || 0}</p>
        <p className="text-sm text-neutral-600 mt-2">Bloqueadas</p>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Reportes</h1>
        <p className="text-neutral-600 mt-2">Genera reportes personalizados del sistema</p>
      </div>

      {/* Formulario de generación */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 mb-8">
        <form onSubmit={handleGenerateReport}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Tipo de Reporte *
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="input-field w-full"
                required
              >
                <option value="bookings">Reservas</option>
                <option value="revenue">Ingresos</option>
                <option value="properties">Propiedades</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Fecha Inicio (opcional)
              </label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="input-field w-full"
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Fecha Fin (opcional)
              </label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="input-field w-full"
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="flex items-end gap-2">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 btn-primary"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generando...
                  </>
                ) : (
                  'Generar'
                )}
              </button>
              {(dateRange.startDate || dateRange.endDate) && (
                <button
                  type="button"
                  onClick={handleClearDates}
                  className="btn-secondary"
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>

          {(dateRange.startDate || dateRange.endDate) && (
            <div className="text-sm text-neutral-600">
              📅 Período: {dateRange.startDate ? new Date(dateRange.startDate).toLocaleDateString('es-MX') : 'Inicio'} 
              {' → '}
              {dateRange.endDate ? new Date(dateRange.endDate).toLocaleDateString('es-MX') : 'Presente'}
            </div>
          )}
        </form>
      </div>

      {/* Resultados */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-8">
          {error.message || 'Error al generar reporte'}
        </div>
      )}

      {data?.report && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-neutral-900">
              Reporte de {reportType === 'bookings' ? 'Reservas' : reportType === 'revenue' ? 'Ingresos' : 'Propiedades'}
            </h2>
            <button
              onClick={() => window.print()}
              className="btn-secondary flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Imprimir
            </button>
          </div>

          {reportType === 'bookings' && renderBookingsReport(data.report)}
          {reportType === 'revenue' && renderRevenueReport(data.report)}
          {reportType === 'properties' && renderPropertiesReport(data.report)}
        </div>
      )}

      {!data && !isLoading && (
        <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-neutral-900">Sin reporte generado</h3>
          <p className="mt-2 text-neutral-600">
            Selecciona el tipo de reporte y haz clic en "Generar" para ver los resultados
          </p>
        </div>
      )}
    </div>
  );
};

export default Reports;