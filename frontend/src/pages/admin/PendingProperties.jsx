import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import adminService from '../../services/admin.service';

const PendingProperties = () => {
  const queryClient = useQueryClient();
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);

  // Obtener propiedades pendientes
  const { data, isLoading, error } = useQuery(
    'pendingProperties',
    adminService.getPendingProperties
  );

  // Mutación para aprobar
  const approveMutation = useMutation(
    (propertyId) => adminService.approveProperty(propertyId),
    {
      onSuccess: (data) => {
        toast.success(data.message || 'Propiedad aprobada exitosamente');
        queryClient.invalidateQueries('pendingProperties');
      },
      onError: (error) => {
        toast.error(error.error || 'Error al aprobar propiedad');
      }
    }
  );

  // Mutación para rechazar
  const rejectMutation = useMutation(
    ({ propertyId, reason }) => adminService.rejectProperty(propertyId, reason),
    {
      onSuccess: (data) => {
        toast.success(data.message || 'Propiedad rechazada');
        queryClient.invalidateQueries('pendingProperties');
        setShowRejectModal(false);
        setSelectedProperty(null);
        setRejectionReason('');
      },
      onError: (error) => {
        toast.error(error.error || 'Error al rechazar propiedad');
      }
    }
  );

  const handleApprove = (property) => {
    if (window.confirm(`¿Aprobar la propiedad "${property.title}"?`)) {
      approveMutation.mutate(property.id);
    }
  };

  const handleRejectClick = (property) => {
    setSelectedProperty(property);
    setShowRejectModal(true);
  };

  const handleRejectSubmit = (e) => {
    e.preventDefault();
    if (rejectionReason.trim().length < 10) {
      toast.error('La razón debe tener al menos 10 caracteres');
      return;
    }
    rejectMutation.mutate({
      propertyId: selectedProperty.id,
      reason: rejectionReason.trim()
    });
  };

  const handleViewImages = (property) => {
    setSelectedImages(property.images || []);
    setShowImageModal(true);
  };

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
          Error al cargar propiedades: {error.message}
        </div>
      </div>
    );
  }

  const properties = data?.properties || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Propiedades Pendientes de Aprobación</h1>
        <p className="text-neutral-600 mt-2">
          {properties.length} {properties.length === 1 ? 'propiedad pendiente' : 'propiedades pendientes'}
        </p>
      </div>

      {properties.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-neutral-900">No hay propiedades pendientes</h3>
          <p className="mt-2 text-neutral-600">Todas las propiedades han sido revisadas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {properties.map((property) => (
            <div key={property.id} className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="md:flex">
                {/* Imagen principal */}
                <div className="md:w-1/3">
                  {property.images && property.images.length > 0 ? (
                    <div className="relative h-64 md:h-full cursor-pointer" onClick={() => handleViewImages(property)}>
                      <img
                        src={property.images[0].image_url}
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-sm">
                        {property.images.length} foto{property.images.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  ) : (
                    <div className="h-64 md:h-full bg-neutral-200 flex items-center justify-center">
                      <span className="text-neutral-500">Sin imágenes</span>
                    </div>
                  )}
                </div>

                {/* Detalles */}
                <div className="md:w-2/3 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-neutral-900">{property.title}</h3>
                      <p className="text-neutral-600 mt-1">{property.location}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-secondary-600">
                        ${parseFloat(property.price_per_night).toFixed(2)}
                      </p>
                      <p className="text-sm text-neutral-600">por noche</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-neutral-600">Tipo</p>
                      <p className="font-semibold">{property.accommodationType?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-600">Capacidad</p>
                      <p className="font-semibold">{property.capacity} persona{property.capacity !== 1 ? 's' : ''}</p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-600">Anfitrión</p>
                      <p className="font-semibold">{property.host?.full_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-600">Registrada</p>
                      <p className="font-semibold">{new Date(property.created_at).toLocaleDateString('es-MX')}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-neutral-600 mb-1">Descripción</p>
                    <p className="text-neutral-800 line-clamp-3">{property.description}</p>
                  </div>

                  {property.accommodationType && (
                    <div className="mb-4 p-3 bg-neutral-50 rounded">
                      <p className="text-sm text-neutral-600 mb-1">Comisión de plataforma</p>
                      <p className="font-semibold text-neutral-900">
                        {property.accommodationType.platform_commission_percentage}% 
                        (${((parseFloat(property.price_per_night) * parseFloat(property.accommodationType.platform_commission_percentage)) / 100).toFixed(2)})
                      </p>
                      <p className="text-sm text-neutral-600 mt-1">
                        Rango permitido: ${property.accommodationType.min_price} - ${property.accommodationType.max_price}
                      </p>
                    </div>
                  )}

                  <div className="mb-4">
                    <p className="text-sm text-neutral-600 mb-1">Contacto del anfitrión</p>
                    <p className="text-neutral-800">{property.host?.email}</p>
                    {property.host?.phone && <p className="text-neutral-800">{property.host.phone}</p>}
                  </div>

                  {/* Botones de acción */}
                  <div className="flex gap-3 pt-4 border-t border-neutral-200">
                    <button
                      onClick={() => handleApprove(property)}
                      disabled={approveMutation.isLoading}
                      className="flex-1 btn-primary flex items-center justify-center gap-2"
                    >
                      {approveMutation.isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Aprobando...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Aprobar</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleRejectClick(property)}
                      disabled={rejectMutation.isLoading}
                      className="flex-1 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span>Rechazar</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de rechazo */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Rechazar Propiedad</h3>
            <p className="text-neutral-600 mb-4">
              Estás a punto de rechazar: <strong>{selectedProperty?.title}</strong>
            </p>

            <form onSubmit={handleRejectSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Razón del rechazo (mínimo 10 caracteres) *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="input-field w-full min-h-[100px]"
                  placeholder="Explica la razón del rechazo para que el anfitrión pueda corregirla..."
                  required
                  minLength={10}
                />
                <p className="text-sm text-neutral-500 mt-1">
                  {rejectionReason.length} / 10 caracteres mínimo
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowRejectModal(false);
                    setSelectedProperty(null);
                    setRejectionReason('');
                  }}
                  className="flex-1 btn-secondary"
                  disabled={rejectMutation.isLoading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  disabled={rejectMutation.isLoading || rejectionReason.length < 10}
                >
                  {rejectMutation.isLoading ? 'Rechazando...' : 'Confirmar Rechazo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de imágenes */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50" onClick={() => setShowImageModal(false)}>
          <div className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white text-xl font-bold">Galería de imágenes</h3>
              <button
                onClick={() => setShowImageModal(false)}
                className="text-white hover:text-neutral-300"
              >
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {selectedImages.map((image, index) => (
                <img
                  key={image.id || index}
                  src={image.image_url}
                  alt={`Imagen ${index + 1}`}
                  className="w-full h-64 object-cover rounded-lg"
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingProperties;