import api from './api';

const accommodationTypeService = {
  // Obtener todos los tipos
  getAll: async () => {
    try {
      const response = await api.get('/accommodation-types');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Error al obtener tipos de alojamiento' };
    }
  },

  // Obtener un tipo por ID
  getById: async (id) => {
    try {
      const response = await api.get(`/accommodation-types/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Error al obtener tipo de alojamiento' };
    }
  },

  // Crear nuevo tipo
  create: async (data) => {
    try {
      const response = await api.post('/accommodation-types', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Error al crear tipo de alojamiento' };
    }
  },

  // Actualizar tipo
  update: async (id, data) => {
    try {
      const response = await api.put(`/accommodation-types/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Error al actualizar tipo de alojamiento' };
    }
  },

  // Eliminar tipo
  delete: async (id) => {
    try {
      const response = await api.delete(`/accommodation-types/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Error al eliminar tipo de alojamiento' };
    }
  }
};

export default accommodationTypeService;