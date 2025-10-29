const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

class StripeService {
  async createPaymentIntent(amount, bookingId, customerEmail) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Stripe usa centavos
        currency: 'mxn',
        payment_method_types: ['card'],
        metadata: {
          bookingId: bookingId.toString(),
          customerEmail
        }
      });

      return paymentIntent;
    } catch (error) {
      console.error('Error creando PaymentIntent:', error);
      throw new Error('Error procesando el pago');
    }
  }

  async confirmPayment(paymentIntentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      return paymentIntent.status === 'succeeded';
    } catch (error) {
      console.error('Error confirmando pago:', error);
      return false;
    }
  }

  async createRefund(paymentIntentId, amount = null) {
    try {
      const refundData = { payment_intent: paymentIntentId };
      if (amount) {
        refundData.amount = Math.round(amount * 100);
      }
      
      const refund = await stripe.refunds.create(refundData);
      return refund;
    } catch (error) {
      console.error('Error creando reembolso:', error);
      throw new Error('Error procesando el reembolso');
    }
  }

  async getPaymentIntent(paymentIntentId) {
    try {
      return await stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (error) {
      console.error('Error obteniendo PaymentIntent:', error);
      throw error;
    }
  }

  async createCustomer(email, name) {
    try {
      const customer = await stripe.customers.create({
        email,
        name
      });
      return customer;
    } catch (error) {
      console.error('Error creando cliente en Stripe:', error);
      throw error;
    }
  }
}

module.exports = new StripeService();   