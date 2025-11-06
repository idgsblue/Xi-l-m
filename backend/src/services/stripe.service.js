const Stripe = require('stripe');

// Verificar si existe la API key de Stripe
const STRIPE_ENABLED = !!process.env.STRIPE_SECRET_KEY;
const stripe = STRIPE_ENABLED ? Stripe(process.env.STRIPE_SECRET_KEY) : null;

class StripeService {
  constructor() {
    if (!STRIPE_ENABLED) {
      console.log('⚠️  MODO DESARROLLO: Stripe deshabilitado - Usando pagos simulados');
    }
  }

  async createPaymentIntent(amount, bookingId, customerEmail) {
    try {
      // MODO SIMULADO (sin Stripe)
      if (!STRIPE_ENABLED) {
        console.log('💳 Simulando creación de PaymentIntent para booking:', bookingId);
        return {
          id: `pi_simulated_${Date.now()}_${bookingId}`,
          client_secret: `pi_simulated_${Date.now()}_secret`,
          amount: Math.round(amount * 100),
          currency: 'mxn',
          status: 'requires_payment_method'
        };
      }

      // MODO REAL (con Stripe)
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
      // MODO SIMULADO (sin Stripe)
      if (!STRIPE_ENABLED) {
        console.log('✅ Simulando confirmación de pago:', paymentIntentId);
        // Simular que el pago fue exitoso si tiene el prefijo de simulación
        return paymentIntentId.startsWith('pi_simulated_');
      }

      // MODO REAL (con Stripe)
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      return paymentIntent.status === 'succeeded';
    } catch (error) {
      console.error('Error confirmando pago:', error);
      return false;
    }
  }

  async createRefund(paymentIntentId, amount = null) {
    try {
      // MODO SIMULADO (sin Stripe)
      if (!STRIPE_ENABLED) {
        console.log('💰 Simulando reembolso para:', paymentIntentId, 'Monto:', amount || 'total');
        return {
          id: `re_simulated_${Date.now()}`,
          amount: amount ? Math.round(amount * 100) : null,
          status: 'succeeded',
          payment_intent: paymentIntentId
        };
      }

      // MODO REAL (con Stripe)
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
      // MODO SIMULADO (sin Stripe)
      if (!STRIPE_ENABLED) {
        console.log('🔍 Simulando obtención de PaymentIntent:', paymentIntentId);
        return {
          id: paymentIntentId,
          amount: 100000, // Monto simulado
          currency: 'mxn',
          status: 'succeeded'
        };
      }

      // MODO REAL (con Stripe)
      return await stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (error) {
      console.error('Error obteniendo PaymentIntent:', error);
      throw error;
    }
  }

  async createCustomer(email, name) {
    try {
      // MODO SIMULADO (sin Stripe)
      if (!STRIPE_ENABLED) {
        console.log('👤 Simulando creación de cliente:', email);
        return {
          id: `cus_simulated_${Date.now()}`,
          email,
          name
        };
      }

      // MODO REAL (con Stripe)
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