const { PropertyAvailability, Property, Booking } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

class AvailabilityService {
  /**
   * Generar calendario mensual con estados de disponibilidad
   * @param {number} propertyId - ID de la propiedad
   * @param {number} year - Año (ej: 2025)
   * @param {number} month - Mes (1-12)
   * @returns {Array} Array de objetos con fecha y estado
   */
  async generateMonthlyCalendar(propertyId, year, month) {
    // Validar que la propiedad existe
    const property = await Property.findByPk(propertyId);
    if (!property) {
      throw new Error('Propiedad no encontrada');
    }

    // Calcular primer y último día del mes
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    
    // Obtener todas las fechas bloqueadas manualmente
    const manuallyBlocked = await PropertyAvailability.findAll({
      where: {
        property_id: propertyId,
        date: {
          [Op.between]: [firstDay, lastDay]
        },
        is_available: false
      }
    });

    const blockedDatesMap = new Map(
      manuallyBlocked.map(record => [record.date.toISOString().split('T')[0], true])
    );

    // Obtener reservas activas en el mes
    const bookings = await Booking.findAll({
      where: {
        property_id: propertyId,
        booking_status: {
          [Op.in]: ['pending', 'confirmed', 'in_progress']
        },
        [Op.or]: [
          {
            check_in_date: {
              [Op.between]: [firstDay, lastDay]
            }
          },
          {
            check_out_date: {
              [Op.between]: [firstDay, lastDay]
            }
          },
          {
            [Op.and]: [
              { check_in_date: { [Op.lte]: firstDay } },
              { check_out_date: { [Op.gte]: lastDay } }
            ]
          }
        ]
      },
      attributes: ['id', 'check_in_date', 'check_out_date', 'booking_status']
    });

    // Generar array de fechas del mes
    const calendar = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let day = 1; day <= lastDay.getDate(); day++) {
      const currentDate = new Date(year, month - 1, day);
      const dateString = currentDate.toISOString().split('T')[0];
      
      // Verificar si la fecha está en el pasado
      const isPast = currentDate < today;
      
      // Verificar si hay una reserva en esta fecha
      const bookingOnDate = bookings.find(booking => {
        const checkIn = new Date(booking.check_in_date);
        const checkOut = new Date(booking.check_out_date);
        return currentDate >= checkIn && currentDate < checkOut;
      });

      // Verificar si está bloqueada manualmente
      const isManuallyBlocked = blockedDatesMap.has(dateString);

      let status = 'available';
      let reason = null;
      let bookingId = null;

      if (isPast) {
        status = 'past';
        reason = 'Fecha pasada';
      } else if (bookingOnDate) {
        status = 'booked';
        reason = `Reserva #${bookingOnDate.id} (${bookingOnDate.booking_status})`;
        bookingId = bookingOnDate.id;
      } else if (isManuallyBlocked) {
        status = 'blocked';
        reason = 'Bloqueada manualmente';
      }

      calendar.push({
        date: dateString,
        dayOfMonth: day,
        dayOfWeek: currentDate.getDay(), // 0 = Domingo, 6 = Sábado
        status,
        reason,
        bookingId,
        isWeekend: currentDate.getDay() === 0 || currentDate.getDay() === 6
      });
    }

