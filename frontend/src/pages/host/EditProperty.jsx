import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';

const EditProperty = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(null);
  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);

  useEffect(() => {
    loadProperty();
    loadServices();
  }, [id]);

  const loadServices = async () => {
    try {
      const response = await api.get('/services');
      setServices(response.data.services || []);
    } catch (error) {
      console.error('Error loading services:', error);
    }
  };

  const loadProperty = async () => {
    try {
      const response = await api.get(`/properties/${id}`);
      const property = response.data.property;
      
      // Mapear los campos del backend al formato del frontend
      setFormData({
        title: property.title,
        description: property.description,
        location: property.location,
        pricePerNight: property.price_per_night,
        maxGuests: property.capacity,
        accommodation_type_id: property.accommodation_type_id || '',
      });

      // Establecer servicios seleccionados
      if (property.services && property.services.length > 0) {
        setSelectedServices(property.services.map(s => s.id));
      }
    } catch (error) {
      console.error('Error loading property:', error);
      toast.error(error.response?.data?.error || 'Error al cargar propiedad');
      navigate('/host/properties');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleServiceToggle = (serviceId) => {
    setSelectedServices(prev => {
      if (prev.includes(serviceId)) {
        return prev.filter(id => id !== serviceId);
      } else {
        return [...prev, serviceId];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Mapear los campos del frontend al formato del backend
      const dataToSend = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        price_per_night: parseFloat(formData.pricePerNight),
        capacity: parseInt(formData.maxGuests),
        accommodation_type_id: formData.accommodation_type_id || null,
        services: selectedServices
      };

      await api.put(`/properties/${id}`, dataToSend);
      toast.success('Propiedad actualizada exitosamente');
      navigate('/host/properties');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al actualizar propiedad');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !formData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-accent-900 mb-8">Editar Propiedad</h1>

      <form onSubmit={handleSubmit} className="max-w-3xl">
        <div className="card space-y-6">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Título *
            </label>
            <input
              type="text"
              name="title"
              required
              className="input w-full"
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Descripción *
            </label>
            <textarea
              name="description"
              required
              rows="4"
              className="input w-full"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Ubicación *
            </label>
            <input
              type="text"
              name="location"
              required
              className="input w-full"
              value={formData.location}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Precio por noche (MXN) *
              </label>
              <input
                type="number"
                name="pricePerNight"
                required
                min="0"
                step="0.01"
                className="input w-full"
                value={formData.pricePerNight}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Huéspedes máximos *
              </label>
              <input
                type="number"
                name="maxGuests"
                required
                min="1"
                className="input w-full"
                value={formData.maxGuests}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Servicios */}
          {services.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-3">
                Servicios
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {services.map((service) => (
                  <label
                    key={service.id}
                    className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-neutral-50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedServices.includes(service.id)}
                      onChange={() => handleServiceToggle(service.id)}
                      className="mr-3 h-4 w-4 text-secondary-600 focus:ring-secondary-500 border-neutral-300 rounded"
                    />
                    <span className="text-sm text-neutral-700">{service.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/host/properties')}
              className="btn-neutral"
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditProperty;