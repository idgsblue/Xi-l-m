import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import QuickRegisterModal from '../../components/QuickRegisterModal';



const stripeKey = process.env.REACT_APP_STRIPE_PUBLIC_KEY;
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

const BookingForm = ({ property, bookingData, loadProperty, showQuickRegister, setShowQuickRegister }) => {
  const location = useLocation();
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [specialRequests, setSpecialRequests] = useState('');
  const [simulatePayment, setSimulatePayment] = useState(!process.env.REACT_APP_STRIPE_PUBLIC_KEY);

  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Crear la reserva
      const bookingResponse = await api.post('/bookings', {
        propertyId: property.id,
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        numberOfGuests: bookingData.guests,
        specialRequests,
        simulatePayment // ← Enviar flag de simulación
      });

      const { booking, paymentClientSecret, paymentIntentId, simulatedMode } = bookingResponse.data;
      const bookingId = booking.id;

      // ============ MODO SIMULADO ============
      if (simulatedMode || !stripe || !elements) {
        toast.info('Modo de pago simulado activado');

        // Simular confirmación automática después de 2 segundos
        setTimeout(async () => {
          try {
            await api.post('/bookings/confirm', {
              bookingId,
              paymentIntentId
            });

            toast.success('¡Reserva confirmada exitosamente! (modo simulado)');
            navigate(`/guest/booking-confirmation/${bookingId}`);
          } catch (error) {
            toast.error('Error confirmando reserva simulada');
          }
        }, 2000);

        return;
      }

      // ============ MODO REAL CON STRIPE ============
      const card = elements.getElement(CardElement);
      const result = await stripe.confirmCardPayment(paymentClientSecret, {
        payment_method: {
          card,
          billing_details: {
            name: user.full_name || user.name,
            email: user.email,
          },
        },
      });

      if (result.error) {
        toast.error(result.error.message);
      } else {
        // Confirmar la reserva en el backend
        await api.post('/bookings/confirm', {
          bookingId,
          paymentIntentId: result.paymentIntent.id,
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

  if (showQuickRegister && !user) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-accent-900 mb-8">
        Confirmar reserva
      </h1>
      
      <div className="card max-w-2xl mx-auto text-center py-12">
        <h2 className="text-2xl font-semibold mb-4">
          Necesitas una cuenta para continuar
        </h2>
        <p className="text-neutral-600 mb-6">
          Crea una cuenta rápidamente o inicia sesión para completar tu reserva
        </p>
        
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => setShowQuickRegister(true)}
            className="btn-secondary"
          >
            Crear cuenta
          </button>
          <button
            onClick={() => navigate('/login', { 
              state: { from: location, bookingData } 
            })}
            className="btn-primary"
          >
            Iniciar sesión
          </button>
        </div>
      </div>

      <QuickRegisterModal
        isOpen={showQuickRegister}
        onClose={() => {
          setShowQuickRegister(false);
          navigate('/');
        }}
        onSuccess={() => {
          setShowQuickRegister(false);
          // El usuario ya está autenticado, recargar datos
          loadProperty();
        }}
      />
    </div>
  );
}

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Mostrar modo de pago */}
      {simulatePayment && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800 font-medium">
            ⚠️ Modo de prueba: El pago será simulado (Stripe no configurado)
          </p>
        </div>
      )}

      {/* Campo de pago con Stripe (solo si está configurado) */}
      {!simulatePayment && stripe && elements && (
        <div>
          <h3 className="text-lg font-semibold text-accent-900 mb-4">
            Información de pago
          </h3>
          <div className="bg-neutral-50 p-4 rounded-lg">
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
      )}

      <div>
        <label
          htmlFor="specialRequests"
          className="block text-sm font-medium text-neutral-700"
        >
          Solicitudes especiales (opcional)
        </label>
        <textarea
          id="specialRequests"
          value={specialRequests}
          onChange={(e) => setSpecialRequests(e.target.value)}
          rows={3}
          className="input mt-1"
          placeholder="¿Alguna solicitud especial para tu estadía?"
        />
      </div>

      <div className="bg-primary-50 rounded-lg p-4">
        <h4 className="font-semibold text-accent-900 mb-2">
          Política de cancelación
        </h4>
        <ul className="text-sm text-neutral-600 space-y-1">
          <li>• Cancelación gratuita hasta 7 días antes del check-in</li>
          <li>• 50% de reembolso hasta 3 días antes</li>
          <li>• Sin reembolso con menos de 3 días</li>
        </ul>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-secondary w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <span className="animate-spin inline-block mr-2">⏳</span>
            Procesando...
          </>
        ) : (
          `${simulatePayment ? 'Simular pago y' : 'Confirmar y pagar'} $${bookingData.totalPrice} MXN`
        )}
      </button>

      {simulatePayment && (
        <p className="text-xs text-center text-neutral-500">
          El pago se simulará automáticamente en 2 segundos
        </p>
      )}
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
    const [showQuickRegister, setShowQuickRegister] = useState(false);

  const bookingData = location.state || {};

useEffect(() => {
  if (!user) {

    setShowQuickRegister(true);
  }

   if (!property) {
    loadProperty();
  }
}, [user]);


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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary-600"></div>
      </div>
    );
  }

  if (!bookingData.checkIn || !bookingData.checkOut) {
    navigate(`/property/${propertyId}`);
    return null;
  }

  

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-accent-900 mb-8">
        Confirmar reserva
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="card">
            <h2 className="text-xl font-semibold text-accent-900 mb-4">
              Información del huésped
            </h2>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-neutral-600">Nombre:</span>
                <p className="font-medium">{user.name}</p>
              </div>
              <div>
                <span className="text-sm text-neutral-600">Email:</span>
                <p className="font-medium">{user.email}</p>
              </div>
              {user.phone && (
                <div>
                  <span className="text-sm text-neutral-600">Teléfono:</span>
                  <p className="font-medium">{user.phone}</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6">
            <Elements stripe={stripePromise}>
             <BookingForm
  property={property}
  bookingData={bookingData}
  loadProperty={loadProperty}
  showQuickRegister={showQuickRegister}
  setShowQuickRegister={setShowQuickRegister}
/>
            </Elements>
          </div>
        </div>

        <div>
          <div className="card sticky top-4">
            <h3 className="text-lg font-semibold text-accent-900 mb-4">
              Resumen de reserva
            </h3>

            <div className="mb-4">
              <h4 className="font-medium text-accent-900">{property?.name}</h4>
              <p className="text-sm text-neutral-600">{property?.address}</p>
            </div>

            <div className="space-y-3 border-t border-b py-4 my-4">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Check-in:</span>
                <span className="font-medium">
                  {format(new Date(bookingData.checkIn), "dd 'de' MMMM, yyyy", {
                    locale: es,
                  })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Check-out:</span>
                <span className="font-medium">
                  {format(new Date(bookingData.checkOut), "dd 'de' MMMM, yyyy", {
                    locale: es,
                  })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Huéspedes:</span>
                <span className="font-medium">{bookingData.guests}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">
                  ${property?.pricePerNight} x{' '}
                  {Math.ceil(
                    (new Date(bookingData.checkOut) -
                      new Date(bookingData.checkIn)) /
                      (1000 * 60 * 60 * 24)
                  )}{' '}
                  noches
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
