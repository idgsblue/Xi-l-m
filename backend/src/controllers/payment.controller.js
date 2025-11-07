const { PaymentTransaction, Booking } = require('../models');
const stripeService = require('../services/stripe.service');
const { Op } = require('sequelize');

class PaymentController {
  // Obtener client secret de un Payment Intent
  async getPaymentIntent(req, res, next) {
    try {
      const { paymentIntentId } = req.params;

      // Buscar la reserva asociada a este Payment Intent
      const booking = await Booking.findOne({
        where: { stripe_payment_intent_id: paymentIntentId },
        include: ['guest']
      });

      if (!booking) {
        return res.status(404).json({ error: 'Reserva no encontrada' });
      }

      // Verificar permisos
      if (booking.guest_id !== req.userId && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'No tienes acceso a este pago' });
      }

      // Obtener el Payment Intent de Stripe
      const paymentIntent = await stripeService.getPaymentIntent(paymentIntentId);

      res.json({
        clientSecret: paymentIntent.client_secret,
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100
      });
    } catch (error) {
      console.error('Error obteniendo Payment Intent:', error);
      next(error);
    }
  }

  // Obtener detalles del pago
  async getPaymentDetails(req, res, next) {
    try {
      const { id } = req.params;

      const payment = await PaymentTransaction.findByPk(id, {
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
        payment.user_id !== req.userId &&
        payment.booking.host_id !== req.userId &&
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
      const payment = await PaymentTransaction.findOne({
        where: { stripe_payment_intent_id: paymentIntent.id }
      });

      if (payment) {
        payment.payment_status = 'succeeded';
        await payment.save();

        // Actualizar reserva
        const booking = await Booking.findByPk(payment.booking_id);
        if (booking) {
          booking.booking_status = 'confirmed';
          booking.payment_status = 'confirmed';
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
      const payment = await PaymentTransaction.findOne({
        where: { stripe_payment_intent_id: paymentIntent.id }
      });

      if (payment) {
        payment.payment_status = 'failed';
        await payment.save();

        // Actualizar reserva
        const booking = await Booking.findByPk(payment.booking_id);
        if (booking && booking.booking_status === 'pending') {
          booking.booking_status = 'cancelled';
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
      const payment = await PaymentTransaction.findOne({
        where: { stripe_payment_intent_id: charge.payment_intent }
      });

      if (payment) {
        payment.payment_status = 'refunded';
        payment.refund_amount = charge.amount_refunded / 100;
        await payment.save();
      }
    } catch (error) {
      console.error('Error manejando reembolso:', error);
    }
  }

  // Obtener historial de pagos del usuario
  async getUserPayments(req, res, next) {
    try {
      const payments = await PaymentTransaction.findAll({
        where: { user_id: req.userId },
        include: [{
          model: Booking,
          as: 'booking',
          include: ['property']
        }],
        order: [['created_at', 'DESC']]
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