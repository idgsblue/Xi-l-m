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
         formData.platform_commission_percentage > 100)) {
      newErrors.platform_commission_percentage = 'Debe ser un número entre 0 y 100';
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
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-neutral-900 bg-opacity-50 transition-opacity" onClick={onClose}></div>

        <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-neutral-900">
              {type ? 'Editar Tipo de Alojamiento' : 'Nuevo Tipo de Alojamiento'}
            </h3>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-600 transition-colors"
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Precio Mínimo (MXN)</label>
                <input
                  type="number"
                  name="min_price"
                  value={formData.min_price}
                  onChange={handleChange}
                  className={errors.min_price ? 'input-error' : 'input'}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
                {errors.min_price && (
                  <p className="mt-1 text-sm text-red-600">{errors.min_price}</p>
                )}
              </div>

              <div>
                <label className="label">Precio Máximo (MXN)</label>
                <input
                  type="number"
                  name="max_price"
                  value={formData.max_price}
                  onChange={handleChange}
                  className={errors.max_price ? 'input-error' : 'input'}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
                {errors.max_price && (
                  <p className="mt-1 text-sm text-red-600">{errors.max_price}</p>
                )}
              </div>
            </div>

            <div>
              <label className="label">Comisión de Plataforma (%)</label>
              <input
                type="number"
                name="platform_commission_percentage"
                value={formData.platform_commission_percentage}
                onChange={handleChange}
                className={errors.platform_commission_percentage ? 'input-error' : 'input'}
                placeholder="10.00"
                step="0.01"
                min="0"
                max="100"
              />
              {errors.platform_commission_percentage && (
                <p className="mt-1 text-sm text-red-600">{errors.platform_commission_percentage}</p>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="btn-neutral"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary disabled:opacity-50"
              >
                {isLoading ? 'Guardando...' : (type ? 'Actualizar' : 'Crear')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AccommodationTypeModal;