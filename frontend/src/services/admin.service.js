import api from './api';

const adminService = {
  // Dashboard
  getDashboard: async () => {
    try {
      const response = await api.get('/admin/dashboard');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener dashboard' };
    }
  },

  // Propiedades pendientes
  getPendingProperties: async () => {
    try {
      const response = await api.get('/admin/properties/pending');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener propiedades pendientes' };
    }
  },

  // Aprobar propiedad
  approveProperty: async (propertyId) => {
    try {
      const response = await api.post(`/admin/properties/${propertyId}/approve`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al aprobar propiedad' };
    }
  },

  // Rechazar propiedad
  rejectProperty: async (propertyId, reason) => {
    try {
      const response = await api.post(`/admin/properties/${propertyId}/reject`, { reason });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al rechazar propiedad' };
    }
  },

  // Usuarios
  getUsers: async (filters = {}) => {
    try {
      // Limpiar filtros vacíos
      const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {});
      
      const queryParams = new URLSearchParams(cleanFilters).toString();
      const response = await api.get(`/admin/users${queryParams ? `?${queryParams}` : ''}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener usuarios' };
    }
  },

  // Cambiar estado de usuario
  toggleUserStatus: async (userId, isActive) => {
    try {
      const response = await api.patch(`/admin/users/${userId}/status`, { isActive });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al cambiar estado de usuario' };
    }
  },

  // Cambiar rol de usuario
  changeUserRole: async (userId, role) => {
    try {
      const response = await api.patch(`/admin/users/${userId}/role`, { role });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al cambiar rol de usuario' };
    }
  },

  // Reportes
  generateReport: async (type, startDate, endDate) => {
    try {
      const params = { type };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      const response = await api.get('/admin/reports', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al generar reporte' };
    }
  },

  // Reservas
  getAllBookings: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await api.get(`/admin/bookings?${queryParams}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener reservas' };
    }
  }
};

export default adminService;