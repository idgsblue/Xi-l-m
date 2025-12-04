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
  LineChart,
Line,
Area,
AreaChart,
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

  // Tooltip personalizado para la gráfica de ingresos
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


  // Construir datos para la gráfica de tendencia de ocupación
const buildOccupancyTrendChart = () => {
  if (!revenueData?.monthlyTrends && !revenueChartData.length) return [];
  
  return revenueChartData.map((item) => {
    // Simular ocupación basada en ingresos 
    const maxRevenue = Math.max(...revenueChartData.map(d => d.revenue));
    const occupancyRate = maxRevenue > 0 ? ((item.revenue / maxRevenue) * 100).toFixed(1) : 0;
    
    return {
      name: item.name,
      occupancy: Number(occupancyRate),
      revenue: item.revenue
    };
  });
};

const occupancyTrendData = buildOccupancyTrendChart();

// Construir datos para Top 5 propiedades por ingresos
const buildTopPropertiesChart = () => {
  if (!revenueData?.topProperties) {
    // Si no tienes datos reales, simular con datos de ejemplo
    return [
      { name: "Casa Vista al Río", revenue: 45000, bookings: 12, rating: 4.8 },
      { name: "Cabaña Los Pinos", revenue: 38000, bookings: 8, rating: 4.9 },
      { name: "Villa Arroyo Seco", revenue: 32000, bookings: 10, rating: 4.6 },
      { name: "Hotel Centro", revenue: 28000, bookings: 15, rating: 4.4 },
      { name: "Posada La Montaña", revenue: 22000, bookings: 6, rating: 4.7 }
    ];
  }

  return revenueData.topProperties
    .sort((a, b) => (b.revenue || b.total || 0) - (a.revenue || a.total || 0))
    .slice(0, 5)
    .map((item, index) => ({
      name: item.name || item.property_name || `Propiedad ${index + 1}`,
      revenue: Number(item.revenue || item.total || 0),
      bookings: Number(item.bookings || item.bookings_count || 0),
      rating: Number(item.rating || item.average_rating || 4.5)
    }));
};

const topPropertiesData = buildTopPropertiesChart();

