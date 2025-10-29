import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

const stripeService = {
  getStripe: async () => {
    return await stripePromise;
  },

  createPaymentIntent: async (api, bookingData) => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },

  confirmPayment: async (stripe, clientSecret, paymentMethod) => {
    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: paymentMethod
    });

    if (result.error) {
      throw new Error(result.error.message);
    }

    return result.paymentIntent;
  }
};

export default stripeService;