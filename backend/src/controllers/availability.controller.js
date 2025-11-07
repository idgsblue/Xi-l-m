const availabilityService = require('../services/availability.service');
const { Property } = require('../models');

class AvailabilityController {
  /**
   * Obtener calendario mensual de disponibilidad
   * GET /api/properties/:id/availability/:year/:month
   */
  async getMonthlyAvailability(req, res, next) {
    try {
      const { id, year, month } = req.params;

      // Validar parámetros
      const yearNum = parseInt(year);
      const monthNum = parseInt(month);

      if (isNaN(yearNum) || yearNum < 2020 || yearNum > 2100) {
        return res.status(400).json({ error: 'Año inválido' });
      }

      if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
        return res.status(400).json({ error: 'Mes inválido (debe ser 1-12)' });
      }

      // Verificar que la propiedad existe
      const property = await Property.findByPk(id);
      if (!property) {
        return res.status(404).json({ error: 'Propiedad no encontrada' });
      }

      // Verificar permisos (solo el propietario o admin pueden ver el calendario completo)
      const isOwner = req.userId && property.host_id === req.userId;
      const isAdmin = req.user?.role === 'admin';

      if (!isOwner && !isAdmin) {
        // Usuarios públicos solo ven fechas NO disponibles
        const unavailableDates = await availabilityService.getUnavailableDates(
          id,
          new Date(yearNum, monthNum - 1, 1),
          new Date(yearNum, monthNum, 0)
        );

        return res.json({
          propertyId: id,
          year: yearNum,
          month: monthNum,
          unavailableDates,
          publicView: true
        });
      }

      // Generar calendario completo
      const calendar = await availabilityService.generateMonthlyCalendar(
        id,
        yearNum,
        monthNum
      );

      // Estadísticas del mes
      const stats = {
        totalDays: calendar.length,
        availableDays: calendar.filter(d => d.status === 'available').length,
        bookedDays: calendar.filter(d => d.status === 'booked').length,
        blockedDays: calendar.filter(d => d.status === 'blocked').length,
        pastDays: calendar.filter(d => d.status === 'past').length
      };

      res.json({
        propertyId: id,
        year: yearNum,
        month: monthNum,
        calendar,
        stats
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Actualizar disponibilidad de fechas específicas (bloquear/desbloquear)
   * POST /api/properties/:id/availability
   * Body: { dates: ['2025-01-15', '2025-01-16'], isAvailable: false }
   */
  async updateAvailability(req, res, next) {
    try {
      const { id } = req.params;
      const { dates, isAvailable } = req.body;

      // Validaciones
      if (!Array.isArray(dates) || dates.length === 0) {
        return res.status(400).json({
          error: 'Se requiere un array de fechas no vacío'
        });
      }

      if (typeof isAvailable !== 'boolean') {
        return res.status(400).json({
          error: 'isAvailable debe ser un booleano (true/false)'
        });
      }

      // Verificar que la propiedad existe y pertenece al host
      const property = await Property.findByPk(id);
      if (!property) {
        return res.status(404).json({ error: 'Propiedad no encontrada' });
      }

      if (property.host_id !== req.userId && req.user.role !== 'admin') {
        return res.status(403).json({
          error: 'No tienes permisos para modificar la disponibilidad de esta propiedad'
        });
      }

      // Validar formato de fechas
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      const invalidDates = dates.filter(date => !dateRegex.test(date));
      if (invalidDates.length > 0) {
        return res.status(400).json({
          error: 'Formato de fecha inválido. Use YYYY-MM-DD',
          invalidDates
        });
      }

      // Actualizar disponibilidad
      const result = await availabilityService.updateAvailability(
        id,
        dates,
        isAvailable
      );

      res.json({
        message: result.message,
        datesAffected: result.datesAffected,
        count: result.datesAffected.length,
        action: isAvailable ? 'unblocked' : 'blocked'
      });
    } catch (error) {
      // Errores específicos del servicio
      if (error.message.includes('pasadas') || 
          error.message.includes('reservas activas') ||
          error.message.includes('no encontrada')) {
        return res.status(400).json({ error: error.message });
      }
      next(error);
    }
  }

  /**
   * Obtener fechas no disponibles (vista pública para huéspedes)
   * GET /api/properties/:id/unavailable-dates?start=2025-01-01&end=2025-06-30
   */
  async getUnavailableDates(req, res, next) {
    try {
      const { id } = req.params;
      const { start, end } = req.query;

      const property = await Property.findByPk(id);
      if (!property) {
        return res.status(404).json({ error: 'Propiedad no encontrada' });
      }

      const startDate = start ? new Date(start) : new Date();
      const endDate = end ? new Date(end) : null;

      const unavailableDates = await availabilityService.getUnavailableDates(
        id,
        startDate,
        endDate
      );

      res.json({
        propertyId: id,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate ? endDate.toISOString().split('T')[0] : 'auto',
        unavailableDates,
        count: unavailableDates.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verificar disponibilidad para un rango de fechas específico
   * GET /api/properties/:id/check-availability?checkIn=2025-01-15&checkOut=2025-01-20
   */
  async checkAvailability(req, res, next) {
    try {
      const { id } = req.params;
      const { checkIn, checkOut } = req.query;

      if (!checkIn || !checkOut) {
        return res.status(400).json({
          error: 'Se requieren parámetros checkIn y checkOut'
        });
      }

      const property = await Property.findByPk(id);
      if (!property) {
        return res.status(404).json({ error: 'Propiedad no encontrada' });
      }

      const availabilityResult = await availabilityService.isAvailable(
        id,
        checkIn,
        checkOut
      );

      if (availabilityResult.available) {
        // Calcular precio total
        const nights = availabilityResult.nights;
        const totalPrice = nights * parseFloat(property.price_per_night);

        return res.json({
          available: true,
          checkIn,
          checkOut,
          nights,
          pricePerNight: parseFloat(property.price_per_night),
          totalPrice: parseFloat(totalPrice.toFixed(2))
        });
      } else {
        return res.json({
          available: false,
          reason: availabilityResult.reason,
          blockedDates: availabilityResult.blockedDates,
          overlappingBooking: availabilityResult.overlappingBooking
        });
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * Sincronizar disponibilidad con reservas existentes
   * POST /api/properties/:id/availability/sync
   * (Solo para Admin o troubleshooting)
   */
  async syncAvailability(req, res, next) {
    try {
      const { id } = req.params;

      // Solo admin puede sincronizar
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          error: 'Solo administradores pueden ejecutar sincronización'
        });
      }

      const property = await Property.findByPk(id);
      if (!property) {
        return res.status(404).json({ error: 'Propiedad no encontrada' });
      }

      const result = await availabilityService.syncWithBookings(id);

      res.json({
        message: 'Sincronización completada exitosamente',
        bookingsSynced: result.bookingsSynced,
        totalDatesBlocked: result.totalDatesBlocked
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Bloquear rango de fechas (atajo para múltiples fechas consecutivas)
   * POST /api/properties/:id/availability/block-range
   * Body: { startDate: '2025-01-15', endDate: '2025-01-20' }
   */
  async blockDateRange(req, res, next) {
    try {
      const { id } = req.params;
      const { startDate, endDate } = req.body;

      if (!startDate || !endDate) {
        return res.status(400).json({
          error: 'Se requieren startDate y endDate'
        });
      }

      // Verificar propiedad y permisos
      const property = await Property.findByPk(id);
      if (!property) {
        return res.status(404).json({ error: 'Propiedad no encontrada' });
      }

      if (property.host_id !== req.userId && req.user.role !== 'admin') {
        return res.status(403).json({
          error: 'No tienes permisos para modificar esta propiedad'
        });
      }

      // Generar array de fechas
      const dates = availabilityService.generateDateRange(startDate, endDate);

      if (dates.length === 0) {
        return res.status(400).json({
          error: 'Rango de fechas inválido'
        });
      }

      // Bloquear fechas
      const result = await availabilityService.updateAvailability(
        id,
        dates,
        false // bloquear
      );

      res.json({
        message: `Rango bloqueado exitosamente`,
        startDate,
        endDate,
        datesBlocked: dates.length
      });
    } catch (error) {
      if (error.message.includes('pasadas') || error.message.includes('reservas activas')) {
        return res.status(400).json({ error: error.message });
      }
      next(error);
    }
  }
}

module.exports = new AvailabilityController();