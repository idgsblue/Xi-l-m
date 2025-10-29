import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Pages públicas
import Home from './pages/Home';
import Search from './pages/Search';
import PropertyDetail from './pages/PropertyDetail';
import Login from './pages/Login';
import Register from './pages/Register';

// Pages protegidas - Huésped
import MyBookings from './pages/guest/MyBookings';
import Booking from './pages/guest/Booking';
import BookingConfirmation from './pages/guest/BookingConfirmation';

// Pages protegidas - Anfitrión
import MyProperties from './pages/host/MyProperties';
import AddProperty from './pages/host/AddProperty';
import EditProperty from './pages/host/EditProperty';
import HostBookings from './pages/host/HostBookings';

// Pages protegidas - Admin
import AdminDashboard from './pages/admin/Dashboard';
import PendingProperties from './pages/admin/PendingProperties';
import ManageUsers from './pages/admin/ManageUsers';
import Reports from './pages/admin/Reports';

// Componente para rutas protegidas
const ProtectedRoute = ({ children, roles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="search" element={<Search />} />
        <Route path="property/:id" element={<PropertyDetail />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
      </Route>

      {/* Rutas protegidas - Huésped */}
      <Route path="/guest" element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route path="bookings" element={<MyBookings />} />
        <Route path="booking/:propertyId" element={<Booking />} />
        <Route path="booking-confirmation/:bookingId" element={<BookingConfirmation />} />
      </Route>

      {/* Rutas protegidas - Anfitrión */}
      <Route path="/host" element={
        <ProtectedRoute roles={['host', 'admin']}>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route path="properties" element={<MyProperties />} />
        <Route path="properties/add" element={<AddProperty />} />
        <Route path="properties/edit/:id" element={<EditProperty />} />
        <Route path="bookings" element={<HostBookings />} />
      </Route>

      {/* Rutas protegidas - Admin */}
      <Route path="/admin" element={
        <ProtectedRoute roles={['admin']}>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="properties/pending" element={<PendingProperties />} />
        <Route path="users" element={<ManageUsers />} />
        <Route path="reports" element={<Reports />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
