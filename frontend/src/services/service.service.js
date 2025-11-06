import api from './api';

const serviceService = {
  getAll: async () => {
    try {
      const response = await api.get('/services');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Error al obtener servicios' };
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/services/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Error al obtener servicio' };
    }
  }
};

export default serviceService;