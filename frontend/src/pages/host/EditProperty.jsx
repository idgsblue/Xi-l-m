import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import propertyService from '../../services/property.service';

const EditProperty = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    loadProperty();
  }, [id]);

  const loadProperty = async () => {
    try {
      const response = await propertyService.getPropertyById(id);
      setFormData(response.property);
    } catch (error) {
      console.error('Error loading property:', error);
      alert('Error al cargar propiedad');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      const newAmenities = checked
        ? [...(formData.amenities || []), value]
        : (formData.amenities || []).filter((a) => a !== value);
      setFormData({ ...formData, amenities: newAmenities });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await propertyService.updateProperty(id, formData);
      navigate('/host/properties');
    } catch (error) {
      alert('Error al actualizar propiedad: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !formData) {
    return <div className="container mx-auto px-4 py-8">Cargando...</div>;
  }

  const amenitiesList = [
    'WiFi',
    'Estacionamiento',
    'Alberca',
    'Cocina',
    'Aire acondicionado',
    'TV',
    'Lavadora',
    'Mascotas permitidas',
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-accent-900 mb-8">Editar Propiedad</h1>

      <form onSubmit={handleSubmit} className="max-w-3xl">
        <div className="card space-y-6">
          {/* Same form fields as AddProperty */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Título *</label>
            <input
              type="text"
              name="title"
              required
              className="input"
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Descripción *</label>
            <textarea
              name="description"
              required
              rows="4"
              className="input"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Precio por noche *</label>
              <input
                type="number"
                name="pricePerNight"
                required
                min="0"
                className="input"
                value={formData.pricePerNight}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Huéspedes máximos</label>
              <input
                type="number"
                name="maxGuests"
                min="1"
                className="input"
                value={formData.maxGuests}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Amenities */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Amenidades</label>
            <div className="grid grid-cols-2 gap-2">
              {amenitiesList.map((amenity) => (
                <label key={amenity} className="flex items-center text-neutral-700">
                  <input
                    type="checkbox"
                    value={amenity}
                    checked={(formData.amenities || []).includes(amenity)}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  {amenity}
                </label>
              ))}
            </div>
          </div>

          {/* Submit Buttons */}
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