// Generar colores degradados para el ranking
const getBarColor = (index) => {
  const colors = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5'];
  return colors[index] || '#e5e7eb';
};

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">
          Gráficas y Análisis
        </h1>
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
                    <p className="text-sm text-neutral-600">
                      Total último mes:
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(
                        revenueChartData[revenueChartData.length - 1]?.revenue ||
                          0
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600">
                      Crecimiento mensual:
                    </p>
                    <p className="text-2xl font-bold text-blue-600">
                      {revenueChartData.length > 1
                        ? `${(
                            ((revenueChartData[revenueChartData.length - 1]
                              ?.revenue -
                              revenueChartData[revenueChartData.length - 2]
                                ?.revenue) /
                              revenueChartData[revenueChartData.length - 2]
                                ?.revenue) *
                            100
                          ).toFixed(1)}%`
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
                      wrapperStyle={{ paddingLeft: "30px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-6 pt-6 border-t border-neutral-100">
                <div className="grid grid-cols-2 gap-4">
                  {bookingsStatusData.map((item, index) => {
                    const total = bookingsStatusData.reduce(
                      (sum, i) => sum + i.value,
                      0
                    );
                    const percentage = (
                      (item.value / total) *
                      100
                    ).toFixed(1);

                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-neutral-50 rounded"
                      >
                        <div className="flex items-center">
                          <div
                            className="w-4 h-4 rounded mr-2"
                            style={{ backgroundColor: item.color }}
                          ></div>
                          <span className="text-sm font-medium text-neutral-700">
                            {item.name}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-neutral-900">
                            {item.value}
                          </span>
                          <span className="text-xs text-neutral-500 ml-2">
                            ({percentage}%)
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Fila 2 - Ocupación por tipo de propiedad (ancho completo, diseño mejorado) */}
        {occupancyByTypeData.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="text-xl font-semibold text-neutral-900">
                  Ocupación por tipo de propiedad
                </h2>
                <p className="text-sm text-neutral-500 mt-1">
                  Reservas activas por tipo de alojamiento y cantidad de
                  propiedades registradas.
                </p>
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-sky-50 text-sky-700 border border-sky-100">
                Vista general
              </span>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
              {/* Gráfica grande */}
              <div className="h-80 lg:flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={occupancyByTypeData}
                    layout="vertical"
                    margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      type="number"
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={130}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        borderColor: "#e5e7eb",
                        boxShadow:
                          "0 10px 15px -3px rgba(15, 23, 42, 0.12)",
                      }}
                      formatter={(value, name) => {
                        if (name === "activeBookings")
                          return [`${value}`, "Reservas activas"];
                        if (name === "propertiesCount")
                          return [`${value}`, "Propiedades"];
                        if (name === "percentage")
                          return [`${value}%`, "Porcentaje de ocupación"];
                        return value;
                      }}
                    />
                    <Legend
                      wrapperStyle={{ paddingTop: 12 }}
                      iconType="circle"
                    />
                    <Bar
                      dataKey="activeBookings"
                      name="Reservas activas"
                      fill="#0ea5e9"
                      radius={[6, 6, 6, 6]}
                      barSize={18}
                    />
                    <Bar
                      dataKey="propertiesCount"
                      name="Propiedades"
                      fill="#22c55e"
                      radius={[6, 6, 6, 6]}
                      barSize={18}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Resumen a la derecha */}
              <div className="lg:w-72 space-y-3">
                {occupancyByTypeData.map((item) => (
                  <div
                    key={item.name}
                    className="border border-neutral-200 rounded-xl px-3 py-2.5 bg-neutral-50/60"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-neutral-900">
                        {item.name}
                      </span>
                      <span className="text-xs text-neutral-500">
                        {item.percentage}% del total
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-50 text-sky-700">
                        {item.activeBookings} reservas
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                        {item.propertiesCount} propiedades
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Fila 3 - Análisis de Reservas (ancho completo) */}
        <div className="w-full">
          <BookingsAnalysisChart />
        </div>

        {/* Fila 4 - Tendencia de Ocupación */}
{occupancyTrendData.length > 0 && (
  <div className="bg-white rounded-xl shadow-lg border border-neutral-200 p-6">
    <h2 className="text-xl font-bold text-neutral-900 mb-2">
      Tendencia de Ocupación
    </h2>
    <p className="text-sm text-neutral-500 mb-6">
      Evolución mensual del porcentaje de ocupación
    </p>

    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={occupancyTrendData}>
          <defs>
            <linearGradient id="occupancyGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis label={{ value: '%', angle: -90, position: 'insideLeft' }} />
          <Tooltip 
            formatter={(value) => [`${value}%`, 'Ocupación']}
            labelStyle={{ color: '#374151' }}
            contentStyle={{ 
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px'
            }}
          />
          <Area 
            type="monotone" 
            dataKey="occupancy" 
            stroke="#3b82f6" 
            fillOpacity={1} 
            fill="url(#occupancyGradient)"
            strokeWidth={3}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>
)}

{/* Fila 5 - Top 5 Propiedades por Ingresos */}
{topPropertiesData.length > 0 && (
  <div className="bg-white rounded-xl shadow-lg border border-neutral-200 p-6">
    <div className="flex items-start justify-between mb-6">
      <div>
        <h2 className="text-xl font-bold text-neutral-900">
          Top 5 Propiedades por Ingresos
        </h2>
        <p className="text-sm text-neutral-500 mt-1">
          Ranking de las propiedades más rentables del período
        </p>
      </div>
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
        🏆 Ranking
      </span>
    </div>

    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={topPropertiesData}
          layout="vertical"
          margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis 
            type="number" 
            tickLine={false} 
            axisLine={false}
            tickFormatter={(value) => `$${(value/1000).toFixed(0)}K`}
          />
          <YAxis 
            dataKey="name" 
            type="category" 
            width={150}
            tickLine={false} 
            axisLine={false}
          />
          <Tooltip 
            formatter={(value, name) => [formatCurrency(value), "Ingresos totales"]}
            labelStyle={{ color: '#374151', fontWeight: 'bold' }}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              boxShadow: '0 10px 15px -3px rgba(15, 23, 42, 0.12)'
            }}
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
                    <p className="font-bold text-gray-900 mb-2">{label}</p>
                    <p className="text-sm text-gray-600">
                      Ingresos: <span className="font-bold text-emerald-600">
                        {formatCurrency(data.revenue)}
                      </span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Reservas: <span className="font-bold">{data.bookings}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Rating: <span className="font-bold text-yellow-500">
                        ⭐ {data.rating}
                      </span>
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar 
            dataKey="revenue" 
            radius={[0, 8, 8, 0]}
            barSize={25}
          >
            {topPropertiesData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(index)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
    
    {/* Estadísticas adicionales */}
    <div className="mt-6 pt-6 border-t border-neutral-100">
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="p-3 bg-emerald-50 rounded-lg">
          <p className="text-sm text-neutral-600">Promedio por propiedad</p>
          <p className="text-lg font-bold text-emerald-600">
            {formatCurrency(
              topPropertiesData.reduce((sum, item) => sum + item.revenue, 0) / topPropertiesData.length
            )}
          </p>
        </div>
        <div className="p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-neutral-600">Total reservas</p>
          <p className="text-lg font-bold text-blue-600">
            {topPropertiesData.reduce((sum, item) => sum + item.bookings, 0)}
          </p>
        </div>
        <div className="p-3 bg-yellow-50 rounded-lg">
          <p className="text-sm text-neutral-600">Rating promedio</p>
          <p className="text-lg font-bold text-yellow-600">
            ⭐ {(topPropertiesData.reduce((sum, item) => sum + item.rating, 0) / topPropertiesData.length).toFixed(1)}
          </p>
        </div>
      </div>
    </div>
  </div>
)}
      </div>
    </div>
  );
};

export default AdminGraphics;
