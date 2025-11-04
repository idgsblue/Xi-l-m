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
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      const response = await api.get('/properties/host/my-properties');
      setProperties(response.data.properties);
    } catch (error) {
      toast.error('Error cargando propiedades');
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

  // Nueva función para anunciar propiedad (con modal de comisión)
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
      
      // Mostrar info de comisión si está disponible
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

  // Nueva función para despublicar propiedad
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

  // Función mejorada para obtener badge de estado
  const getStatusBadge = (property) => {
    const { status, rejection_reason, statusMessage } = property;
    
    switch (status) {
      case 'published':
        return (
          <span className="badge-success inline-flex items-center">
            <CheckCircleIcon className="h-4 w-4 mr-1" />
            Publicada
          </span>
        );
      
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <CheckCircleIcon className="h-4 w-4 mr-1" />
            Aprobada (lista para anunciar)
          </span>
        );
      
      case 'pending_approval':
        return (
          <span className="badge-warning inline-flex items-center">
            <ClockIcon className="h-4 w-4 mr-1" />
            Pendiente de Aprobación
          </span>
        );
      
      case 'rejected':
        return (
          <div>
            <span className="badge-error inline-flex items-center">
              <XCircleIcon className="h-4 w-4 mr-1" />
              Rechazada
            </span>
            {rejection_reason && (
              <p className="mt-1 text-xs text-red-600">
                Motivo: {rejection_reason}
              </p>
            )}
          </div>
        );
      
      case 'inactive':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <EyeSlashIcon className="h-4 w-4 mr-1" />
            Inactiva
          </span>
        );
      
      case 'blocked':
        return (
          <span className="badge-error inline-flex items-center">
            <ExclamationCircleIcon className="h-4 w-4 mr-1" />
            Bloqueada por Admin
          </span>
        );
      
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  // Función para determinar qué acciones están disponibles
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-accent-900">Mis Propiedades</h1>
          <p className="mt-2 text-neutral-600">Administra tus propiedades publicadas</p>
        </div>
        <Link
          to="/host/properties/add"
          className="btn-primary inline-flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Agregar Propiedad
        </Link>
      </div>

      {/* Información sobre el proceso de aprobación */}
      <div className="card mb-6 bg-blue-50 border-blue-200">
        <div className="flex">
          <div className="flex-shrink-0">
            <ExclamationCircleIcon className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Proceso de Aprobación
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                1. Las propiedades nuevas quedan en estado <strong>"Pendiente de Aprobación"</strong>
              </p>
              <p>
                2. Un administrador las revisará y aprobará o rechazará
              </p>
              <p>
                3. Una vez <strong>"Aprobadas"</strong>, tú decides cuándo anunciarlas
              </p>
              <p>
                4. Al anunciar, la propiedad se publica y es visible para huéspedes
              </p>
            </div>
          </div>
        </div>
      </div>

      {properties.length === 0 ? (
        <div className="card text-center">
          <HomeIcon className="mx-auto h-12 w-12 text-neutral-400" />
          <h3 className="mt-2 text-sm font-medium text-accent-900">No tienes propiedades</h3>
          <p className="mt-1 text-sm text-neutral-500">Comienza agregando tu primera propiedad</p>
          <div className="mt-6">
            <Link
              to="/host/properties/add"
              className="btn-primary inline-flex items-center"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Agregar Propiedad
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <table className="min-w-full divide-y divide-primary-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Propiedad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Precio/Noche
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-primary-200">
              {properties.map((property) => {
                const actions = getAvailableActions(property);
                
                return (
                  <tr key={property.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {property.images && property.images.length > 0 ? (
                            <img
                              className="h-10 w-10 rounded-lg object-cover"
                              src={property.images[0]?.image_url || property.images[0]}
                              alt={property.title}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-neutral-200 flex items-center justify-center">
                              <HomeIcon className="h-6 w-6 text-neutral-400" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-accent-900">
                            {property.title}
                          </div>
                          <div className="text-sm text-neutral-500">
                            {property.location}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(property)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-accent-900">
                      ${property.price_per_night} MXN
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                      {property.accommodationType?.name || 'Sin tipo'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex flex-col space-y-2">
                        {/* Fila 1: Acciones principales */}
                        <div className="flex space-x-2">
                          {actions.canView && (
                            <Link
                              to={`/property/${property.id}`}
                              className="text-secondary-600 hover:text-secondary-900"
                              title="Ver propiedad"
                            >
                              <EyeIcon className="h-5 w-5" />
                            </Link>
                          )}
                          
                          {actions.canEdit && (
                            <Link
                              to={`/host/properties/edit/${property.id}`}
                              className="text-accent-600 hover:text-accent-900"
                              title="Editar propiedad"
                            >
                              <PencilIcon className="h-5 w-5" />
                            </Link>
                          )}
                          
                          {actions.canDelete && (
                            <button
                              onClick={() => handleDelete(property.id)}
                              disabled={deletingId === property.id}
                              className="text-error-600 hover:text-error-900 disabled:opacity-50"
                              title="Eliminar propiedad"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          )}
                          
                          {actions.canManageAvailability && (
                            <button
                              onClick={() => {
                                // Por ahora mostrar mensaje, luego implementaremos el calendario
                                toast.info('Función de calendario en desarrollo');
                              }}
                              className="text-blue-600 hover:text-blue-900"
                              title="Gestionar disponibilidad"
                            >
                              <CalendarIcon className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                        
                        {/* Fila 2: Botones de anunciar/despublicar */}
                        {actions.canAdvertise && (
                          <button
                            onClick={() => handleAdvertiseClick(property)}
                            disabled={advertisingId === property.id}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                          >
                            <MegaphoneIcon className="h-4 w-4 mr-1" />
                            {advertisingId === property.id ? 'Anunciando...' : 'Anunciar'}
                          </button>
                        )}
                        
                        {actions.canUnadvertise && (
                          <button
                            onClick={() => handleUnadvertise(property.id)}
                            className="inline-flex items-center px-3 py-1 border border-neutral-300 text-xs font-medium rounded-md text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500"
                          >
                            <EyeSlashIcon className="h-4 w-4 mr-1" />
                            Despublicar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de Confirmación de Anunciar con Comisión */}
      {showCommissionModal && selectedPropertyForAdvertise && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowCommissionModal(false)}></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                  <MegaphoneIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-accent-900">
                    Anunciar Propiedad
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-neutral-500">
                      Estás por anunciar: <strong>{selectedPropertyForAdvertise.title}</strong>
                    </p>
                  </div>

                  {/* Información de Comisión */}
                  {selectedPropertyForAdvertise.accommodationType && (
                    <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-blue-900 mb-3">
                        💰 Desglose de Ingresos
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-neutral-600">Precio por noche:</span>
                          <span className="font-medium text-accent-900">
                            ${parseFloat(selectedPropertyForAdvertise.price_per_night).toFixed(2)} MXN
                          </span>
                        </div>
                        
                        {selectedPropertyForAdvertise.accommodationType.platform_commission_percentage && (
                          <>
                            <div className="flex justify-between text-red-600">
                              <span>Comisión plataforma ({selectedPropertyForAdvertise.accommodationType.platform_commission_percentage}%):</span>
                              <span className="font-medium">
                                -${(
                                  (parseFloat(selectedPropertyForAdvertise.price_per_night) * 
                                  parseFloat(selectedPropertyForAdvertise.accommodationType.platform_commission_percentage)) / 100
                                ).toFixed(2)} MXN
                              </span>
                            </div>
                            
                            <div className="border-t border-blue-300 pt-2 flex justify-between text-green-700 font-semibold">
                              <span>Tu ganancia neta:</span>
                              <span>
                                ${(
                                  parseFloat(selectedPropertyForAdvertise.price_per_night) - 
                                  (parseFloat(selectedPropertyForAdvertise.price_per_night) * 
                                  parseFloat(selectedPropertyForAdvertise.accommodationType.platform_commission_percentage)) / 100
                                ).toFixed(2)} MXN
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                      
                      <p className="mt-3 text-xs text-blue-700">
                        ℹ️ La comisión se aplica automáticamente en cada reserva
                      </p>
                    </div>
                  )}

                  <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-xs text-amber-800">
                      <strong>Nota:</strong> Una vez anunciada, la propiedad será visible para todos los huéspedes en la plataforma.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="button"
                  onClick={confirmAdvertise}
                  disabled={advertisingId === selectedPropertyForAdvertise.id}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:col-start-2 sm:text-sm disabled:opacity-50"
                >
                  {advertisingId === selectedPropertyForAdvertise.id ? 'Anunciando...' : 'Confirmar y Anunciar'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCommissionModal(false);
                    setSelectedPropertyForAdvertise(null);
                  }}
                  disabled={advertisingId === selectedPropertyForAdvertise.id}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-neutral-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                >
                  Cancelar
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