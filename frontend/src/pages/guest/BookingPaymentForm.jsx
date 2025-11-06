import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import StripePaymentForm from '../../components/StripePaymentForm';
import api from '../../services/api';
import { toast } from 'react-toastify';
import STRIPE_PUBLIC_KEY from '../../config/stripe';

const stripePromise = STRIPE_PUBLIC_KEY ? loadStripe(STRIPE_PUBLIC_KEY) : null;

const BookingPaymentForm = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBookingDetails();
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/bookings/${bookingId}`);
      const bookingData = response.data.booking;

      setBooking(bookingData);

      // Si la reserva ya tiene un Payment Intent, obtener el client secret
      if (bookingData.stripe_payment_intent_id) {
        // El client secret debería venir del backend cuando se creó la reserva
        // Necesitamos modificar el endpoint para que devuelva el client secret
        console.log('Booking ya tiene Payment Intent:', bookingData.stripe_payment_intent_id);

        // Intentar obtener el client secret del Payment Intent existente
        try {
          const piResponse = await api.get(`/payments/intent/${bookingData.stripe_payment_intent_id}`);
          setClientSecret(piResponse.data.clientSecret);
        } catch (error) {
          console.error('Error obteniendo client secret:', error);
          toast.error('Error al cargar el formulario de pago');
          setError('No se pudo cargar el formulario de pago');
        }
      } else {
        toast.error('Esta reserva no tiene un pago pendiente');
        navigate('/guest/bookings');
      }
    } catch (error) {
      console.error('Error cargando reserva:', error);
      toast.error('Error al cargar la información de la reserva');
      setError('No se pudo cargar la información de la reserva');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    toast.success('¡Pago confirmado!');
    navigate(`/guest/booking-confirmation/${bookingId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando información de pago...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error || 'No se pudo cargar la información de pago'}</p>
          <button
            onClick={() => navigate('/guest/bookings')}
            className="btn-primary"
          >
            Volver a mis reservas
          </button>
        </div>
      </div>
    );
  }

  if (!STRIPE_PUBLIC_KEY) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error de Configuración</h2>
          <p className="text-gray-600 mb-4">Stripe no está configurado correctamente. Por favor, reinicia el servidor de desarrollo.</p>
          <button
            onClick={() => navigate('/guest/bookings')}
            className="btn-primary"
          >
            Volver a mis reservas
          </button>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Preparando formulario de pago...</p>
        </div>
      </div>
    );
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#0ea5e9',
        colorBackground: '#ffffff',
        colorText: '#1f2937',
        colorDanger: '#ef4444',
        fontFamily: 'system-ui, sans-serif',
        borderRadius: '8px',
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="text-primary-600 hover:text-primary-700 mb-4 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Completar Pago</h1>
          <p className="text-gray-600 mt-2">Ingresa los datos de tu tarjeta para confirmar la reserva</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Resumen de la reserva */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-900">Resumen de Reserva</h2>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900">{booking.property?.title || 'Propiedad'}</h3>
                  <p className="text-sm text-gray-500">{booking.property?.location || ''}</p>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Check-in:</span>
                    <span className="font-medium">
                      {new Date(booking.check_in_date).toLocaleDateString('es-MX', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Check-out:</span>
                    <span className="font-medium">
                      {new Date(booking.check_out_date).toLocaleDateString('es-MX', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Huéspedes:</span>
                    <span className="font-medium">{booking.total_guests}</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total:</span>
                    <span className="text-2xl font-bold text-primary-600">
                      ${parseFloat(booking.total_price).toFixed(2)} MXN
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Formulario de pago */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 lg:p-8">
              <h2 className="text-xl font-semibold mb-6 text-gray-900">Información de Pago</h2>

              <Elements stripe={stripePromise} options={options}>
                <StripePaymentForm
                  bookingId={bookingId}
                  onSuccess={handlePaymentSuccess}
                />
              </Elements>

              <div className="mt-6 pt-6 border-t">
                <div className="flex items-start space-x-3 text-sm text-gray-500">
                  <svg className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-medium text-gray-700 mb-1">Tu pago es seguro</p>
                    <p>Procesamos tu pago de forma segura a través de Stripe. No almacenamos tu información de tarjeta.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPaymentForm;
