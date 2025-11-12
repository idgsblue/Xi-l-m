import React, { useState, useEffect } from 'react';
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
  UsersIcon,
  CloudArrowUpIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const AddProperty = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [images, setImages] = useState([]); // Array de { file, preview, uploaded: false }
  const [uploadedImageUrls, setUploadedImageUrls] = useState([]); // URLs en Firebase
  const [services, setServices] = useState([]);
  const [newService, setNewService] = useState('');
  const [accommodationTypes, setAccommodationTypes] = useState([]);
  const [selectedAccommodationType, setSelectedAccommodationType] = useState(null);
  const [priceValidation, setPriceValidation] = useState({ isValid: true, message: '' });
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm();

  const watchAccommodationType = watch('accommodation_type_id');
  const watchPrice = watch('price_per_night');

  useEffect(() => {
    loadAccommodationTypes();
  }, []);

  // Validar precio cuando cambia el tipo de alojamiento o el precio
  useEffect(() => {
    if (watchAccommodationType && watchPrice) {
      validatePrice(watchAccommodationType, watchPrice);
    } else {
      setPriceValidation({ isValid: true, message: '' });
    }
  }, [watchAccommodationType, watchPrice]);

  const loadAccommodationTypes = async () => {
    try {
      const response = await api.get('/accommodation-types');
      setAccommodationTypes(response.data.accommodationTypes || []);
    } catch (error) {
      console.error('Error cargando tipos de alojamiento:', error);
      toast.error('Error cargando tipos de alojamiento');
    }
  };

  const validatePrice = (typeId, price) => {
    if (!typeId || !price) {
      setPriceValidation({ isValid: true, message: '' });
      return;
    }

    const type = accommodationTypes.find(t => t.id === parseInt(typeId));
    if (!type) {
      setPriceValidation({ isValid: true, message: '' });
      return;
    }

    setSelectedAccommodationType(type);

    const numPrice = parseFloat(price);
    const minPrice = type.min_price ? parseFloat(type.min_price) : null;
    const maxPrice = type.max_price ? parseFloat(type.max_price) : null;

    if (minPrice && numPrice < minPrice) {
      setPriceValidation({
        isValid: false,
        message: `El precio está por debajo del mínimo permitido ($${minPrice} MXN)`
      });
      return;
    }

    if (maxPrice && numPrice > maxPrice) {
      setPriceValidation({
        isValid: false,
        message: `El precio está por encima del máximo permitido ($${maxPrice} MXN)`
      });
      return;
    }

    setPriceValidation({
      isValid: true,
      message: `✓ Precio válido para ${type.name}`
    });
  };

  // Manejar selección de imágenes (solo preview local)
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    
    if (images.length + files.length > 5) {
      toast.error('Máximo 5 imágenes permitidas');
      return;
    }

    const newImages = [];

    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} excede el tamaño máximo de 5MB`);
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        newImages.push({
          file,
          preview: reader.result,
          uploaded: false
        });

        if (newImages.length === files.length) {
          setImages(prev => [...prev, ...newImages]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Subir imágenes a Firebase Storage
  const uploadImagesToFirebase = async () => {
    setUploadingImages(true);
    const uploadedUrls = [];

    try {
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        
        // Si ya está subida, usar la URL existente
        if (image.uploaded && image.firebaseUrl) {
          uploadedUrls.push(image.firebaseUrl);
          continue;
        }

        // Subir imagen a Firebase
        const formData = new FormData();
        formData.append('image', image.file);

        toast.info(`Subiendo imagen ${i + 1} de ${images.length}...`);

        const response = await api.post('/upload/single', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        const imageUrl = response.data.url;
        uploadedUrls.push(imageUrl);

        // Marcar imagen como subida
        setImages(prev => prev.map((img, idx) => 
          idx === i ? { ...img, uploaded: true, firebaseUrl: imageUrl } : img
        ));
      }

      setUploadedImageUrls(uploadedUrls);
      toast.success('¡Todas las imágenes subidas correctamente!');
      return uploadedUrls;

    } catch (error) {
      console.error('Error subiendo imágenes:', error);
      toast.error(error.response?.data?.error || 'Error subiendo imágenes');
      throw error;
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setUploadedImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const addService = () => {
    const serviceId = parseInt(newService.trim());
    
    if (isNaN(serviceId)) {
      toast.error('El ID del servicio debe ser un número');
      return;
    }
    
    if (services.includes(serviceId)) {
      toast.error('Este servicio ya fue agregado');
      return;
    }
    
    setServices(prev => [...prev, serviceId]);
    setNewService('');
  };

  const removeService = (index) => {
    setServices(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data) => {
    // Validar imágenes
    if (images.length === 0) {
      toast.error('Agrega al menos una imagen');
      return;
    }

    // Validar precio antes de enviar
    if (!priceValidation.isValid) {
      toast.error('Por favor corrige el precio antes de continuar');
      return;
    }

    setLoading(true);
    
    try {
      // 1. Primero subir las imágenes a Firebase
      toast.info('Subiendo imágenes...');
      const imageUrls = await uploadImagesToFirebase();

      // 2. Crear la propiedad con las URLs de Firebase
      const propertyData = {
        title: data.title,
        description: data.description,
        location: data.location,
        price_per_night: parseFloat(data.price_per_night),
        capacity: parseInt(data.capacity),
        accommodation_type_id: data.accommodation_type_id ? parseInt(data.accommodation_type_id) : null,
        services: services, // Array de IDs de servicios
        images: imageUrls // URLs de Firebase Storage
      };

      toast.info('Creando propiedad...');
      const response = await api.post('/properties', propertyData);

      toast.success(
        '¡Propiedad creada exitosamente! Será revisada por un administrador antes de poder anunciarla.',
        { autoClose: 5000 }
      );
      navigate('/host/properties');

    } catch (error) {
      console.error('Error creando propiedad:', error);
      
      // Mostrar mensaje específico de validación de precio si existe
      if (error.response?.data?.minPrice || error.response?.data?.maxPrice) {
        toast.error(
          error.response.data.error,
          { autoClose: 5000 }
        );
      } else {
        toast.error(error.response?.data?.error || 'Error creando propiedad');
      }
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

      {/* Alerta informativa sobre el proceso */}
      <div className="mb-6 card bg-blue-50 border-blue-200">
        <div className="flex">
          <div className="flex-shrink-0">
            <InformationCircleIcon className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Proceso de Aprobación de Propiedades
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Tu propiedad quedará en estado <strong>"Pendiente de Aprobación"</strong></li>
                <li>Un administrador la revisará en un plazo de 24-48 horas</li>
                <li>Si es aprobada, podrás <strong>anunciarla</strong> cuando lo desees</li>
                <li>Si es rechazada, recibirás un email con el motivo y podrás corregirla</li>
              </ul>
            </div>
          </div>
        </div>
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
                Título de la Propiedad *
              </label>
              <div className="mt-1 relative">
                <HomeIcon className="absolute left-3 top-2.5 h-5 w-5 text-neutral-400" />
                <input
                  {...register('title', {
                    required: 'El título es requerido',
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
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
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
                placeholder="Describe tu propiedad... Menciona las características principales, ubicación, y lo que hace especial a tu espacio."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Ubicación */}
        <div>
          <h2 className="text-lg font-semibold text-accent-900 mb-4">
            Ubicación
          </h2>

          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700">
                Ubicación *
              </label>
              <div className="mt-1 relative">
                <MapPinIcon className="absolute left-3 top-2.5 h-5 w-5 text-neutral-400" />
                <input
                  {...register('location', {
                    required: 'La ubicación es requerida'
                  })}
                  type="text"
                  className="input pl-10"
                  placeholder="Arroyo Seco, Querétaro"
                />
              </div>
              {errors.location && (
                <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
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
            {/* Tipo de Alojamiento */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700">
                Tipo de Alojamiento *
              </label>
              <select
                {...register('accommodation_type_id', {
                  required: 'Selecciona un tipo de alojamiento'
                })}
                className="input mt-1"
              >
                <option value="">Seleccionar tipo...</option>
                {accommodationTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                    {type.min_price && type.max_price && 
                      ` (Rango: $${type.min_price} - $${type.max_price} MXN/noche)`
                    }
                  </option>
                ))}
              </select>
              {errors.accommodation_type_id && (
                <p className="mt-1 text-sm text-red-600">{errors.accommodation_type_id.message}</p>
              )}
              
              {/* Información del tipo seleccionado */}
              {selectedAccommodationType && (
                <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-md">
                  <p className="text-sm text-gray-700">
                    <strong>{selectedAccommodationType.name}</strong>
                  </p>
                  {selectedAccommodationType.description && (
                    <p className="text-xs text-gray-600 mt-1">
                      {selectedAccommodationType.description}
                    </p>
                  )}
                  {selectedAccommodationType.platform_commission_percentage && (
                    <p className="text-xs text-amber-700 mt-2 font-medium">
                      ⚠️ Comisión de plataforma: {selectedAccommodationType.platform_commission_percentage}%
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Precio por Noche */}
            <div>
              <label className="block text-sm font-medium text-neutral-700">
                Precio por Noche (MXN) *
              </label>
              <div className="mt-1 relative">
                <CurrencyDollarIcon className="absolute left-3 top-2.5 h-5 w-5 text-neutral-400" />
                <input
                  {...register('price_per_night', {
                    required: 'El precio es requerido',
                    min: {
                      value: 0,
                      message: 'El precio debe ser positivo'
                    }
                  })}
                  type="number"
                  step="0.01"
                  className={`input pl-10 ${
                    priceValidation.isValid ? '' : 'border-red-500 focus:ring-red-500 focus:border-red-500'
                  }`}
                  placeholder="2500.00"
                />
              </div>
              {errors.price_per_night && (
                <p className="mt-1 text-sm text-red-600">{errors.price_per_night.message}</p>
              )}
              
              {/* Validación de rango de precio */}
              {priceValidation.message && (
                <div className={`mt-2 flex items-start ${priceValidation.isValid ? 'text-green-600' : 'text-red-600'}`}>
                  {priceValidation.isValid ? (
                    <InformationCircleIcon className="h-5 w-5 mr-1 flex-shrink-0" />
                  ) : (
                    <ExclamationTriangleIcon className="h-5 w-5 mr-1 flex-shrink-0" />
                  )}
                  <p className="text-sm">{priceValidation.message}</p>
                </div>
              )}
              
              {selectedAccommodationType && selectedAccommodationType.min_price && selectedAccommodationType.max_price && (
                <p className="mt-1 text-xs text-gray-500">
                  Rango permitido: ${selectedAccommodationType.min_price} - ${selectedAccommodationType.max_price} MXN
                </p>
              )}
            </div>

            {/* Capacidad */}
            <div>
              <label className="block text-sm font-medium text-neutral-700">
                Capacidad (personas) *
              </label>
              <div className="mt-1 relative">
                <UsersIcon className="absolute left-3 top-2.5 h-5 w-5 text-neutral-400" />
                <input
                  {...register('capacity', {
                    required: 'Requerido',
                    min: {
                      value: 1,
                      message: 'Mínimo 1 persona'
                    },
                    max: {
                      value: 20,
                      message: 'Máximo 20 personas'
                    }
                  })}
                  type="number"
                  className="input pl-10"
                  placeholder="4"
                />
              </div>
              {errors.capacity && (
                <p className="mt-1 text-sm text-red-600">{errors.capacity.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Servicios */}
        <div>
          <h2 className="text-lg font-semibold text-accent-900 mb-4">
            Servicios
          </h2>
            <label className="block text-sm font-medium text-neutral-700">
              1: WiFi. 2: Piscina. 3: Estacionamiento. 4: Cocina. 5: Aire Acondicionado. 6: TV. 7: Lavadora.
            </label>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newService}
              onChange={(e) => setNewService(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addService())}
              placeholder="Número del servicio (ejemplo: 1, 2, 3...)"
              className="input flex-1"
            />
            <button
              type="button"
              onClick={addService}
              className="btn-neutral"
            >
              Agregar
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {services.map((service, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-secondary-100 text-secondary-800"
              >
                Servicio ID: {service}
                <button
                  type="button"
                  onClick={() => removeService(index)}
                  className="ml-2 text-secondary-600 hover:text-secondary-800"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Imágenes */}
        <div>
          <h2 className="text-lg font-semibold text-accent-900 mb-4">
            Imágenes * (Máximo 5, 5MB cada una)
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((image, index) => (
              <div key={index} className="relative">
                <img
                  src={image.preview}
                  alt={`Preview ${index + 1}`}
                  className="h-32 w-full object-cover rounded-lg"
                />
                {image.uploaded && (
                  <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                    <CloudArrowUpIcon className="h-4 w-4 inline mr-1" />
                    Subida
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
            
            {images.length < 5 && (
              <label className="h-32 flex flex-col items-center justify-center border-2 border-neutral-300 border-dashed rounded-lg cursor-pointer hover:border-neutral-400">
                <PhotoIcon className="h-8 w-8 text-neutral-400" />
                <span className="mt-2 text-sm text-neutral-600">Agregar imagen</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  disabled={uploadingImages || loading}
                />
              </label>
            )}
          </div>

          {images.length > 0 && !images.every(img => img.uploaded) && (
            <p className="mt-2 text-sm text-amber-600">
              ℹ️ Las imágenes se subirán automáticamente al crear la propiedad
            </p>
          )}
        </div>

        {/* Botones */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/host/properties')}
            className="btn-neutral"
            disabled={loading || uploadingImages}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || uploadingImages || images.length === 0 || !priceValidation.isValid}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploadingImages ? 'Subiendo imágenes...' : loading ? 'Creando...' : 'Crear Propiedad'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProperty;