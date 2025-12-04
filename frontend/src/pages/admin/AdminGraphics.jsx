import React, { useState, useEffect } from "react";
import api from "../../services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import BookingsAnalysisChart from "../../components/admin/BookingsAnalysisChart";

const AdminGraphics = () => {
  const [revenueData, setRevenueData] = useState(null);
  const [loadingRevenue, setLoadingRevenue] = useState(true);

  // Fetch datos de revenue desde el endpoint de bookings
  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        setLoadingRevenue(true);
        const { data } = await api.get("/bookings/admin/all");
        setRevenueData(data.stats);
      } catch (error) {
        console.error("Error cargando datos de revenue:", error);
      } finally {
        setLoadingRevenue(false);
      }
    };

    fetchRevenueData();
  }, []);

  // Construir datos para el gráfico de ingresos
  const buildRevenueChart = () => {
    if (!revenueData) return [];

    const payload = revenueData || {};
    const candidates =
      payload.monthlyTrends ||
      payload.revenue?.monthly ||
      payload.revenue_monthly ||
      payload.bookings?.byMonth ||
      payload.bookings?.monthly ||
      payload.monthlyRevenue ||
      payload.revenue_by_month ||
      [];

    if (!Array.isArray(candidates) || candidates.length === 0) return [];

    return candidates.map((item) => {
      const monthRaw =
        item.month || item.date || item.label || item.month_id || "";
      const total =
        item.total ||
        item.revenue ||
        item.amount ||
        item.total_revenue ||
        item.value ||
        0;

      let name = monthRaw;
      if (typeof monthRaw === "string" && /^\d{4}-\d{2}/.test(monthRaw)) {
        const [year, month] = monthRaw.split("-");
        const date = new Date(parseInt(year), parseInt(month) - 1, 1);
        name = date.toLocaleString("es-MX", { month: "short" });
      }

      return { name, revenue: Number(total) || 0 };
    });
  };

  const revenueChartData = buildRevenueChart();

  // Construir datos para la gráfica de pastel de estados de reservas
  const buildBookingsStatusChart = () => {
    if (!revenueData?.bookings) return [];

    const bookingsStats = revenueData.bookings;
    const COLORS = {
      pending: "#eab308",
      confirmed: "#10b981",
      in_progress: "#3b82f6",
      completed: "#6b7280",
      cancelled: "#ef4444",
    };

    const statusLabels = {
      pending: "Pendientes",
      confirmed: "Confirmadas",
      in_progress: "En Progreso",
      completed: "Completadas",
      cancelled: "Canceladas",
    };

    return Object.entries(bookingsStats)
      .filter(([key, value]) => key !== "total" && value > 0)
      .map(([status, count]) => ({
        name: statusLabels[status] || status,
        value: count,
        color: COLORS[status] || "#888888",
      }));
  };

  const bookingsStatusData = buildBookingsStatusChart();


  

  // Construir datos para la gráfica de ocupación por tipo de propiedad
const buildOccupancyByTypeChart = () => {
  if (!revenueData?.occupancyByType) return [];

  const totalActiveBookings = revenueData.occupancyByType.reduce(
    (sum, item) => sum + Number(item.active_bookings || 0),
    0
  );

  return revenueData.occupancyByType.map((item) => {
    const active = Number(item.active_bookings || 0);
    const percentage =
      totalActiveBookings > 0
        ? ((active / totalActiveBookings) * 100).toFixed(1)
        : 0;

    return {
      name: item.type,
      activeBookings: active,
      propertiesCount: Number(item.properties_count || 0),
      percentage: Number(percentage),
    };
  });
};

const occupancyByTypeData = buildOccupancyByTypeChart();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };

  // Tooltip personalizado para la gráfica
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900">
            {payload[0].payload.name}
          </p>
          <p className="text-sm text-gray-600">
            Ingresos:{" "}
            <span className="font-bold text-green-600">
              {formatCurrency(payload[0].value)}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Tooltip para gráfica de pastel
  const PieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const total = bookingsStatusData.reduce(
        (sum, item) => sum + item.value,
        0
      );
      const percentage = ((payload[0].value / total) * 100).toFixed(1);

      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900">{payload[0].name}</p>
          <p className="text-sm text-gray-600">
            Cantidad: <span className="font-bold">{payload[0].value}</span>
          </p>
          <p className="text-sm text-gray-600">
            Porcentaje: <span className="font-bold">{percentage}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Label personalizado para el pie chart
  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        className="font-bold text-sm"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (loadingRevenue) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Gráficas y Análisis</h1>
        <p className="text-neutral-600 mt-2">
          Visualización de datos y estadísticas del sistema
        </p>
      </div>

      <div className="space-y-8">
        {/* Primera fila - Ingresos y Estado de Reservas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Gráfica de Ingresos */}
          {revenueChartData.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg border border-neutral-200 p-6">
              <h2 className="text-xl font-bold text-neutral-900 mb-2">
                Ingresos Mensuales
              </h2>
              <p className="text-sm text-neutral-500 mb-6">
                Evolución de ingresos de los últimos meses
              </p>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "#6b7280", fontSize: 12 }}
                      axisLine={{ stroke: "#d1d5db" }}
                    />
                    <YAxis
                      tick={{ fill: "#6b7280", fontSize: 12 }}
                      axisLine={{ stroke: "#d1d5db" }}
                      tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="revenue"
                      fill="#34d399"
                      radius={[6, 6, 6, 6]}
                      maxBarSize={50}
                      animationDuration={600}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-6 pt-6 border-t border-neutral-100">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-neutral-600">Total último mes:</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(revenueChartData[revenueChartData.length - 1]?.revenue || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600">Crecimiento mensual:</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {revenueChartData.length > 1 
                        ? `${(((revenueChartData[revenueChartData.length - 1]?.revenue - revenueChartData[revenueChartData.length - 2]?.revenue) / revenueChartData[revenueChartData.length - 2]?.revenue) * 100).toFixed(1)}%`
                        : "0%"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Gráfica de Pastel */}
          {bookingsStatusData.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg border border-neutral-200 p-6">
              <h2 className="text-xl font-bold text-neutral-900 mb-2">
                Estado de Reservas
              </h2>
              <p className="text-sm text-neutral-500 mb-6">
                Distribución porcentual actual
              </p>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={bookingsStatusData}
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      labelLine={false}
                      label={renderCustomLabel}
                      dataKey="value"
                      animationDuration={600}
                    >
                      {bookingsStatusData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>

                    <Tooltip content={<PieTooltip />} />
                    <Legend 
                      layout="vertical" 
                      verticalAlign="middle" 
                      align="right"
                      wrapperStyle={{ paddingLeft: '30px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-6 pt-6 border-t border-neutral-100">
                <div className="grid grid-cols-2 gap-4">
                  {bookingsStatusData.map((item, index) => {
                    const total = bookingsStatusData.reduce((sum, i) => sum + i.value, 0);
                    const percentage = ((item.value / total) * 100).toFixed(1);
                    
                    return (
                      <div key={index} className="flex items-center justify-between p-2 bg-neutral-50 rounded">
                        <div className="flex items-center">
                          <div 
                            className="w-4 h-4 rounded mr-2" 
                            style={{ backgroundColor: item.color }}
                          ></div>
                          <span className="text-sm font-medium text-neutral-700">{item.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-neutral-900">{item.value}</span>
                          <span className="text-xs text-neutral-500 ml-2">({percentage}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Gráfica de ocupación */}
        {occupancyByTypeData.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-neutral-200 p-6">
          <h2 className="text-xl font-bold text-neutral-900 mb-2">
            Ocupación por tipo de propiedad
          </h2>
          <p className="text-sm text-neutral-500 mb-6">
            Reservas activas por tipo de alojamiento y cantidad de propiedades
            registradas.
          </p>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={occupancyByTypeData}
                margin={{ top: 10, right: 30, left: 0, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-20}
                  textAnchor="end"
                  interval={0}
                  height={60}
                />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => {
                    if (name === "activeBookings") return [`${value}`, "Reservas activas"];
                    if (name === "propertiesCount") return [`${value}`, "Propiedades"];
                    if (name === "percentage") return [`${value}%`, "Porcentaje de ocupación"];
                    return value;
                  }}
                />
                <Legend />
                <Bar dataKey="activeBookings" name="Reservas activas" />
                <Bar dataKey="propertiesCount" name="Propiedades" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 space-y-2 text-sm text-neutral-700">
            {occupancyByTypeData.map((item) => (
              <div key={item.name} className="flex justify-between">
                <span>{item.name}</span>
                <span className="font-medium">
                  {item.activeBookings} reservas ({item.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
        </div>

        {/* Segunda fila - Análisis de Reservas (ancho completo) */}
        <div className="w-full">
          <BookingsAnalysisChart />
        </div>
      </div>
    </div>
  );
};

export default AdminGraphics;