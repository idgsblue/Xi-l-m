import { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { toast } from 'react-toastify';

const StripePaymentForm = ({ bookingId, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: submitError } = await elements.submit();

      if (submitError) {
        setError(submitError.message);
        toast.error(submitError.message);
        setLoading(false);
        return;
      }

      // Confirmar el pago
      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/guest/booking-payment?bookingId=${bookingId}`,
        },
      });

      if (confirmError) {
        setError(confirmError.message);
        toast.error(confirmError.message);
      }
      // Si no hay error, Stripe redirigirá automáticamente
    } catch (err) {
      console.error('Error procesando pago:', err);
      setError('Error procesando el pago');
      toast.error('Error procesando el pago');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement
        options={{
          layout: 'tabs'
        }}
      />

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full py-3 px-6 bg-primary-600 text-white rounded-lg font-semibold
                 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed
                 transition-colors duration-200 flex items-center justify-center"
      >
        {loading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Procesando...
          </>
        ) : (
          'Pagar Ahora'
        )}
      </button>

      <div className="text-center text-sm text-gray-500">
        <p>🔒 Pago seguro procesado por Stripe</p>
      </div>
    </form>
  );
};

export default StripePaymentForm;
