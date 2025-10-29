import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

const BookingForm = ({ property, bookingData }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [specialRequests, setSpecialRequests] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);

    try {
      // Crear la reserva
      const bookingResponse = await api.post('/bookings', {
        propertyId: property.id,
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        numberOfGuests: bookingData.guests,
        specialRequests
      });

      const { paymentClientSecret, bookingId } = bookingResponse.data;

      // Confirmar el pago con Stripe
      const card = elements.getElement(CardElement);
      const result = await stripe.confirmCardPayment(paymentClientSecret, {
        payment_method: {
          card,
          billing_details: {
            name: user.name,
            email: user.email
          }
        }
      });

      if (result.error) {
        toast.error(result.error.message);
      } else {
        // Confirmar la reserva en el backend
        await api.post('/bookings/confirm', {
          bookingId,
          paymentIntentId: result.paymentIntent.id
        });

        toast.success('¡Reserva confirmada exitosamente!');
        navigate(`/guest/booking-confirmation/${bookingId}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error procesando la reserva');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Información de pago
        </h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </div>
      </div>

      <div>
        <label htmlFor="specialRequests" className="block text-sm font-medium text-gray-700">
          Solicitudes especiales (opcional)
        </label>
        <textarea
          id="specialRequests"
          value={specialRequests}
          onChange={(e) => setSpecialRequests(e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="¿Alguna solicitud especial para tu estadía?"
        />
      </div>

      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-2">Política de cancelación</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Cancelación gratuita hasta 7 días antes del check-in</li>
          <li>• 50% de reembolso hasta 3 días antes</li>
          <li>• Sin reembolso con menos de 3 días</li>
        </ul>
      </div>

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Procesando...' : `Confirmar y pagar $${bookingData.totalPrice} MXN`}
      </button>
    </form>
  );
};

const Booking = () => {
  const { propertyId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [property, setProperty] = useState(location.state?.property || null);
  const [loading, setLoading] = useState(!property);

  const bookingData = location.state || {};

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: location } });
      return;
    }

    if (!property) {
      loadProperty();
    }
  }, []);

  const loadProperty = async () => {
    try {
      const response = await api.get(`/properties/${propertyId}`);
      setProperty(response.data.property);
    } catch (error) {
      toast.error('Error cargando la propiedad');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!bookingData.checkIn || !bookingData.checkOut) {
    navigate(`/property/${propertyId}`);
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Confirmar reserva</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Información del huésped
            </h2>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-600">Nombre:</span>
                <p className="font-medium">{user.name}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Email:</span>
                <p className="font-medium">{user.email}</p>
              </div>
              {user.phone && (
                <div>
                  <span className="text-sm text-gray-600">Teléfono:</span>
                  <p className="font-medium">{user.phone}</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6">
            <Elements stripe={stripePromise}>
              <BookingForm property={property} bookingData={bookingData} />
            </Elements>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-lg shadow p-6 sticky top-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Resumen de reserva
            </h3>
            
            <div className="mb-4">
              <h4 className="font-medium text-gray-900">{property?.name}</h4>
              <p className="text-sm text-gray-600">{property?.address}</p>
            </div>

            <div className="space-y-3 border-t border-b py-4 my-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Check-in:</span>
                <span className="font-medium">
                  {format(new Date(bookingData.checkIn), "dd 'de' MMMM, yyyy", { locale: es })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Check-out:</span>
                <span className="font-medium">
                  {format(new Date(bookingData.checkOut), "dd 'de' MMMM, yyyy", { locale: es })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Huéspedes:</span>
                <span className="font-medium">{bookingData.guests}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  ${property?.pricePerNight} x {Math.ceil((new Date(bookingData.checkOut) - new Date(bookingData.checkIn)) / (1000 * 60 * 60 * 24))} noches
                </span>
                <span>${bookingData.totalPrice}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                <span>Total</span>
                <span>${bookingData.totalPrice} MXN</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;