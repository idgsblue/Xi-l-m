const { Booking, Property, User, Payment } = require('../models');
const { Op } = require('sequelize');
const emailService = require('../services/email.service');
const stripeService = require('../services/stripe.service');
const availabilityService = require('../services/availability.service'); // ← NUEVO
const sequelize = require('../config/database');

class BookingController {
  // Crear reserva
  async create(req, res, next) {
    const t = await sequelize.transaction();
    
    try {
      const {
        propertyId,
        checkIn,
        checkOut,
        numberOfGuests,
        specialRequests,
        paymentMethodId
      } = req.body;

      // Validar fechas
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (checkInDate < today) {
        await t.rollback();
        return res.status(400).json({ error: 'La fecha de check-in debe ser futura' });
      }

      if (checkOutDate <= checkInDate) {
        await t.rollback();
        return res.status(400).json({ error: 'La fecha de check-out debe ser posterior al check-in' });
      }

      // Buscar propiedad
      const property = await Property.findByPk(propertyId, {
        include: [{
          model: User,
          as: 'host'
        }],
        transaction: t
      });

      if (!property) {
        await t.rollback();
        return res.status(404).json({ error: 'Propiedad no encontrada' });
      }

      if (property.status !== 'published') {
        await t.rollback();
        return res.status(400).json({ error: 'Propiedad no disponible para reservas' });
      }

      if (numberOfGuests > property.capacity) {
        await t.rollback();
        return res.status(400).json({ 
          error: `La propiedad admite máximo ${property.capacity} huéspedes` 
        });
      }

      // ============ NUEVA VALIDACIÓN CON AVAILABILITY SERVICE ============
      const availabilityCheck = await availabilityService.isAvailable(
        propertyId,
        checkIn,
        checkOut
      );

      if (!availabilityCheck.available) {
        await t.rollback();
        return res.status(409).json({
          error: 'La propiedad no está disponible en esas fechas',
          reason: availabilityCheck.reason,
          blockedDates: availabilityCheck.blockedDates
        });
      }
      // ============ FIN NUEVA VALIDACIÓN ============

      // Calcular precio total
      const nights = availabilityCheck.nights;
      const totalPrice = nights * property.price_per_night;

      // Crear reserva
      const booking = await Booking.create({
        check_in_date: checkIn,
        check_out_date: checkOut,
        total_guests: numberOfGuests,
        special_requests: specialRequests,
        total_price: totalPrice,
        booking_status: 'pending',
        payment_status: 'pending',
        guest_id: req.userId,
        property_id: property.id,
        host_id: property.host_id
      }, { transaction: t });

      // Crear PaymentIntent en Stripe
      const paymentIntent = await stripeService.createPaymentIntent(
        totalPrice,
        booking.id,
        req.user.email
      );

      // Crear registro de pago
      const payment = await Payment.create({
        amount: totalPrice,
        stripe_payment_intent_id: paymentIntent.id,
        payment_status: 'pending',
        booking_id: booking.id,
        user_id: req.userId
      }, { transaction: t });

      await t.commit();

      res.status(201).json({
        message: 'Reserva creada, procede con el pago',
        booking,
        paymentClientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      });
    } catch (error) {
      await t.rollback();
      next(error);
    }
  }

