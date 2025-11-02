import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import bookingService from '../../services/booking.service';

const BookingConfirmation = () => {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBooking();
  }, [bookingId]);

  const loadBooking = async () => {
    try {
      const response = await bookingService.getBookingById(bookingId);
      setBooking(response.booking);
    } catch (error) {
      console.error('Error loading booking:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-12 text-center">Cargando...</div>;
  }

  if (!booking) {
    return <div className="container mx-auto px-4 py-12 text-center">Reserva no encontrada</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Success Message */}
        <div className="text-center mb-8">
          <CheckCircleIcon className="h-16 w-16 mx-auto mb-4 icon-success" />
          <h1 className="text-3xl font-bold mb-2">¡Reserva confirmada!</h1>
          <p className="text-neutral-600">Tu reserva ha sido procesada exitosamente</p>
        </div>

        {/* Booking Details Card */}
        <div className="card">
          <h2 className="text-2xl font-semibold mb-6">Detalles de la reserva</h2>

          <div className="space-y-4 mb-6">
            <div>
              <p className="text-sm text-neutral-600">Código de reserva</p>
              <p className="font-semibold">{booking.id}</p>
            </div>

            <div>
              <p className="text-sm text-neutral-600">Propiedad</p>
              <p className="font-semibold">{booking.property?.title}</p>
              <p className="text-sm text-neutral-600">
                {booking.property?.address}, {booking.property?.city}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-neutral-600">Check-in</p>
                <p className="font-semibold">
                  {new Date(booking.checkInDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-neutral-600">Check-out</p>
                <p className="font-semibold">
                  {new Date(booking.checkOutDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm text-neutral-600">Huéspedes</p>
              <p className="font-semibold">{booking.guests} persona(s)</p>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Total pagado</span>
                <span className="text-secondary-600">${booking.totalPrice}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col space-y-3">
            <Link
              to="/guest/bookings"
              className="btn-secondary w-full text-center"
            >
              Ver mis reservas
            </Link>
            <Link
              to="/"
              className="w-full bg-neutral-200 text-neutral-700 py-3 rounded-lg font-semibold text-center hover:bg-neutral-300"
            >
              Volver al inicio
            </Link>
          </div>
        </div>

        {/* Next Steps */}
        <div className="mt-8 bg-primary-50 rounded-lg p-6">
          <h3 className="font-semibold mb-3">Próximos pasos</h3>
          <ul className="space-y-2 text-sm">
            <li>✓ Recibirás un correo de confirmación</li>
            <li>✓ El anfitrión recibirá tu solicitud</li>
            <li>✓ Te notificaremos cuando sea confirmada</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;