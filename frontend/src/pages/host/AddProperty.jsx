import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../../services/api';
import { toast } from 'react-toastify';
import {
  PhotoIcon,
  XMarkIcon,
  HomeIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  UsersIcon
} from '@heroicons/react/24/outline';

const AddProperty = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [newAmenity, setNewAmenity] = useState('');
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (images.length + files.length > 5) {
      toast.error('Máximo 5 imágenes permitidas');
      return;
    }

    files.forEach(file => {
      if (file.size > 2 * 1024 * 1024) {
        toast.error(`${file.name} excede el tamaño máximo de 2MB`);
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [...prev, {
          file,
          preview: reader.result
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const addAmenity = () => {
    if (newAmenity.trim() && !amenities.includes(newAmenity.trim())) {
      setAmenities(prev => [...prev, newAmenity.trim()]);
      setNewAmenity('');
    }
  };

  const removeAmenity = (index) => {
    setAmenities(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data) => {
    if (images.length === 0) {
      toast.error('Agrega al menos una imagen');
      return;
    }

    setLoading(true);
    
    try {
      const formData = new FormData();
      
      // Agregar datos del formulario
      Object.keys(data).forEach(key => {
        formData.append(key, data[key]);
      });
      
      // Agregar amenidades
      formData.append('amenities', amenities.join(','));
      
      // Agregar imágenes
      images.forEach(img => {
        formData.append('images', img.file);
      });

      const response = await api.post('/properties', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Propiedad creada y enviada para aprobación');
      navigate('/host/properties');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error creando propiedad');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-accent-900">Agregar Nueva Propiedad</h1>
        <p className="mt-2 text-neutral-600">
          Completa la información de tu propiedad. Será revisada antes de publicarse.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 card">
        {/* Información Básica */}
        <div>
          <h2 className="text-lg font-semibold text-accent-900 mb-4">
            Información Básica
          </h2>
          
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700">
                Nombre de la Propiedad *
              </label>
              <div className="mt-1 relative">
                <HomeIcon className="absolute left-3 top-2.5 h-5 w-5 icon-muted" />
                <input
                  {...register('name', {
                    required: 'El nombre es requerido',
                    minLength: {
                      value: 3,
                      message: 'Mínimo 3 caracteres'
                    }
                  })}
                  type="text"
                  className="input pl-10"
                  placeholder="Casa con vista al río"
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700">
                Descripción *
              </label>
              <textarea
                {...register('description', {
                  required: 'La descripción es requerida',
                  minLength: {
                    value: 10,
                    message: 'Mínimo 10 caracteres'
                  }
                })}
                rows={4}
                className="input mt-1"
                placeholder="Describe tu propiedad..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700">
                Descripción Corta (para búsquedas)
              </label>
              <input
                {...register('shortDescription', {
                  maxLength: {
                    value: 300,
                    message: 'Máximo 300 caracteres'
                  }
                })}
                type="text"
                className="input mt-1"
                placeholder="Breve descripción para las búsquedas"
              />
              {errors.shortDescription && (
                <p className="mt-1 text-sm text-red-600">{errors.shortDescription.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Ubicación */}
        <div>
          <h2 className="text-lg font-semibold text-accent-900 mb-4">
            Ubicación
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700">
                Dirección *
              </label>
              <div className="mt-1 relative">
                <MapPinIcon className="absolute left-3 top-2.5 h-5 w-5 icon-muted" />
                <input
                  {...register('address', {
                    required: 'La dirección es requerida'
                  })}
                  type="text"
                  className="input pl-10"
                  placeholder="Calle Principal #123"
                />
              </div>
              {errors.address && (
                <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700">
                Zona *
              </label>
              <input
                {...register('zone', {
                  required: 'La zona es requerida'
                })}
                type="text"
                className="input mt-1"
                placeholder="Centro, Río, Montaña..."
              />
              {errors.zone && (
                <p className="mt-1 text-sm text-red-600">{errors.zone.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Detalles */}
        <div>
          <h2 className="text-lg font-semibold text-accent-900 mb-4">
            Detalles de la Propiedad
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700">
                Precio por Noche (MXN) *
              </label>
              <div className="mt-1 relative">
                <CurrencyDollarIcon className="absolute left-3 top-2.5 h-5 w-5 icon-muted" />
                <input
                  {...register('pricePerNight', {
                    required: 'El precio es requerido',
                    min: {
                      value: 0,
                      message: 'El precio debe ser positivo'
                    }
                  })}
                  type="number"
                  className="input pl-10"
                  placeholder="1500"
                />
              </div>
              {errors.pricePerNight && (
                <p className="mt-1 text-sm text-red-600">{errors.pricePerNight.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700">
                Máximo de Huéspedes *
              </label>
              <div className="mt-1 relative">
                <UsersIcon className="absolute left-3 top-2.5 h-5 w-5 icon-muted" />
                <input
                  {...register('maxGuests', {
                    required: 'Requerido',
                    min: {
                      value: 1,
                      message: 'Mínimo 1 huésped'
                    },
                    max: {
                      value: 20,
                      message: 'Máximo 20 huéspedes'
                    }
                  })}
                  type="number"
                  className="input pl-10"
                  placeholder="4"
                />
              </div>
              {errors.maxGuests && (
                <p className="mt-1 text-sm text-red-600">{errors.maxGuests.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700">
                Habitaciones
              </label>
              <input
                {...register('bedrooms', {
                  min: {
                    value: 0,
                    message: 'Debe ser positivo'
                  }
                })}
                type="number"
                className="input mt-1"
                placeholder="2"
              />
              {errors.bedrooms && (
                <p className="mt-1 text-sm text-red-600">{errors.bedrooms.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700">
                Baños
              </label>
              <input
                {...register('bathrooms', {
                  min: {
                    value: 0,
                    message: 'Debe ser positivo'
                  }
                })}
                type="number"
                className="input mt-1"
                placeholder="1"
              />
              {errors.bathrooms && (
                <p className="mt-1 text-sm text-red-600">{errors.bathrooms.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Amenidades */}
        <div>
          <h2 className="text-lg font-semibold text-accent-900 mb-4">
            Amenidades
          </h2>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newAmenity}
              onChange={(e) => setNewAmenity(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
              placeholder="Agregar amenidad (WiFi, Estacionamiento, etc)"
              className="input flex-1"
            />
            <button
              type="button"
              onClick={addAmenity}
              className="btn-neutral"
            >
              Agregar
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {amenities.map((amenity, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-secondary-100 text-secondary-800"
              >
                {amenity}
                <button
                  type="button"
                  onClick={() => removeAmenity(index)}
                  className="ml-2 text-secondary-600 hover:text-secondary-800"
                >
                  <XMarkIcon className="h-4 w-4 icon-neutral" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Imágenes */}
        <div>
          <h2 className="text-lg font-semibold text-accent-900 mb-4">
            Imágenes * (Máximo 5, 2MB cada una)
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((image, index) => (
              <div key={index} className="relative">
                <img
                  src={image.preview}
                  alt={`Preview ${index + 1}`}
                  className="h-32 w-full object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                >
                  <XMarkIcon className="h-4 w-4 icon-neutral" />
                </button>
              </div>
            ))}
            
            {images.length < 5 && (
              <label className="h-32 flex flex-col items-center justify-center border-2 border-neutral-300 border-dashed rounded-lg cursor-pointer hover:border-neutral-400">
                <PhotoIcon className="h-8 w-8 icon-muted" />
                <span className="mt-2 text-sm text-neutral-600">Agregar imagen</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/host/properties')}
            className="btn-neutral"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creando...' : 'Crear Propiedad'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProperty;