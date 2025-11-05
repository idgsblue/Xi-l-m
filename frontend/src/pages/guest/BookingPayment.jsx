import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import bookingService from '../../services/booking.service';

const BookingPayment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing'); // processing, success, error
  const [error, setError] = useState('');

  useEffect(() => {
    confirmPayment();
  }, []);

  const confirmPayment = async () => {
    try {
      // Obtener parámetros de la URL
      const bookingId = searchParams.get('bookingId');
      const paymentIntentId = searchParams.get('paymentIntentId');

      console.log('Confirmando pago:', { bookingId, paymentIntentId });

      if (!bookingId || !paymentIntentId) {
        setStatus('error');
        setError('Faltan parámetros de confirmación');
        return;
      }

      // Confirmar el pago en el backend
      const response = await bookingService.confirmBooking({
        bookingId: parseInt(bookingId),
        paymentIntentId
      });

      console.log('Respuesta confirmación:', response);

      setStatus('success');

      // Redirigir a la página de confirmación después de 2 segundos
      setTimeout(() => {
        navigate(`/booking-confirmation/${bookingId}`);
      }, 2000);

    } catch (error) {
      console.error('Error confirmando pago:', error);
      setStatus('error');
      setError(error.response?.data?.error || 'Error al confirmar la reserva');
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto text-center">
        {status === 'processing' && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold mb-2">Procesando pago...</h2>
            <p className="text-neutral-600">Por favor espera un momento</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-green-600 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">¡Pago confirmado!</h2>
            <p className="text-neutral-600">Redirigiendo...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-red-600 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2 text-red-600">Error al confirmar</h2>
            <p className="text-neutral-600 mb-4">{error}</p>
            <button
              onClick={() => navigate('/guest/bookings')}
              className="btn-primary"
            >
              Ir a mis reservas
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default BookingPayment;