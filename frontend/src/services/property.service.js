// src/services/property.service.js
import api from './api';

const propertyService = {
  // Obtener todas las propiedades (con filtros opcionales)
  getAllProperties: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await api.get(`/properties?${queryParams}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener propiedades' };
    }
  },

  // Buscar propiedades
  searchProperties: async (searchParams) => {
    try {
      const response = await api.post('/properties/search', searchParams);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error en la búsqueda' };
    }
  },

  // Obtener propiedad por ID
  getPropertyById: async (id) => {
    try {
      const response = await api.get(`/properties/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener propiedad' };
    }
  },

  // Crear nueva propiedad
  createProperty: async (propertyData) => {
    try {
      const response = await api.post('/properties', propertyData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al crear propiedad' };
    }
  },

  // Actualizar propiedad
  updateProperty: async (id, propertyData) => {
    try {
      const response = await api.put(`/properties/${id}`, propertyData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al actualizar propiedad' };
    }
  },

  // Eliminar propiedad
  deleteProperty: async (id) => {
    try {
      const response = await api.delete(`/properties/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al eliminar propiedad' };
    }
  },

  // Subir imágenes de propiedad
  uploadImages: async (propertyId, images) => {
    try {
      const formData = new FormData();
      images.forEach((image) => {
        formData.append('images', image);
      });

      const response = await api.post(`/properties/${propertyId}/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al subir imágenes' };
    }
  },

  // Eliminar imagen de propiedad
  deleteImage: async (propertyId, imageId) => {
    try {
      const response = await api.delete(`/properties/${propertyId}/images/${imageId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al eliminar imagen' };
    }
  },

  // Obtener disponibilidad de propiedad
  getAvailability: async (propertyId, startDate, endDate) => {
    try {
      const response = await api.get(`/properties/${propertyId}/availability`, {
        params: { startDate, endDate },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener disponibilidad' };
    }
  },

  // Obtener mis propiedades (host)
  getMyProperties: async () => {
    try {
      const response = await api.get('/properties/my-properties');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener mis propiedades' };
    }
  },

  // Obtener reviews de una propiedad
  getPropertyReviews: async (propertyId) => {
    try {
      const response = await api.get(`/properties/${propertyId}/reviews`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener reviews' };
    }
  },

  // Agregar review a una propiedad
  addReview: async (propertyId, reviewData) => {
    try {
      const response = await api.post(`/properties/${propertyId}/reviews`, reviewData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al agregar review' };
    }
  },

  // Obtener propiedades destacadas
  getFeaturedProperties: async (limit = 6) => {
    try {
      const response = await api.get(`/properties/featured?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener propiedades destacadas' };
    }
  },

  // Obtener propiedades cercanas
  getNearbyProperties: async (latitude, longitude, radius = 10) => {
    try {
      const response = await api.get('/properties/nearby', {
        params: { latitude, longitude, radius },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener propiedades cercanas' };
    }
  },
};

export default propertyService;
