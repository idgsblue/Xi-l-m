import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import accommodationTypeService from '../../services/accommodationType.service';
import AccommodationTypeModal from '../../components/admin/AccommodationTypeModal';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  HomeIcon
} from '@heroicons/react/24/outline';

const AccommodationTypes = () => {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadTypes();
  }, []);

  const loadTypes = async () => {
    try {
      setLoading(true);
      const data = await accommodationTypeService.getAll();
      setTypes(data.accommodationTypes || []);
    } catch (error) {
      toast.error(error.error || 'Error al cargar tipos de alojamiento');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedType(null);
    setModalOpen(true);
  };

  const handleEdit = (type) => {
    setSelectedType(type);
    setModalOpen(true);
  };

  const handleDelete = (type) => {
    setSelectedType(type);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async (formData) => {
    try {
      setSubmitting(true);
      
      if (selectedType) {
        const response = await accommodationTypeService.update(selectedType.id, formData);
        toast.success(response.message || 'Tipo actualizado exitosamente');
        
        if (response.warning) {
          toast.warning(response.warning);
        }
      } else {
        const response = await accommodationTypeService.create(formData);
        toast.success(response.message || 'Tipo creado exitosamente');
      }

      setModalOpen(false);
      loadTypes();
    } catch (error) {
      toast.error(error.error || 'Error al guardar tipo de alojamiento');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    try {
      setSubmitting(true);
      const response = await accommodationTypeService.delete(selectedType.id);
      toast.success(response.message || 'Tipo eliminado exitosamente');
      setDeleteDialogOpen(false);
      loadTypes();
    } catch (error) {
      toast.error(error.error || 'Error al eliminar tipo de alojamiento');
    } finally {
      setSubmitting(false);
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
    <div className="space-y-6 px-4 sm:px-6 lg:px-8 py-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="heading-2 text-2xl sm:text-3xl">Tipos de Alojamiento</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2 text-sm sm:text-base">
            Gestiona los tipos de alojamiento, rangos de precios y comisiones
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="btn-primary flex items-center justify-center w-full sm:w-auto px-4 py-2.5 text-sm sm:text-base font-medium rounded-lg shadow-sm hover:shadow-md transition-all"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          <span className="hidden sm:inline">Nuevo Tipo</span>
          <span className="sm:hidden">Nuevo</span>
        </button>
      </div>

      {types.length === 0 ? (
        <div className="card text-center py-12">
          <HomeIcon className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
          <p className="text-lg text-neutral-600">No hay tipos de alojamiento registrados</p>
          <button
            onClick={handleCreate}
            className="btn-primary mt-4"
          >
            Crear Primer Tipo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {types.map((type) => (
            <div key={type.id} className="card bg-white dark:bg-neutral-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 sm:p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-semibold text-neutral-900 dark:text-white truncate">{type.name}</h3>
                  {type.propertyCount !== undefined && (
                    <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                      {type.propertyCount} {type.propertyCount === 1 ? 'propiedad' : 'propiedades'}
                    </p>
                  )}
                </div>
                <div className="flex space-x-1 sm:space-x-2 ml-2">
                  <button
                    onClick={() => handleEdit(type)}
                    className="p-2 text-neutral-700 dark:text-neutral-300 hover:text-blue-700 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                    title="Editar"
                    aria-label="Editar tipo de alojamiento"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(type)}
                    className="p-2 text-neutral-700 dark:text-neutral-300 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                    title="Eliminar"
                    aria-label="Eliminar tipo de alojamiento"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="border-t border-neutral-200 dark:border-neutral-700 pt-3">
                  <p className="text-xs sm:text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-2">Rango de Precios</p>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Mínimo:
                    </span>
                    <span className="text-sm font-bold text-green-700 dark:text-green-400">
                      {type.min_price ? `$${parseFloat(type.min_price).toFixed(2)}` : 'No definido'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Máximo:
                    </span>
                    <span className="text-sm font-bold text-green-700 dark:text-green-400">
                      {type.max_price ? `$${parseFloat(type.max_price).toFixed(2)}` : 'No definido'}
                    </span>
                  </div>
                </div>

                <div className="border-t border-neutral-200 dark:border-neutral-700 pt-3">
                  <div className="flex items-center justify-between py-1">
                    <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Comisión:
                    </span>
                    <span className="text-sm font-bold text-blue-700 dark:text-blue-400">
                      {type.platform_commission_percentage ? `${parseFloat(type.platform_commission_percentage).toFixed(2)}%` : 'No definida'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AccommodationTypeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        type={selectedType}
        isLoading={submitting}
      />

      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Eliminar Tipo de Alojamiento"
        message={`¿Estás seguro de que deseas eliminar "${selectedType?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        isLoading={submitting}
      />
    </div>
  );
};

export default AccommodationTypes;