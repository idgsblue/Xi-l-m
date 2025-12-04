import React, { useState, useEffect } from "react";
import api from "../../services/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";

const BookingsAnalysisChart = () => {
  const [bookingsData, setBookingsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [timeRange, setTimeRange] = useState('12');
  const [selectedYear, setSelectedYear] = useState('all');
  const [availableYears, setAvailableYears] = useState([]);

  useEffect(() => {
    fetchBookingsAnalysis();
  }, [timeRange]);

  const fetchBookingsAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data } = await api.get(`/admin/bookings/analysis?months=${timeRange}`);
      
      const processedData = processBookingsData(data);
      setBookingsData(processedData);
      
      const years = [...new Set(processedData.map(item => item.year))];
      setAvailableYears(years.sort((a, b) => b - a));
    } catch (error) {
      console.error("Error cargando análisis de reservas:", error);
      setError("Error al cargar los datos de reservas");
    } finally {
      setLoading(false);
    }
  };

  const processBookingsData = (data) => {
    if (!data || !Array.isArray(data)) return [];

    const monthlyData = {};
    const now = new Date();
    const monthsToShow = parseInt(timeRange);
    const cutoffDate = new Date(now.getFullYear(), now.getMonth() - monthsToShow + 1, 1);

    data.forEach((booking) => {
      const date = new Date(booking.created_at || booking.check_in_date);
      
      if (date < cutoffDate) return;
      
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const monthKey = `${year}-${String(month).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthKey,
          year: year,
          confirmed: 0,
          cancelled: 0,
        };
      }

      if (booking.booking_status === 'cancelled') {
        monthlyData[monthKey].cancelled++;
      } else if (['confirmed', 'completed'].includes(booking.booking_status)) {
        monthlyData[monthKey].confirmed++;
      }
    });

    const result = Object.values(monthlyData)
      .sort((a, b) => a.month.localeCompare(b.month))
      .map((item) => ({
        ...item,
        name: formatMonthName(item.month),
        fullDate: item.month
      }));

    return result;
  };

  const formatMonthName = (monthKey) => {
    const [year, month] = monthKey.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleString("es-MX", { 
      month: "short", 
      year: "2-digit" 
    });
  };

  const getFilteredData = () => {
    if (selectedYear === 'all') return bookingsData;
    return bookingsData.filter(item => item.year === parseInt(selectedYear));
  };

  const filteredData = getFilteredData();

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const confirmed = payload.find(p => p.dataKey === 'confirmed')?.value || 0;
      const cancelled = payload.find(p => p.dataKey === 'cancelled')?.value || 0;
      const total = confirmed + cancelled;
      const cancellationRate = total > 0 ? ((cancelled / total) * 100).toFixed(1) : 0;

      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-bold text-gray-900 mb-2">{label}</p>
          <div className="space-y-1">
            <p className="text-sm text-green-600">
              Confirmadas: <span className="font-bold">{confirmed}</span>
            </p>
            <p className="text-sm text-red-600">
              Canceladas: <span className="font-bold">{cancelled}</span>
            </p>
            <p className="text-sm text-gray-600 pt-2 border-t border-gray-100">
              Total: <span className="font-bold">{total}</span>
            </p>
            <p className="text-sm text-orange-600">
              Tasa cancelación: <span className="font-bold">{cancellationRate}%</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const calculateStats = () => {
    if (filteredData.length === 0) return { totalConfirmed: 0, totalCancelled: 0, avgCancellationRate: 0 };

    const totalConfirmed = filteredData.reduce((sum, item) => sum + item.confirmed, 0);
    const totalCancelled = filteredData.reduce((sum, item) => sum + item.cancelled, 0);
    const total = totalConfirmed + totalCancelled;
    const avgCancellationRate = total > 0 ? ((totalCancelled / total) * 100).toFixed(1) : 0;

    return { totalConfirmed, totalCancelled, avgCancellationRate };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-neutral-200 p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando análisis de reservas...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-neutral-200 p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-red-600 font-medium mb-4">{error}</p>
            <button
              onClick={fetchBookingsAnalysis}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (bookingsData.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-neutral-200 p-6">
        <h2 className="text-xl font-bold text-neutral-900 mb-2">
          Análisis de Reservas
        </h2>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-neutral-500 text-lg">No hay datos de reservas disponibles</p>
            <p className="text-neutral-400 text-sm mt-2">Crea algunas reservas para ver el análisis</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-neutral-200 p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 mb-1">
            Análisis de Reservas
          </h2>
          <p className="text-sm text-neutral-500">
            Comparación de reservas confirmadas vs canceladas
          </p>
        </div>

        <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Periodo:</label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="3">Últimos 3 meses</option>
              <option value="6">Últimos 6 meses</option>
              <option value="12">Último año</option>
            </select>
          </div>

          {availableYears.length > 1 && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Año:</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="all">Todos</option>
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={fetchBookingsAnalysis}
            className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
            title="Actualizar datos"
          >
            Actualizar
          </button>
        </div>
      </div>

      <div className="h-96 mt-6">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={filteredData}
            margin={{ top: 5, right: 30, left: 20, bottom: 50 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="name"
              tick={{ fill: "#6b7280", fontSize: 11 }}
              axisLine={{ stroke: "#d1d5db" }}
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
            />
            <YAxis
              tick={{ fill: "#6b7280", fontSize: 12 }}
              axisLine={{ stroke: "#d1d5db" }}
              label={{ 
                value: 'Cantidad de Reservas', 
                angle: -90, 
                position: 'insideLeft',
                style: { fill: '#6b7280', fontSize: 12 }
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="line"
            />
            <Line
              type="monotone"
              dataKey="confirmed"
              stroke="#10b981"
              strokeWidth={2.5}
              name="Confirmadas"
              dot={{ fill: "#10b981", r: 4 }}
              activeDot={{ r: 6 }}
              animationDuration={800}
            />
            <Line
              type="monotone"
              dataKey="cancelled"
              stroke="#ef4444"
              strokeWidth={2.5}
              name="Canceladas"
              dot={{ fill: "#ef4444", r: 4 }}
              activeDot={{ r: 6 }}
              animationDuration={800}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-8 pt-6 border-t border-neutral-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 rounded-lg p-5 border border-green-100">
            <p className="text-sm text-green-700 font-medium mb-2">
              Total Confirmadas
            </p>
            <p className="text-3xl font-bold text-green-600">
              {stats.totalConfirmed}
            </p>
            <p className="text-xs text-green-600 mt-1">
              {selectedYear === 'all' ? 'Todos los años' : `Año ${selectedYear}`}
            </p>
          </div>
          
          <div className="bg-red-50 rounded-lg p-5 border border-red-100">
            <p className="text-sm text-red-700 font-medium mb-2">
              Total Canceladas
            </p>
            <p className="text-3xl font-bold text-red-600">
              {stats.totalCancelled}
            </p>
            <p className="text-xs text-red-600 mt-1">
              {selectedYear === 'all' ? 'Todos los años' : `Año ${selectedYear}`}
            </p>
          </div>
          
          <div className="bg-orange-50 rounded-lg p-5 border border-orange-100">
            <p className="text-sm text-orange-700 font-medium mb-2">
              Tasa de Cancelación
            </p>
            <p className="text-3xl font-bold text-orange-600">
              {stats.avgCancellationRate}%
            </p>
            <p className="text-xs text-orange-600 mt-1">
              Promedio del periodo
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingsAnalysisChart;