const { Payment, Booking } = require('../models');
const stripeService = require('../services/stripe.service');
const { Op } = require('sequelize');

class PaymentController {
  // Obtener detalles del pago
  async getPaymentDetails(req, res, next) {
    try {
      const { id } = req.params;

      const payment = await Payment.findByPk(id, {
        include: [{
          model: Booking,
          as: 'booking',
          include: ['property', 'guest']
        }]
      });

      if (!payment) {
        return res.status(404).json({ error: 'Pago no encontrado' });
      }

      // Verificar permisos
      if (
        payment.userId !== req.userId &&
        payment.booking.hostId !== req.userId &&
        req.user.role !== 'admin'
      ) {
        return res.status(403).json({ error: 'No tienes acceso a este pago' });
      }

      res.json({ payment });
    } catch (error) {
      next(error);
    }
  }

  // Webhook de Stripe
  async stripeWebhook(req, res, next) {
    try {
      const sig = req.headers['stripe-signature'];
      const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

      let event;

      try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
      } catch (err) {
        return res.status(400).json({ error: `Webhook Error: ${err.message}` });
      }

      // Manejar el evento
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSuccess(event.data.object);
          break;
        
        case 'payment_intent.payment_failed':
          await this.handlePaymentFailure(event.data.object);
          break;
        
        case 'charge.refunded':
          await this.handleRefund(event.data.object);
          break;
      }

      res.json({ received: true });
    } catch (error) {
      next(error);
    }
  }

  // Manejar pago exitoso
  async handlePaymentSuccess(paymentIntent) {
    try {
      const payment = await Payment.findOne({
        where: { stripePaymentIntentId: paymentIntent.id }
      });

      if (payment) {
        payment.status = 'succeeded';
        await payment.save();

        // Actualizar reserva
        const booking = await Booking.findByPk(payment.bookingId);
        if (booking) {
          booking.status = 'confirmed';
          booking.paymentStatus = 'paid';
          await booking.save();
        }
      }
    } catch (error) {
      console.error('Error manejando pago exitoso:', error);
    }
  }

  // Manejar fallo de pago
  async handlePaymentFailure(paymentIntent) {
    try {
      const payment = await Payment.findOne({
        where: { stripePaymentIntentId: paymentIntent.id }
      });

      if (payment) {
        payment.status = 'failed';
        await payment.save();

        // Actualizar reserva
        const booking = await Booking.findByPk(payment.bookingId);
        if (booking && booking.status === 'pending') {
          booking.status = 'cancelled';
          await booking.save();
        }
      }
    } catch (error) {
      console.error('Error manejando fallo de pago:', error);
    }
  }

  // Manejar reembolso
  async handleRefund(charge) {
    try {
      const payment = await Payment.findOne({
        where: { stripePaymentIntentId: charge.payment_intent }
      });

      if (payment) {
        payment.status = 'refunded';
        payment.refundAmount = charge.amount_refunded / 100;
        await payment.save();
      }
    } catch (error) {
      console.error('Error manejando reembolso:', error);
    }
  }

  // Obtener historial de pagos del usuario
  async getUserPayments(req, res, next) {
    try {
      const payments = await Payment.findAll({
        where: { userId: req.userId },
        include: [{
          model: Booking,
          as: 'booking',
          include: ['property']
        }],
        order: [['createdAt', 'DESC']]
      });

      res.json({ payments });
    } catch (error) {
      next(error);
    }
  }

  // Reintentar pago
  async retryPayment(req, res, next) {
    try {
      const { bookingId } = req.body;

      const booking = await Booking.findByPk(bookingId, {
        include: ['payment', 'property']
      });

      if (!booking) {
        return res.status(404).json({ error: 'Reserva no encontrada' });
      }

      if (booking.guestId !== req.userId) {
        return res.status(403).json({ error: 'No tienes permisos' });
      }

      if (booking.status === 'confirmed') {
        return res.status(400).json({ error: 'La reserva ya está confirmada' });
      }

      // Crear nuevo PaymentIntent
      const paymentIntent = await stripeService.createPaymentIntent(
        booking.totalPrice,
        booking.id,
        req.user.email
      );

      // Actualizar registro de pago
      if (booking.payment) {
        booking.payment.stripePaymentIntentId = paymentIntent.id;
        booking.payment.status = 'pending';
        await booking.payment.save();
      }

      res.json({
        message: 'Nuevo intento de pago creado',
        paymentClientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PaymentController();