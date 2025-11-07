// src/services/booking.service.js
import api from './api';

const bookingService = {
  // 📘 Obtener una reserva por ID
  getBookingById: async (id) => {
    try {
      const response = await api.get(`/bookings/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener la reserva' };
    }
  },

  // 🧾 Crear una nueva reserva
  createBooking: async (bookingData) => {
    try {
      const response = await api.post('/bookings', bookingData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al crear la reserva' };
    }
  },

  // ✅ Confirmar una reserva (Stripe u otro método de pago)
  confirmBooking: async (confirmData) => {
    try {
      const response = await api.post('/bookings/confirm', confirmData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al confirmar la reserva' };
    }
  },

  // ❌ Cancelar una reserva (opcionalmente con razón)
  cancelBooking: async (id, reason = '') => {
    try {
      const response = await api.post(`/bookings/${id}/cancel`, { reason });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al cancelar la reserva' };
    }
  },

  // 🧍 Obtener reservas del usuario autenticado
  getMyBookings: async () => {
    try {
      const response = await api.get('/bookings/my-bookings');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener mis reservas' };
    }
  },

  // 🏠 Obtener reservas del anfitrión (solo host)
  getHostBookings: async () => {
    try {
      const response = await api.get('/bookings/host/bookings');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener reservas del anfitrión' };
    }
  },

  // 🧑‍💼 Obtener todas las reservas (solo admin)
  getAllBookingsAdmin: async () => {
    try {
      const response = await api.get('/bookings/admin/all');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener todas las reservas' };
    }
  },

  // 📅 Verificar disponibilidad antes de crear una reserva
  checkAvailability: async (params) => {
    try {
      const response = await api.get('/bookings/check-availability', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al verificar disponibilidad' };
    }
  },
};

export default bookingService;