    return calendar;
  }

  /**
   * Marcar/Desmarcar fechas como disponibles/no disponibles
   * @param {number} propertyId - ID de la propiedad
   * @param {Array} dates - Array de fechas ['2025-01-15', '2025-01-16']
   * @param {boolean} isAvailable - true = disponible, false = bloqueada
   */
  async updateAvailability(propertyId, dates, isAvailable) {
    const t = await sequelize.transaction();

    try {
      // Validar que la propiedad existe y pertenece al host
      const property = await Property.findByPk(propertyId, { transaction: t });
      if (!property) {
        await t.rollback();
        throw new Error('Propiedad no encontrada');
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Validar que no haya fechas pasadas
      const pastDates = dates.filter(date => new Date(date) < today);
      if (pastDates.length > 0) {
        await t.rollback();
        throw new Error('No puedes modificar fechas pasadas');
      }

      // Si se intenta marcar como disponible, verificar que no haya reservas
      if (isAvailable) {
        const bookingsInDates = await Booking.findAll({
          where: {
            property_id: propertyId,
            booking_status: {
              [Op.in]: ['pending', 'confirmed', 'in_progress']
            },
            [Op.or]: dates.map(date => ({
              [Op.and]: [
                { check_in_date: { [Op.lte]: date } },
                { check_out_date: { [Op.gt]: date } }
              ]
            }))
          },
          transaction: t
        });

        if (bookingsInDates.length > 0) {
          await t.rollback();
          throw new Error('No puedes marcar como disponible fechas con reservas activas');
        }
      }

      // Actualizar o crear registros de disponibilidad
      const operations = dates.map(date => {
        return PropertyAvailability.upsert({
          property_id: propertyId,
          date: date,
          is_available: isAvailable
        }, { transaction: t });
      });

      await Promise.all(operations);

      // Si se está bloqueando, eliminar registros donde is_available = true
      if (!isAvailable) {
        await PropertyAvailability.destroy({
          where: {
            property_id: propertyId,
            date: { [Op.in]: dates },
            is_available: true
          },
          transaction: t
        });
      } else {
        // Si se está desbloqueando, eliminar registros donde is_available = false
        await PropertyAvailability.destroy({
          where: {
            property_id: propertyId,
            date: { [Op.in]: dates },
            is_available: false
          },
          transaction: t
        });
      }

      await t.commit();

      return {
        success: true,
        message: `${dates.length} fecha(s) ${isAvailable ? 'desbloqueada(s)' : 'bloqueada(s)'} exitosamente`,
        datesAffected: dates
      };
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  /**
   * Bloquear fechas automáticamente al confirmar una reserva
   * @param {number} bookingId - ID de la reserva
   */
  async blockDatesForBooking(bookingId) {
    const booking = await Booking.findByPk(bookingId);
    
    if (!booking) {
      throw new Error('Reserva no encontrada');
    }

    const dates = this.generateDateRange(booking.check_in_date, booking.check_out_date);

    // Marcar fechas como no disponibles
    const operations = dates.map(date => {
      return PropertyAvailability.upsert({
        property_id: booking.property_id,
        date: date,
        is_available: false
      });
    });

    await Promise.all(operations);

    return {
      success: true,
      bookingId: booking.id,
      datesBlocked: dates.length
    };
  }

  /**
   * Liberar fechas automáticamente al cancelar una reserva
   * @param {number} bookingId - ID de la reserva
   */
  async releaseDatesForBooking(bookingId) {
    const booking = await Booking.findByPk(bookingId);
    
    if (!booking) {
      throw new Error('Reserva no encontrada');
    }

    const dates = this.generateDateRange(booking.check_in_date, booking.check_out_date);

    // Eliminar bloqueos automáticos (mantener bloqueos manuales si los hay)
    // En este caso, simplemente eliminamos todos los registros de esas fechas
    await PropertyAvailability.destroy({
      where: {
        property_id: booking.property_id,
        date: { [Op.in]: dates }
      }
    });

    return {
      success: true,
      bookingId: booking.id,
      datesReleased: dates.length
    };
  }

  /**
   * Verificar si hay solapamiento de fechas con reservas existentes
   * @param {number} propertyId - ID de la propiedad
   * @param {Date} startDate - Fecha de inicio
   * @param {Date} endDate - Fecha de fin
   * @param {number} excludeBookingId - ID de reserva a excluir (para ediciones)
   */
  async validateDateOverlap(propertyId, startDate, endDate, excludeBookingId = null) {
    const where = {
      property_id: propertyId,
      booking_status: {
        [Op.in]: ['pending', 'confirmed', 'in_progress']
      },
      [Op.or]: [
        {
          check_in_date: { [Op.between]: [startDate, endDate] }
        },
        {
          check_out_date: { [Op.between]: [startDate, endDate] }
        },
        {
          [Op.and]: [
            { check_in_date: { [Op.lte]: startDate } },
            { check_out_date: { [Op.gte]: endDate } }
          ]
        }
      ]
    };

    if (excludeBookingId) {
      where.id = { [Op.ne]: excludeBookingId };
    }

    const overlappingBooking = await Booking.findOne({ where });

    return {
      hasOverlap: !!overlappingBooking,
      overlappingBooking
    };
  }

  /**
   * Sincronizar disponibilidad con reservas existentes
   * Útil para mantener consistencia después de migraciones o cambios masivos
   * @param {number} propertyId - ID de la propiedad
   */
  async syncWithBookings(propertyId) {
    const bookings = await Booking.findAll({
      where: {
        property_id: propertyId,
        booking_status: {
          [Op.in]: ['pending', 'confirmed', 'in_progress']
        },
        check_out_date: {
          [Op.gte]: new Date()
        }
      }
    });

    let totalDatesBlocked = 0;

    for (const booking of bookings) {
      const dates = this.generateDateRange(booking.check_in_date, booking.check_out_date);
      
      const operations = dates.map(date => {
        return PropertyAvailability.upsert({
          property_id: propertyId,
          date: date,
          is_available: false
        });
      });

      await Promise.all(operations);
      totalDatesBlocked += dates.length;
    }

    return {
      success: true,
      bookingsSynced: bookings.length,
      totalDatesBlocked
    };
  }

  /**
   * Obtener fechas ocupadas de una propiedad (para mostrar en búsqueda pública)
   * @param {number} propertyId - ID de la propiedad
   * @param {Date} startDate - Fecha inicial (opcional)
   * @param {Date} endDate - Fecha final (opcional)
   */
  async getUnavailableDates(propertyId, startDate = new Date(), endDate = null) {
    // Si no se proporciona endDate, buscar 6 meses adelante
    if (!endDate) {
      endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 6);
    }

    // Obtener fechas bloqueadas manualmente
    const manuallyBlocked = await PropertyAvailability.findAll({
      where: {
        property_id: propertyId,
        date: {
          [Op.between]: [startDate, endDate]
        },
        is_available: false
      },
      attributes: ['date']
    });

    // Obtener fechas con reservas
    const bookings = await Booking.findAll({
      where: {
        property_id: propertyId,
        booking_status: {
          [Op.in]: ['pending', 'confirmed', 'in_progress']
        },
        check_out_date: {
          [Op.gte]: startDate
        },
        check_in_date: {
          [Op.lte]: endDate
        }
      },
      attributes: ['check_in_date', 'check_out_date']
    });

    // Combinar todas las fechas no disponibles
    const unavailableDates = new Set();

    // Agregar fechas bloqueadas manualmente
    manuallyBlocked.forEach(record => {
      unavailableDates.add(record.date.toISOString().split('T')[0]);
    });

    // Agregar fechas de reservas
    bookings.forEach(booking => {
      const dates = this.generateDateRange(booking.check_in_date, booking.check_out_date);
      dates.forEach(date => unavailableDates.add(date));
    });

    return Array.from(unavailableDates).sort();
  }

  /**
   * Generar array de fechas entre dos fechas (formato YYYY-MM-DD)
   * @param {Date|string} startDate - Fecha inicial
   * @param {Date|string} endDate - Fecha final
   */
  generateDateRange(startDate, endDate) {
    const dates = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    // No incluir el día de checkout
    while (start < end) {
      dates.push(start.toISOString().split('T')[0]);
      start.setDate(start.getDate() + 1);
    }

    return dates;
  }

  /**
   * Verificar si una propiedad está disponible en un rango de fechas
   * @param {number} propertyId - ID de la propiedad
   * @param {Date|string} checkIn - Fecha de entrada
   * @param {Date|string} checkOut - Fecha de salida
   */
  async isAvailable(propertyId, checkIn, checkOut) {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Validar fechas
    if (checkInDate < today) {
      return {
        available: false,
        reason: 'La fecha de entrada no puede ser en el pasado'
      };
    }

    if (checkOutDate <= checkInDate) {
      return {
        available: false,
        reason: 'La fecha de salida debe ser posterior a la fecha de entrada'
      };
    }

    // Verificar solapamiento con reservas
    const { hasOverlap, overlappingBooking } = await this.validateDateOverlap(
      propertyId,
      checkIn,
      checkOut
    );

    if (hasOverlap) {
      return {
        available: false,
        reason: 'Las fechas solicitadas ya están reservadas',
        overlappingBooking
      };
    }

    // Verificar fechas bloqueadas manualmente
    const dates = this.generateDateRange(checkIn, checkOut);
    const blockedDates = await PropertyAvailability.findAll({
      where: {
        property_id: propertyId,
        date: { [Op.in]: dates },
        is_available: false
      }
    });

    if (blockedDates.length > 0) {
      return {
        available: false,
        reason: 'Algunas fechas no están disponibles',
        blockedDates: blockedDates.map(d => d.date)
      };
    }

    return {
      available: true,
      nights: dates.length
    };
  }
}

module.exports = new AvailabilityService();