  // Confirmar reserva después del pago
  async confirmBooking(req, res, next) {
    const t = await sequelize.transaction();
    
    try {
      const { bookingId, paymentIntentId } = req.body;

      // Buscar reserva
      const booking = await Booking.findByPk(bookingId, {
        include: [
          { model: Property, as: 'property' },
          { model: User, as: 'guest' },
          { model: User, as: 'host' },
          { model: Payment, as: 'payment' }
        ],
        transaction: t
      });

      if (!booking) {
        await t.rollback();
        return res.status(404).json({ error: 'Reserva no encontrada' });
      }

      if (booking.guest_id !== req.userId) {
        await t.rollback();
        return res.status(403).json({ error: 'No tienes permisos para confirmar esta reserva' });
      }

      if (booking.booking_status === 'confirmed') {
        await t.rollback();
        return res.status(400).json({ error: 'La reserva ya está confirmada' });
      }

      // Verificar pago en Stripe
      const paymentConfirmed = await stripeService.confirmPayment(paymentIntentId);

      if (!paymentConfirmed) {
        await t.rollback();
        return res.status(400).json({ error: 'El pago no ha sido confirmado' });
      }

      // Actualizar estado de la reserva
      booking.booking_status = 'confirmed';
      booking.payment_status = 'confirmed';
      booking.stripe_payment_intent_id = paymentIntentId;
      await booking.save({ transaction: t });

      // Actualizar estado del pago
      if (booking.payment) {
        booking.payment.payment_status = 'succeeded';
        await booking.payment.save({ transaction: t });
      }

      // ============ BLOQUEAR FECHAS AUTOMÁTICAMENTE ============
      try {
        await availabilityService.blockDatesForBooking(booking.id);
      } catch (availError) {
        console.error('Error bloqueando fechas:', availError);
        // No fallar la confirmación si falla el bloqueo
      }
      // ============ FIN BLOQUEO AUTOMÁTICO ============

      await t.commit();

      // Enviar emails de confirmación
      try {
        await emailService.sendBookingConfirmation(booking, booking.guest, booking.property);
        await emailService.sendBookingNotificationToHost(booking, booking.host, booking.property, booking.guest);
      } catch (emailError) {
        console.error('Error enviando emails:', emailError);
      }

      res.json({
        message: 'Reserva confirmada exitosamente',
        booking
      });
    } catch (error) {
      await t.rollback();
      next(error);
    }
  }

  // Obtener reservas del huésped autenticado
  async getMyBookings(req, res, next) {
    try {
      const { status, upcoming } = req.query;

      const where = { guest_id: req.userId };

      if (status) {
        where.booking_status = status;
      }

      if (upcoming === 'true') {
        where.check_in_date = { [Op.gte]: new Date() };
        where.booking_status = { [Op.in]: ['confirmed', 'pending'] };
      }

      const bookings = await Booking.findAll({
        where,
        include: [
          {
            model: Property,
            as: 'property',
            include: [{
              model: User,
              as: 'host',
              attributes: ['id', 'full_name', 'email', 'phone']
            }]
          },
          {
            model: Payment,
            as: 'payment'
          }
        ],
        order: [['check_in_date', 'DESC']]
      });

      res.json({ bookings });
    } catch (error) {
      next(error);
    }
  }

  // Obtener reservas como anfitrión
  async getHostBookings(req, res, next) {
    try {
      const { propertyId, status } = req.query;

      const where = { host_id: req.userId };

      if (propertyId) {
        where.property_id = propertyId;
      }

      if (status) {
        where.booking_status = status;
      }

      const bookings = await Booking.findAll({
        where,
        include: [
          {
            model: Property,
            as: 'property'
          },
          {
            model: User,
            as: 'guest',
            attributes: ['id', 'full_name', 'email', 'phone']
          },
          {
            model: Payment,
            as: 'payment'
          }
        ],
        order: [['check_in_date', 'DESC']]
      });

      res.json({ bookings });
    } catch (error) {
      next(error);
    }
  }

  // Obtener una reserva específica
  async getById(req, res, next) {
    try {
      const { id } = req.params;

      const booking = await Booking.findByPk(id, {
        include: [
          {
            model: Property,
            as: 'property',
            include: [{
              model: User,
              as: 'host',
              attributes: ['id', 'full_name', 'email', 'phone']
            }]
          },
          {
            model: User,
            as: 'guest',
            attributes: ['id', 'full_name', 'email', 'phone']
          },
          {
            model: Payment,
            as: 'payment'
          }
        ]
      });

      if (!booking) {
        return res.status(404).json({ error: 'Reserva no encontrada' });
      }

      // Verificar permisos
      if (
        booking.guest_id !== req.userId &&
        booking.host_id !== req.userId &&
        req.user.role !== 'admin'
      ) {
        return res.status(403).json({ error: 'No tienes acceso a esta reserva' });
      }

      res.json({ booking });
    } catch (error) {
      next(error);
    }
  }

