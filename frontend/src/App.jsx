import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';

// PWA Install Prompt
import PWAInstallPrompt from './components/PWAInstallPrompt';

// Pages públicas
import Home from './pages/Home';
import Search from './pages/Search';
import PropertyDetail from './pages/PropertyDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Settings from './pages/Settings';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import CancellationPolicy from './pages/CancellationPolicy';
import About from './pages/About';
import Contact from './pages/Contact';

// Pages protegidas - Huésped
import MyBookings from './pages/guest/MyBookings';
import Booking from './pages/guest/Booking';
import BookingConfirmation from './pages/guest/BookingConfirmation';
import BookingPaymentForm from './pages/guest/BookingPaymentForm';
import BookingPayment from './pages/guest/BookingPayment';

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
import AllBookings from './pages/admin/AllBookings';

import AccommodationTypes from './pages/admin/AccommodationTypes';

import AvailabilityCalendar from './pages/host/AvailabilityCalendar';



// Componente para rutas protegidas
const ProtectedRoute = ({ children, roles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-primary-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary-500"></div>
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
    <>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="search" element={<Search />} />
          <Route path="property/:id" element={<PropertyDetail />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="privacy-policy" element={<PrivacyPolicy />} />
          <Route path="terms-and-conditions" element={<TermsOfService />} />
          <Route path="terms-of-service" element={<TermsOfService />} />
          <Route path="cancellation" element={<CancellationPolicy />} />
        </Route>

      {/* Rutas protegidas - Huésped */}
      <Route path="/guest" element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route path="bookings" element={<MyBookings />} />
        <Route path="booking/:propertyId" element={<Booking />} />
        <Route path="booking-payment-form/:bookingId" element={<BookingPaymentForm />} />
        <Route path="booking-payment" element={<BookingPayment />} />
        <Route path="booking-confirmation/:bookingId" element={<BookingConfirmation />} />
        <Route path="settings" element={<Settings />} />
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
  {/* ✅ NUEVA RUTA */}
  <Route path="properties/:id/availability" element={<AvailabilityCalendar />} />
  <Route path="bookings" element={<HostBookings />} />
  <Route path="settings" element={<Settings />} />
</Route>

      {/* Rutas protegidas - Admin */}
<Route path="/admin" element={
  <ProtectedRoute roles={['admin']}>
    <DashboardLayout />
  </ProtectedRoute>
}>
  <Route index element={<AdminDashboard />} />
  <Route path="properties/pending" element={<PendingProperties />} />
  <Route path="bookings" element={<AllBookings />} />
  <Route path="users" element={<ManageUsers />} />
  <Route path="reports" element={<Reports />} />
  <Route path="accommodation-types" element={<AccommodationTypes />} />
  <Route path="settings" element={<Settings />} />
</Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* PWA Install Banner */}
      <PWAInstallPrompt />
    </>
  );
}

export default App;
