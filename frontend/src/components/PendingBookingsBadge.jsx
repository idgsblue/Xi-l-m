import { useEffect, useState } from 'react';
import api from '../services/api';

/**
 * Badge que muestra el contador de reservas pendientes
 * Se usa en la navegación para alertar al host/admin de nuevas reservas
 */
const PendingBookingsBadge = ({ userRole }) => {
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingCount();

    // Actualizar cada 2 minutos
    const interval = setInterval(() => {
      fetchPendingCount();
    }, 120000);

    return () => clearInterval(interval);
  }, [userRole]);

  const fetchPendingCount = async () => {
    try {
      setLoading(true);

      const endpoint = userRole === 'admin'
        ? '/bookings/admin/all?booking_status=pending&limit=1'
        : '/bookings/host/bookings?booking_status=pending';

      const { data } = await api.get(endpoint);

      const count = userRole === 'admin'
        ? data.stats?.bookings?.pending || 0
        : data.stats?.pending || 0;

      setPendingCount(count);
    } catch (error) {
      console.error('Error fetching pending count:', error);
      setPendingCount(0);
    } finally {
      setLoading(false);
    }
  };

  // No mostrar badge si no hay pendientes o está cargando
  if (loading || pendingCount === 0) return null;

  return (
    <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full animate-pulse">
      {pendingCount > 99 ? '99+' : pendingCount}
    </span>
  );
};

export default PendingBookingsBadge;