  // Cancelar reserva
  async cancel(req, res, next) {
    const t = await sequelize.transaction();
    
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const booking = await Booking.findByPk(id, {
        include: [
          { model: Property, as: 'property' },
          { model: User, as: 'guest' },
          { model: User, as: 'host' },
          { model: Payment, as: 'payment' }
        ],
        transaction: t
      });

      if (!booking) {
        await t.rollback();
        return res.status(404).json({ error: 'Reserva no encontrada' });
      }

      // Verificar permisos
      if (booking.guest_id !== req.userId && req.user.role !== 'admin') {
        await t.rollback();
        return res.status(403).json({ error: 'No tienes permisos para cancelar esta reserva' });
      }

      if (booking.booking_status === 'cancelled') {
        await t.rollback();
        return res.status(400).json({ error: 'La reserva ya está cancelada' });
      }

      if (booking.booking_status === 'completed') {
        await t.rollback();
        return res.status(400).json({ error: 'No se puede cancelar una reserva completada' });
      }

      // Calcular reembolso según política de cancelación
      const checkInDate = new Date(booking.check_in_date);
      const today = new Date();
      const daysUntilCheckIn = Math.ceil((checkInDate - today) / (1000 * 60 * 60 * 24));

      let refundAmount = 0;
      let refundPercentage = 0;

      if (daysUntilCheckIn > 7) {
        refundPercentage = 100;
        refundAmount = booking.total_price;
      } else if (daysUntilCheckIn > 3) {
        refundPercentage = 50;
        refundAmount = booking.total_price * 0.5;
      } else {
        refundPercentage = 0;
        refundAmount = 0;
      }

      // Procesar reembolso si corresponde
      if (booking.payment_status === 'confirmed' && refundAmount > 0 && booking.stripe_payment_intent_id) {
        try {
          const refund = await stripeService.createRefund(booking.stripe_payment_intent_id, refundAmount);

          if (booking.payment) {
            booking.payment.payment_status = 'refunded';
            booking.payment.refund_amount = refundAmount;
            booking.payment.refund_reason = reason || 'Cancelación de reserva';
            await booking.payment.save({ transaction: t });
          }
        } catch (error) {
          console.error('Error procesando reembolso:', error);
          // Continuar con la cancelación aunque falle el reembolso
        }
      }

      // Actualizar estado de la reserva
      booking.booking_status = 'cancelled';
      booking.cancellation_reason = reason;
      booking.cancelled_at = new Date();
      if (refundAmount > 0) {
        booking.payment_status = 'refunded';
      }
      await booking.save({ transaction: t });

      // ============ LIBERAR FECHAS AUTOMÁTICAMENTE ============
      try {
        await availabilityService.releaseDatesForBooking(booking.id);
      } catch (availError) {
        console.error('Error liberando fechas:', availError);
        // No fallar la cancelación si falla la liberación
      }
      // ============ FIN LIBERACIÓN AUTOMÁTICA ============

      await t.commit();

      res.json({
        message: 'Reserva cancelada exitosamente',
        booking,
        refund: {
          percentage: refundPercentage,
          amount: refundAmount
        }
      });
    } catch (error) {
      await t.rollback();
      next(error);
    }
  }

  // Verificar disponibilidad (DEPRECADO - usar availability.service)
  async checkAvailability(req, res, next) {
    try {
      const { propertyId, checkIn, checkOut } = req.query;

      if (!propertyId || !checkIn || !checkOut) {
        return res.status(400).json({ 
          error: 'Se requiere propertyId, checkIn y checkOut' 
        });
      }

      const property = await Property.findByPk(propertyId);

      if (!property) {
        return res.status(404).json({ error: 'Propiedad no encontrada' });
      }

      // Usar el nuevo servicio de disponibilidad
      const availabilityResult = await availabilityService.isAvailable(
        propertyId,
        checkIn,
        checkOut
      );

      if (availabilityResult.available) {
        const totalPrice = availabilityResult.nights * parseFloat(property.price_per_night);

        res.json({
          available: true,
          nights: availabilityResult.nights,
          pricePerNight: parseFloat(property.price_per_night),
          totalPrice: parseFloat(totalPrice.toFixed(2))
        });
      } else {
        res.json({
          available: false,
          reason: availabilityResult.reason,
          blockedDates: availabilityResult.blockedDates
        });
      }
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new BookingController();