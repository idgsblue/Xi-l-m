const { Booking, Property, User, Payment } = require('../models');
const { Op } = require('sequelize');
const emailService = require('../services/email.service');
const stripeService = require('../services/stripe.service');
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

      if (property.status !== 'approved' || !property.isAvailable) {
        await t.rollback();
        return res.status(400).json({ error: 'Propiedad no disponible' });
      }

      if (numberOfGuests > property.maxGuests) {
        await t.rollback();
        return res.status(400).json({ 
          error: `La propiedad admite máximo ${property.maxGuests} huéspedes` 
        });
      }

      // Verificar disponibilidad
      const existingBooking = await Booking.findOne({
        where: {
          propertyId,
          status: { [Op.in]: ['pending', 'confirmed'] },
          [Op.or]: [
            {
              checkIn: { [Op.between]: [checkIn, checkOut] }
            },
            {
              checkOut: { [Op.between]: [checkIn, checkOut] }
            },
            {
              [Op.and]: [
                { checkIn: { [Op.lte]: checkIn } },
                { checkOut: { [Op.gte]: checkOut } }
              ]
            }
          ]
        },
        transaction: t
      });

      if (existingBooking) {
        await t.rollback();
        return res.status(409).json({ error: 'La propiedad no está disponible en esas fechas' });
      }

      // Calcular precio total
      const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
      const totalPrice = nights * property.pricePerNight;

      // Crear reserva
      const booking = await Booking.create({
        checkIn,
        checkOut,
        numberOfGuests,
        specialRequests,
        totalPrice,
        status: 'pending',
        guestId: req.userId,
        propertyId: property.id,
        hostId: property.hostId
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
        stripePaymentIntentId: paymentIntent.id,
        status: 'pending',
        bookingId: booking.id,
        userId: req.userId
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

      if (booking.guestId !== req.userId) {
        await t.rollback();
        return res.status(403).json({ error: 'No tienes permisos para confirmar esta reserva' });
      }

      if (booking.status === 'confirmed') {
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
      booking.status = 'confirmed';
      booking.paymentStatus = 'paid';
      booking.stripePaymentId = paymentIntentId;
      await booking.save({ transaction: t });

      // Actualizar estado del pago
      if (booking.payment) {
        booking.payment.status = 'succeeded';
        await booking.payment.save({ transaction: t });
      }

      await t.commit();

      // Enviar emails de confirmación
      await emailService.sendBookingConfirmation(booking, booking.guest, booking.property);
      await emailService.sendBookingNotificationToHost(booking, booking.host, booking.property, booking.guest);

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

      const where = { guestId: req.userId };
      
      if (status) {
        where.status = status;
      }

      if (upcoming === 'true') {
        where.checkIn = { [Op.gte]: new Date() };
        where.status = { [Op.in]: ['confirmed', 'pending'] };
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
              attributes: ['id', 'name', 'email', 'phone']
            }]
          },
          {
            model: Payment,
            as: 'payment'
          }
        ],
        order: [['checkIn', 'DESC']]
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

      const where = { hostId: req.userId };
      
      if (propertyId) {
        where.propertyId = propertyId;
      }

      if (status) {
        where.status = status;
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
            attributes: ['id', 'name', 'email', 'phone']
          },
          {
            model: Payment,
            as: 'payment'
          }
        ],
        order: [['checkIn', 'DESC']]
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
              attributes: ['id', 'name', 'email', 'phone']
            }]
          },
          {
            model: User,
            as: 'guest',
            attributes: ['id', 'name', 'email', 'phone']
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
        booking.guestId !== req.userId && 
        booking.hostId !== req.userId && 
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
      if (booking.guestId !== req.userId && req.user.role !== 'admin') {
        await t.rollback();
        return res.status(403).json({ error: 'No tienes permisos para cancelar esta reserva' });
      }

      if (booking.status === 'cancelled') {
        await t.rollback();
        return res.status(400).json({ error: 'La reserva ya está cancelada' });
      }

      if (booking.status === 'completed') {
        await t.rollback();
        return res.status(400).json({ error: 'No se puede cancelar una reserva completada' });
      }

      // Calcular reembolso según política de cancelación
      const checkInDate = new Date(booking.checkIn);
      const today = new Date();
      const daysUntilCheckIn = Math.ceil((checkInDate - today) / (1000 * 60 * 60 * 24));
      
      let refundAmount = 0;
      let refundPercentage = 0;

      if (daysUntilCheckIn > 7) {
        refundPercentage = 100;
        refundAmount = booking.totalPrice;
      } else if (daysUntilCheckIn > 3) {
        refundPercentage = 50;
        refundAmount = booking.totalPrice * 0.5;
      } else {
        refundPercentage = 0;
        refundAmount = 0;
      }

      // Procesar reembolso si corresponde
      if (booking.paymentStatus === 'paid' && refundAmount > 0 && booking.stripePaymentId) {
        try {
          const refund = await stripeService.createRefund(booking.stripePaymentId, refundAmount);
          
          if (booking.payment) {
            booking.payment.status = 'refunded';
            booking.payment.refundAmount = refundAmount;
            booking.payment.refundReason = reason || 'Cancelación de reserva';
            await booking.payment.save({ transaction: t });
          }
        } catch (error) {
          console.error('Error procesando reembolso:', error);
          // Continuar con la cancelación aunque falle el reembolso
        }
      }

      // Actualizar estado de la reserva
      booking.status = 'cancelled';
      if (refundAmount > 0) {
        booking.paymentStatus = 'refunded';
      }
      await booking.save({ transaction: t });

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

  // Verificar disponibilidad
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

      const existingBooking = await Booking.findOne({
        where: {
          propertyId,
          status: { [Op.in]: ['pending', 'confirmed'] },
          [Op.or]: [
            {
              checkIn: { [Op.between]: [checkIn, checkOut] }
            },
            {
              checkOut: { [Op.between]: [checkIn, checkOut] }
            },
            {
              [Op.and]: [
                { checkIn: { [Op.lte]: checkIn } },
                { checkOut: { [Op.gte]: checkOut } }
              ]
            }
          ]
        }
      });

      const isAvailable = !existingBooking && property.isAvailable && property.status === 'approved';

      // Calcular precio
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
      const totalPrice = nights * property.pricePerNight;

      res.json({
        available: isAvailable,
        nights,
        pricePerNight: property.pricePerNight,
        totalPrice
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new BookingController();