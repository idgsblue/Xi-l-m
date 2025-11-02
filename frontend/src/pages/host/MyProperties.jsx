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
  ClockIcon
} from '@heroicons/react/24/outline';

const MyProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

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

  const toggleAvailability = async (propertyId, currentStatus) => {
    try {
      await api.patch(`/properties/${propertyId}/availability`, {
        isAvailable: !currentStatus
      });
      toast.success(`Propiedad ${!currentStatus ? 'activada' : 'desactivada'}`);
      loadProperties();
    } catch (error) {
      toast.error('Error actualizando disponibilidad');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <span className="badge-success inline-flex items-center">
            <CheckCircleIcon className="h-4 w-4 mr-1 icon-success" />
            Aprobada
          </span>
        );
      case 'pending':
        return (
          <span className="badge-warning inline-flex items-center">
            <ClockIcon className="h-4 w-4 mr-1 icon-warning" />
            Pendiente
          </span>
        );
      case 'rejected':
        return (
          <span className="badge-error inline-flex items-center">
            <XCircleIcon className="h-4 w-4 mr-1 icon-error" />
            Rechazada
          </span>
        );
      default:
        return null;
    }
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
          <PlusIcon className="h-5 w-5 mr-2 icon-secondary" />
          Agregar Propiedad
        </Link>
      </div>

      {properties.length === 0 ? (
        <div className="card text-center">
          <HomeIcon className="mx-auto h-12 w-12 icon-muted" />
          <h3 className="mt-2 text-sm font-medium text-accent-900">No tienes propiedades</h3>
          <p className="mt-1 text-sm text-neutral-500">Comienza agregando tu primera propiedad</p>
          <div className="mt-6">
            <Link
              to="/host/properties/add"
              className="btn-primary inline-flex items-center"
            >
              <PlusIcon className="h-5 w-5 mr-2 icon-secondary" />
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
                  Disponible
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-primary-200">
              {properties.map((property) => (
                <tr key={property.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {property.images && property.images.length > 0 ? (
                          <img
                            className="h-10 w-10 rounded-lg object-cover"
                            src={`${process.env.REACT_APP_API_URL?.replace('/api', '')}${property.images[0]}`}
                            alt={property.name}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-neutral-200 flex items-center justify-center">
                            <HomeIcon className="h-6 w-6 icon-muted" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-accent-900">
                          {property.name}
                        </div>
                        <div className="text-sm text-neutral-500">
                          {property.zone}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(property.status)}
                    {property.status === 'rejected' && property.rejectionReason && (
                      <p className="mt-1 text-xs text-red-600">
                        {property.rejectionReason}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-accent-900">
                    ${property.pricePerNight} MXN
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleAvailability(property.id, property.isAvailable)}
                      className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500 ${
                        property.isAvailable ? 'bg-secondary-600' : 'bg-neutral-200'
                      }`}
                      disabled={property.status !== 'approved'}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${
                          property.isAvailable ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Link
                        to={`/property/${property.id}`}
                        className="text-secondary-600 hover:text-secondary-900"
                        title="Ver"
                      >
                        <EyeIcon className="h-5 w-5 icon-interactive" />
                      </Link>
                      <Link
                        to={`/host/properties/edit/${property.id}`}
                        className="text-accent-600 hover:text-accent-900"
                        title="Editar"
                      >
                        <PencilIcon className="h-5 w-5 icon-accent" />
                      </Link>
                      <button
                        onClick={() => handleDelete(property.id)}
                        disabled={deletingId === property.id}
                        className="text-error-600 hover:text-error-900 disabled:opacity-50"
                        title="Eliminar"
                      >
                        <TrashIcon className="h-5 w-5 icon-error" />
                      </button>
                    </div>
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

export default MyProperties;