const { Booking, Property, User, PaymentTransaction } = require('../models');
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
     const platformCommissionRate = 0.10; // 10%
const platformCommission = totalPrice * platformCommissionRate;

// Crear registro de pago
const payment = await PaymentTransaction.create({
  amount: totalPrice,
  platform_commission: platformCommission,
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
    { 
      model: Property, 
      as: 'property',
      include: [{
        model: User,
        as: 'host'  // ← El host está asociado a Property, no a Booking
      }]
    },
    { model: User, as: 'guest' },
    { model: PaymentTransaction, as: 'transactions' }
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
if (booking.transactions && booking.transactions.length > 0) {
  booking.transactions[0].payment_status = 'succeeded';
  await booking.transactions[0].save({ transaction: t });
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
            model: PaymentTransaction,
            as: 'transactions'
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

    // Filtros opcionales para Booking
    const where = {};
    if (propertyId) {
      where.property_id = propertyId;
    }
    if (status) {
      where.booking_status = status;
    }

    const bookings = await Booking.findAll({
      where, // ✅ ahora solo filtra por propertyId o status
      include: [
        {
          model: Property,
          as: 'property',
          where: { host_id: req.userId }, // ✅ filtro correcto
          attributes: ['id', 'title', 'host_id', 'price_per_night']
        },
        {
          model: User,
          as: 'guest',
          attributes: ['id', 'full_name', 'email', 'phone']
        },
        {
          model: PaymentTransaction,
          as: 'transactions'
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
            model: PaymentTransaction,
            as: 'transactions'
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
          { model: PaymentTransaction, as: 'transactions' }
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

          if (booking.transactions && booking.transactions.length > 0) {
            booking.transactions[0].payment_status = 'refunded';
            booking.transactions[0].refund_amount = refundAmount;
            booking.transactions[0].refund_reason = reason || 'Cancelación de reserva';
            await booking.transactions[0].save({ transaction: t });
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

  // =======================================
  // ADMIN: Obtener todas las reservas con estadísticas
  // =======================================
  async getAllBookingsAdmin(req, res, next) {
    try {
      const {
        property_id,
        guest_id,
        host_id,
        booking_status,
        payment_status,
        date_filter,
        search,
        page = 1,
        limit = 20
      } = req.query;

      // Verificar que sea admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Acceso denegado' });
      }

      // Construir WHERE dinámico
      const where = {};

      if (booking_status) {
        where.booking_status = booking_status;
      }

      if (payment_status) {
        where.payment_status = payment_status;
      }

      // Filtros de fecha
      if (date_filter) {
        const now = new Date();
        switch (date_filter) {
          case 'upcoming':
            where.check_in_date = { [Op.gte]: now };
            break;
          case 'current':
            where.check_in_date = { [Op.lte]: now };
            where.check_out_date = { [Op.gte]: now };
            break;
          case 'past':
            where.check_out_date = { [Op.lt]: now };
            break;
          case 'today':
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            where.check_in_date = { [Op.gte]: today, [Op.lt]: tomorrow };
            break;
        }
      }

      // Incluir relaciones
      const include = [
        {
          model: Property,
          as: 'property',
          attributes: ['id', 'title', 'location', 'price_per_night', 'host_id'],
          ...(property_id && { where: { id: property_id } }),
          ...(host_id && { where: { host_id } }),
          include: [
            {
              model: User,
              as: 'host',
              attributes: ['id', 'full_name', 'email']
            }
          ]
        },
        {
          model: User,
          as: 'guest',
          attributes: ['id', 'full_name', 'email', 'phone'],
          ...(guest_id && { where: { id: guest_id } }),
          ...(search && {
            where: {
              [Op.or]: [
                { full_name: { [Op.iLike]: `%${search}%` } },
                { email: { [Op.iLike]: `%${search}%` } }
              ]
            }
          })
        },
        {
          model: PaymentTransaction,
          as: 'transactions'
        }
      ];

      // Paginación
      const offset = (page - 1) * limit;

      // Obtener reservas con paginación
      const { count, rows: bookings } = await Booking.findAndCountAll({
        where,
        include,
        limit: parseInt(limit),
        offset,
        order: [['created_at', 'DESC']],
        distinct: true
      });

      // Calcular estadísticas globales
      const [statsResult] = await sequelize.query(`
        SELECT
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE booking_status = 'pending') as pending,
          COUNT(*) FILTER (WHERE booking_status = 'confirmed') as confirmed,
          COUNT(*) FILTER (WHERE booking_status = 'in_progress') as in_progress,
          COUNT(*) FILTER (WHERE booking_status = 'completed') as completed,
          COUNT(*) FILTER (WHERE booking_status = 'cancelled') as cancelled,
          COUNT(*) FILTER (WHERE payment_status = 'pending') as payment_pending,
          COUNT(*) FILTER (WHERE payment_status = 'confirmed') as payment_confirmed,
          COUNT(*) FILTER (WHERE payment_status = 'rejected') as payment_rejected,
          SUM(total_price) as total_revenue,
          SUM(CASE WHEN booking_status = 'completed' THEN total_price ELSE 0 END) as completed_revenue
        FROM bookings
      `);

      const stats = {
        bookings: {
          total: parseInt(statsResult[0].total),
          pending: parseInt(statsResult[0].pending),
          confirmed: parseInt(statsResult[0].confirmed),
          in_progress: parseInt(statsResult[0].in_progress),
          completed: parseInt(statsResult[0].completed),
          cancelled: parseInt(statsResult[0].cancelled)
        },
        payments: {
          pending: parseInt(statsResult[0].payment_pending),
          confirmed: parseInt(statsResult[0].payment_confirmed),
          rejected: parseInt(statsResult[0].payment_rejected)
        },
        revenue: {
          total: parseFloat(statsResult[0].total_revenue || 0),
          completed: parseFloat(statsResult[0].completed_revenue || 0)
        }
      };

      // Estadísticas por mes (últimos 6 meses)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const [monthlyStats] = await sequelize.query(`
        SELECT
          TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') as month,
          COUNT(*) as count,
          SUM(total_price) as revenue
        FROM bookings
        WHERE created_at >= :sixMonthsAgo
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY month DESC
      `, {
        replacements: { sixMonthsAgo }
      });

      stats.monthlyTrends = monthlyStats;

      res.json({
        bookings,
        pagination: {
          total: count,
          pages: Math.ceil(count / limit),
          currentPage: parseInt(page),
          perPage: parseInt(limit)
        },
        stats
      });
    } catch (error) {
      console.error('Error en getAllBookingsAdmin:', error);
      next(error);
    }
  }
}

module.exports = new BookingController();