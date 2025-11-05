import React from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import adminService from '../../services/admin.service';

const AdminDashboard = () => {
  const { data, isLoading, error } = useQuery('adminDashboard', adminService.getDashboard);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Error al cargar dashboard: {error.message}
        </div>
      </div>
    );
  }

  const { properties, users, bookings } = data || {};

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Panel de Administración</h1>
        <p className="text-neutral-600 mt-2">Vista general del sistema Arroyo Seco</p>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Propiedades */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Total Propiedades</p>
              <p className="text-3xl font-bold text-neutral-900 mt-2">{properties?.total || 0}</p>
            </div>
            <div className="bg-secondary-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-secondary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex gap-4 text-sm">
            <span className="text-green-600">
              ✓ {properties?.published || 0} publicadas
            </span>
            <span className="text-yellow-600">
              ⏳ {properties?.pending || 0} pendientes
            </span>
          </div>
        </div>

        {/* Total Usuarios */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Total Usuarios</p>
              <p className="text-3xl font-bold text-neutral-900 mt-2">{users?.total || 0}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex gap-4 text-sm">
            <span className="text-blue-600">
              🏠 {users?.hosts || 0} anfitriones
            </span>
            <span className="text-purple-600">
              👤 {users?.guests || 0} huéspedes
            </span>
          </div>
        </div>

        {/* Reservas del Mes */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Reservas del Mes</p>
              <p className="text-3xl font-bold text-neutral-900 mt-2">{bookings?.thisMonth || 0}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 text-sm text-neutral-600">
            Mes actual: {new Date().toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}
          </div>
        </div>

        {/* Tasa de Cancelación */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Tasa Cancelación</p>
              <p className="text-3xl font-bold text-neutral-900 mt-2">{bookings?.cancellationRate || 0}%</p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 text-sm text-neutral-600">
            {parseFloat(bookings?.cancellationRate || 0) < 10 ? 
              '✓ Dentro del rango aceptable' : 
              '⚠ Revisar causas'}
          </div>
        </div>
      </div>

      {/* Accesos rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Link
          to="/admin/properties/pending"
          className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-6 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-900">Propiedades Pendientes</h3>
            <div className="bg-yellow-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
              {properties?.pending || 0}
            </div>
          </div>
          <p className="text-neutral-600 text-sm mb-4">
            Revisa y aprueba propiedades en espera de validación
          </p>
          <div className="flex items-center text-yellow-700 font-medium group-hover:text-yellow-800">
            <span>Ver pendientes</span>
            <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>

        <Link
          to="/admin/users"
          className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-900">Gestión de Usuarios</h3>
            <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
              {users?.total || 0}
            </div>
          </div>
          <p className="text-neutral-600 text-sm mb-4">
            Administra usuarios, roles y permisos del sistema
          </p>
          <div className="flex items-center text-blue-700 font-medium group-hover:text-blue-800">
            <span>Gestionar usuarios</span>
            <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>

        <Link
          to="/admin/accommodation-types"
          className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-6 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-900">Tipos de Alojamiento</h3>
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <p className="text-neutral-600 text-sm mb-4">
            Configura tipos, rangos de precio y comisiones
          </p>
          <div className="flex items-center text-green-700 font-medium group-hover:text-green-800">
            <span>Configurar tipos</span>
            <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>

        <Link
          to="/admin/reports"
          className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-6 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-900">Reportes</h3>
            <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-neutral-600 text-sm mb-4">
            Genera reportes de reservas, ingresos y propiedades
          </p>
          <div className="flex items-center text-purple-700 font-medium group-hover:text-purple-800">
            <span>Ver reportes</span>
            <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>
      </div>

      {/* Desglose de propiedades */}
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
        <h2 className="text-xl font-bold text-neutral-900 mb-4">Estado de Propiedades</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="text-center p-4 bg-neutral-50 rounded-lg">
            <p className="text-2xl font-bold text-neutral-900">{properties?.total || 0}</p>
            <p className="text-sm text-neutral-600 mt-1">Total</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-700">{properties?.published || 0}</p>
            <p className="text-sm text-neutral-600 mt-1">Publicadas</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <p className="text-2xl font-bold text-yellow-700">{properties?.pending || 0}</p>
            <p className="text-sm text-neutral-600 mt-1">Pendientes</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-700">
              {(properties?.total || 0) - (properties?.published || 0) - (properties?.pending || 0)}
            </p>
            <p className="text-sm text-neutral-600 mt-1">Otras</p>
          </div>
          <div className="text-center p-4 bg-neutral-50 rounded-lg">
            <p className="text-2xl font-bold text-neutral-900">
              {properties?.total ? ((properties.published / properties.total) * 100).toFixed(0) : 0}%
            </p>
            <p className="text-sm text-neutral-600 mt-1">Tasa publicación</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;