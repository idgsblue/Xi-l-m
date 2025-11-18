import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const AccommodationTypeModal = ({ isOpen, onClose, onSubmit, type, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    min_price: '',
    max_price: '',
    platform_commission_percentage: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (type) {
      setFormData({
        name: type.name || '',
        min_price: type.min_price || '',
        max_price: type.max_price || '',
        platform_commission_percentage: type.platform_commission_percentage || ''
      });
    } else {
      setFormData({
        name: '',
        min_price: '',
        max_price: '',
        platform_commission_percentage: ''
      });
    }
    setErrors({});
  }, [type, isOpen]);

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (formData.min_price && isNaN(formData.min_price)) {
      newErrors.min_price = 'Debe ser un número válido';
    }

    if (formData.max_price && isNaN(formData.max_price)) {
      newErrors.max_price = 'Debe ser un número válido';
    }

    if (formData.min_price && formData.max_price) {
      if (parseFloat(formData.max_price) <= parseFloat(formData.min_price)) {
        newErrors.max_price = 'El precio máximo debe ser mayor al mínimo';
      }
    }

    if (formData.platform_commission_percentage &&
        (isNaN(formData.platform_commission_percentage) ||
         formData.platform_commission_percentage < 0 ||
         formData.platform_commission_percentage > 15)) {
      newErrors.platform_commission_percentage = 'Debe ser un número entre 0 y 15';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-end sm:items-center justify-center p-0 sm:p-4">
        <div className="fixed inset-0 bg-neutral-900 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <div className="relative bg-white dark:bg-neutral-800 rounded-t-2xl sm:rounded-lg shadow-xl max-w-lg w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg sm:text-xl font-semibold text-neutral-900 dark:text-white">
              {type ? 'Editar Tipo de Alojamiento' : 'Nuevo Tipo de Alojamiento'}
            </h3>
            <button
              onClick={onClose}
              className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg"
              aria-label="Cerrar modal"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? 'input-error' : 'input'}
                placeholder="Ej: Hotel, Cabaña, Camping..."
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Precio Mínimo (MXN)
                </label>
                <input
                  type="number"
                  name="min_price"
                  value={formData.min_price}
                  onChange={handleChange}
                  className={`${errors.min_price ? 'input-error border-red-500 dark:border-red-500' : 'input border-neutral-300 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white'} mt-1 block w-full rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400`}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
                {errors.min_price && (
                  <p className="mt-1 text-xs sm:text-sm text-red-600 dark:text-red-400">{errors.min_price}</p>
                )}
              </div>

              <div>
                <label className="label text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Precio Máximo (MXN)
                </label>
                <input
                  type="number"
                  name="max_price"
                  value={formData.max_price}
                  onChange={handleChange}
                  className={`${errors.max_price ? 'input-error border-red-500 dark:border-red-500' : 'input border-neutral-300 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white'} mt-1 block w-full rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400`}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
                {errors.max_price && (
                  <p className="mt-1 text-xs sm:text-sm text-red-600 dark:text-red-400">{errors.max_price}</p>
                )}
              </div>
            </div>

            <div>
              <label className="label">
                Comisión de Plataforma (%) <span className="text-neutral-500 text-sm">Máximo 15%</span>
              </label>
              <input
                type="number"
                name="platform_commission_percentage"
                value={formData.platform_commission_percentage}
                onChange={handleChange}
                className={errors.platform_commission_percentage ? 'input-error' : 'input'}
                placeholder="10.00"
                step="0.01"
                min="0"
                max="15"
              />
              {errors.platform_commission_percentage && (
                <p className="mt-1 text-sm text-red-600">{errors.platform_commission_percentage}</p>
              )}
              <p className="mt-1 text-xs text-neutral-500">
                La comisión no puede exceder el 15% según las políticas de la plataforma
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-neutral-200 dark:border-neutral-700">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-600 focus:ring-2 focus:ring-neutral-500 dark:focus:ring-neutral-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md transition-all"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Guardando...
                  </span>
                ) : (
                  type ? 'Actualizar' : 'Crear'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AccommodationTypeModal;