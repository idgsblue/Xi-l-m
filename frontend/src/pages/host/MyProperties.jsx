import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import api from '../../services/api';
import { toast } from 'react-toastify';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  HomeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  MegaphoneIcon,
  EyeSlashIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

const MyProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [advertisingId, setAdvertisingId] = useState(null);
  const [showCommissionModal, setShowCommissionModal] = useState(false);
  const [selectedPropertyForAdvertise, setSelectedPropertyForAdvertise] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      toast.error('No hay sesión activa');
      return;
    }
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      const response = await api.get('/properties/host/my-properties');
      console.log('Properties response:', response.data);
      
      if (!response.data.properties) {
        console.error('No properties array in response:', response.data);
        toast.error('Formato de respuesta inválido');
        return;
      }
      
      setProperties(response.data.properties);
    } catch (error) {
      console.error('Error loading properties:', error);
      console.error('Error response:', error.response);
      
      if (error.response?.status === 401) {
        toast.error('Sesión expirada. Por favor inicia sesión nuevamente.');
      } else if (error.response?.status === 403) {
        toast.error('No tienes permisos para ver propiedades');
      } else if (error.response?.status === 500) {
        toast.error('Error del servidor. Por favor contacta al administrador.');
        console.error('Server error details:', error.response?.data);
      } else {
        toast.error(error.response?.data?.error || 'Error cargando propiedades');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (propertyId) => {
    if (!window.confirm('¿Estás seguro de eliminar esta propiedad?')) {
      return;
    }

    setDeletingId(propertyId);
    try {
      await api.delete(`/properties/${propertyId}`);
      toast.success('Propiedad eliminada exitosamente');
      loadProperties();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error eliminando propiedad');
    } finally {
      setDeletingId(null);
    }
  };

  const handleAdvertiseClick = (property) => {
    setSelectedPropertyForAdvertise(property);
    setShowCommissionModal(true);
  };

  const confirmAdvertise = async () => {
    if (!selectedPropertyForAdvertise) return;

    setAdvertisingId(selectedPropertyForAdvertise.id);
    try {
      const response = await api.post(`/properties/${selectedPropertyForAdvertise.id}/advertise`);
      
      toast.success(response.data.message || 'Propiedad anunciada exitosamente');
      
      if (response.data.commissionInfo) {
        const { pricePerNight, platformCommission, commissionPercentage, hostEarnings } = response.data.commissionInfo;
        toast.info(
          `Precio: $${pricePerNight} | Comisión (${commissionPercentage}%): $${platformCommission} | Ganancia: $${hostEarnings}`,
          { autoClose: 8000 }
        );
      }
      
      setShowCommissionModal(false);
      setSelectedPropertyForAdvertise(null);
      loadProperties();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error anunciando propiedad');
    } finally {
      setAdvertisingId(null);
    }
  };

  const handleUnadvertise = async (propertyId) => {
    if (!window.confirm('¿Deseas despublicar esta propiedad? Dejará de ser visible para huéspedes.')) {
      return;
    }

    try {
      await api.post(`/properties/${propertyId}/unadvertise`);
      toast.success('Propiedad despublicada exitosamente');
      loadProperties();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error despublicando propiedad');
    }
  };

  const getStatusBadge = (property) => {
    const { status, rejection_reason } = property;
    const baseClass = "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 shadow-sm";
    
    const statusConfig = {
      published: {
        className: "bg-gradient-to-r from-green-50 to-green-100 text-green-800 border border-green-200 hover:shadow-md",
        icon: CheckCircleIcon,
        text: 'Publicada'
      },
      approved: {
        className: "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 border border-blue-200 hover:shadow-md",
        icon: CheckCircleIcon,
        text: 'Aprobada (lista para anunciar)'
      },
      pending_approval: {
        className: "bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-800 border border-yellow-200 hover:shadow-md",
        icon: ClockIcon,
        text: 'Pendiente de Aprobación'
      },
      rejected: {
        className: "bg-gradient-to-r from-red-50 to-red-100 text-red-800 border border-red-200 hover:shadow-md",
        icon: XCircleIcon,
        text: 'Rechazada'
      },
      inactive: {
        className: "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-800 border border-gray-200 hover:shadow-md",
        icon: EyeSlashIcon,
        text: 'Inactiva'
      },
      blocked: {
        className: "bg-gradient-to-r from-red-100 to-red-200 text-red-900 border border-red-300 hover:shadow-md",
        icon: ExclamationCircleIcon,
        text: 'Bloqueada por Admin'
      }
    };

    const config = statusConfig[status] || {
      className: "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-800 border border-gray-200",
      icon: null,
      text: status
    };

    const Icon = config.icon;

    return (
      <div>
        <span className={`${baseClass} ${config.className}`}>
          {Icon && <Icon className="h-4 w-4 mr-1.5" />}
          {config.text}
        </span>
        {rejection_reason && (
          <p className="mt-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded px-2 py-1 inline-block">
            Motivo: {rejection_reason}
          </p>
        )}
      </div>
    );
  };

  const getAvailableActions = (property) => {
    const actions = {
      canView: true,
      canEdit: ['pending_approval', 'approved', 'rejected', 'inactive'].includes(property.status),
      canDelete: property.status !== 'published',
      canAdvertise: property.status === 'approved' && !property.is_advertised,
      canUnadvertise: property.status === 'published',
      canManageAvailability: property.status === 'published' || property.status === 'approved'
    };
    return actions;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-secondary-600 border-t-transparent absolute top-0 left-0"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8 pb-6 border-b-2 border-gray-100">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-accent-900 to-accent-700 bg-clip-text text-transparent">
            Mis Propiedades
          </h1>
          <p className="mt-2 text-neutral-600 text-lg">Administra tus propiedades publicadas</p>
        </div>
        <Link
          to="/host/properties/add"
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Agregar Propiedad
        </Link>
      </div>

      {/* Información sobre el proceso de aprobación */}
      <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-400 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="flex">
          <div className="flex-shrink-0">
            <ExclamationCircleIcon className="h-6 w-6 text-blue-500" />
          </div>
          <div className="ml-4 flex-1">
            <h3 className="text-base font-semibold text-blue-900 mb-3">
              Proceso de Aprobación
            </h3>
            <div className="space-y-2 text-sm text-blue-800">
              <div className="flex items-start">
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-200 text-blue-800 font-bold text-xs mr-3 flex-shrink-0">1</span>
                <p>Las propiedades nuevas quedan en estado <strong>"Pendiente de Aprobación"</strong></p>
              </div>
              <div className="flex items-start">
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-200 text-blue-800 font-bold text-xs mr-3 flex-shrink-0">2</span>
                <p>Un administrador las revisará y aprobará o rechazará</p>
              </div>
              <div className="flex items-start">
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-200 text-blue-800 font-bold text-xs mr-3 flex-shrink-0">3</span>
                <p>Una vez <strong>"Aprobadas"</strong>, tú decides cuándo anunciarlas</p>
              </div>
              <div className="flex items-start">
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-200 text-blue-800 font-bold text-xs mr-3 flex-shrink-0">4</span>
                <p>Al anunciar, la propiedad se publica y es visible para huéspedes</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {properties.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100 hover:shadow-xl transition-shadow duration-300">
          <div className="bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <HomeIcon className="h-12 w-12 text-neutral-500" />
          </div>
          <h3 className="text-2xl font-bold text-accent-900 mb-2">No tienes propiedades</h3>
          <p className="text-neutral-600 mb-8 text-lg">Comienza agregando tu primera propiedad</p>
          <div className="mt-6">
            <Link
              to="/host/properties/add"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <PlusIcon className="h-6 w-6 mr-2" />
              Agregar Propiedad
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-neutral-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-neutral-700 uppercase tracking-wider">
                    Propiedad
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-neutral-700 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-neutral-700 uppercase tracking-wider">
                    Precio/Noche
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-neutral-700 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-neutral-700 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {properties.map((property, index) => {
                  const actions = getAvailableActions(property);
                  
                  return (
                    <tr 
                      key={property.id}
                      className="hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 transition-all duration-200 group"
                    >
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-14 w-14 relative group-hover:scale-105 transition-transform duration-200">
                            {property.images && property.images.length > 0 ? (
                              <img
                                className="h-14 w-14 rounded-xl object-cover shadow-md ring-2 ring-gray-200 group-hover:ring-primary-400 transition-all duration-200"
                                src={property.images[0]?.image_url || property.images[0]}
                                alt={property.title}
                              />
                            ) : (
                              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-neutral-200 to-neutral-300 flex items-center justify-center shadow-md ring-2 ring-gray-200">
                                <HomeIcon className="h-7 w-7 text-neutral-500" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-accent-900 group-hover:text-primary-700 transition-colors duration-200">
                              {property.title}
                            </div>
                            <div className="text-sm text-neutral-500 mt-1">
                              {property.location}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        {getStatusBadge(property)}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="text-base font-bold text-accent-900">
                          ${property.price_per_night}
                        </div>
                        <div className="text-xs text-neutral-500">MXN / noche</div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className="text-sm text-neutral-700 bg-neutral-100 px-3 py-1 rounded-full font-medium">
                          {property.accommodationType?.name || 'Sin tipo'}
                        </span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm font-medium">
                        <div className="flex flex-col space-y-2">
                          {/* Fila 1: Acciones principales */}
                          <div className="flex space-x-2">
                            {actions.canView && (
                              <Link
                                to={`/property/${property.id}`}
                                className="inline-flex items-center justify-center p-1.5 rounded-lg text-secondary-600 hover:text-secondary-800 bg-secondary-50 hover:bg-secondary-100 transition-all duration-200 transform hover:scale-110 active:scale-95"
                                title="Ver propiedad"
                              >
                                <EyeIcon className="h-5 w-5" />
                              </Link>
                            )}
                            
                            {actions.canEdit && (
                              <Link
                                to={`/host/properties/edit/${property.id}`}
                                className="inline-flex items-center justify-center p-1.5 rounded-lg text-accent-600 hover:text-accent-800 bg-accent-50 hover:bg-accent-100 transition-all duration-200 transform hover:scale-110 active:scale-95"
                                title="Editar propiedad"
                              >
                                <PencilIcon className="h-5 w-5" />
                              </Link>
                            )}
                            
                            {actions.canDelete && (
                              <button
                                onClick={() => handleDelete(property.id)}
                                disabled={deletingId === property.id}
                                className="inline-flex items-center justify-center p-1.5 rounded-lg text-error-600 hover:text-error-800 bg-red-50 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-110 active:scale-95"
                                title="Eliminar propiedad"
                              >
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            )}
                            
                            {actions.canManageAvailability && (
                              <Link
                                to={`/host/properties/${property.id}/availability`}
                                className="inline-flex items-center justify-center p-1.5 rounded-lg text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 transition-all duration-200 transform hover:scale-110 active:scale-95"
                                title="Gestionar disponibilidad"
                              >
                                <CalendarIcon className="h-5 w-5" />
                              </Link>
                            )}
                          </div>
                          
                          {/* Fila 2: Botones de anunciar/despublicar */}
                          <div className="flex space-x-2">
                            {actions.canAdvertise && (
                              <button
                                onClick={() => handleAdvertiseClick(property)}
                                disabled={advertisingId === property.id}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
                              >
                                <MegaphoneIcon className="h-4 w-4 mr-1" />
                                {advertisingId === property.id ? 'Anunciando...' : 'Anunciar'}
                              </button>
                            )}
                            
                            {actions.canUnadvertise && (
                              <button
                                onClick={() => handleUnadvertise(property.id)}
                                className="inline-flex items-center px-3 py-1.5 border-2 border-neutral-300 text-xs font-medium rounded-lg text-neutral-700 bg-white hover:bg-neutral-50 hover:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
                              >
                                <EyeSlashIcon className="h-4 w-4 mr-1" />
                                Despublicar
                              </button>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Anunciar con Comisión */}
      {showCommissionModal && selectedPropertyForAdvertise && (
        <div className="fixed z-50 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity backdrop-blur-sm" 
              onClick={() => setShowCommissionModal(false)}
            ></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-2xl px-6 pt-6 pb-6 text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-gray-100">
              <div>
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-green-100 to-green-200 shadow-lg">
                  <MegaphoneIcon className="h-8 w-8 text-green-600" />
                </div>
                <div className="mt-4 text-center">
                  <h3 className="text-2xl leading-6 font-bold text-accent-900 mb-2" id="modal-title">
                    Anunciar Propiedad
                  </h3>
                  <div className="mt-3 bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-neutral-600">
                      Estás por anunciar:
                    </p>
                    <p className="text-base font-bold text-accent-900 mt-1">
                      {selectedPropertyForAdvertise.title}
                    </p>
                  </div>

                  {/* Información de Comisión */}
                  {selectedPropertyForAdvertise.accommodationType && (
                    <div className="mt-5 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-5 text-sm shadow-sm">
                      <h4 className="font-bold text-blue-900 mb-4 text-base flex items-center justify-center">
                        <span className="text-2xl mr-2">💰</span>
                        Desglose de Ingresos
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center bg-white rounded-lg p-3 shadow-sm">
                          <span className="text-neutral-700 font-medium">Precio por noche:</span>
                          <span className="font-bold text-accent-900 text-lg">
                            ${parseFloat(selectedPropertyForAdvertise.price_per_night).toFixed(2)} MXN
                          </span>
                        </div>
                        
                        {selectedPropertyForAdvertise.accommodationType.platform_commission_percentage && (
                          <>
                            <div className="flex justify-between items-center bg-white rounded-lg p-3 shadow-sm">
                              <span className="text-red-600 font-medium">
                                Comisión ({selectedPropertyForAdvertise.accommodationType.platform_commission_percentage}%):
                              </span>
                              <span className="font-bold text-red-600">
                                -${(
                                  (parseFloat(selectedPropertyForAdvertise.price_per_night) * 
                                  parseFloat(selectedPropertyForAdvertise.accommodationType.platform_commission_percentage)) / 100
                                ).toFixed(2)} MXN
                              </span>
                            </div>
                            
                            <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg p-3 shadow-md border-2 border-green-300">
                              <div className="flex justify-between items-center">
                                <span className="text-green-800 font-bold">Tu ganancia neta:</span>
                                <span className="text-green-700 font-bold text-lg">
                                  ${(
                                    parseFloat(selectedPropertyForAdvertise.price_per_night) - 
                                    (parseFloat(selectedPropertyForAdvertise.price_per_night) * 
                                    parseFloat(selectedPropertyForAdvertise.accommodationType.platform_commission_percentage)) / 100
                                  ).toFixed(2)} MXN
                                </span>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                      
                      <div className="mt-4 bg-blue-100 border border-blue-300 rounded-lg p-3">
                        <p className="text-xs text-blue-800 font-medium flex items-center">
                          <span className="text-lg mr-2">ℹ️</span>
                          La comisión se aplica automáticamente en cada reserva
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 bg-gradient-to-r from-amber-50 to-yellow-50 border-l-4 border-amber-400 rounded-lg p-4 shadow-sm">
                    <p className="text-sm text-amber-900 font-medium flex items-start">
                      <span className="text-xl mr-2 flex-shrink-0">⚠️</span>
                      <span>
                        <strong>Nota:</strong> Una vez anunciada, la propiedad será visible para todos los huéspedes en la plataforma.
                      </span>
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCommissionModal(false);
                    setSelectedPropertyForAdvertise(null);
                  }}
                  disabled={advertisingId === selectedPropertyForAdvertise.id}
                  className="w-full inline-flex justify-center items-center rounded-xl border-2 border-neutral-300 shadow-sm px-5 py-3 bg-white text-base font-semibold text-neutral-700 hover:bg-neutral-50 hover:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500 transition-all duration-200 transform hover:scale-105 active:scale-95"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmAdvertise}
                  disabled={advertisingId === selectedPropertyForAdvertise.id}
                  className="w-full inline-flex justify-center items-center rounded-xl border border-transparent shadow-lg px-5 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-base font-bold text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95"
                >
                  {advertisingId === selectedPropertyForAdvertise.id ? 'Anunciando...' : 'Confirmar y Anunciar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProperties;