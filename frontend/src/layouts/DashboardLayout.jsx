import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HomeIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  UsersIcon,
  ChartBarIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowLeftOnRectangleIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, isHost, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const guestNavigation = [
    { name: 'Mis Reservas', href: '/guest/bookings', icon: CalendarIcon }
  ];

  const hostNavigation = [
    { name: 'Mis Propiedades', href: '/host/properties', icon: BuildingOfficeIcon },
    { name: 'Reservas Recibidas', href: '/host/bookings', icon: CalendarIcon }
  ];

  const adminNavigation = [
    { name: 'Dashboard', href: '/admin', icon: HomeIcon },
    { name: 'Propiedades Pendientes', href: '/admin/properties/pending', icon: BuildingOfficeIcon },
    { name: 'Usuarios', href: '/admin/users', icon: UsersIcon },
    { name: 'Reportes', href: '/admin/reports', icon: ChartBarIcon }
  ];

  const navigation = isAdmin ? adminNavigation : (isHost ? hostNavigation : guestNavigation);

  return (
    <div className="h-screen flex overflow-hidden bg-neutral-50">
      {/* Sidebar móvil */}
      <div className={`md:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 flex z-40">
          <div className="fixed inset-0" onClick={() => setSidebarOpen(false)}>
            <div className="absolute inset-0 bg-neutral-900 opacity-75"></div>
          </div>

          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-large">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-300"
                onClick={() => setSidebarOpen(false)}
              >
                <XMarkIcon className="h-6 w-6 text-white icon-muted" />
              </button>
            </div>

            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center px-4">
                <h1 className="text-xl font-bold text-accent-800">Arroyo Seco</h1>
              </div>
              <nav className="mt-5 px-2 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-2 py-2 text-base font-medium rounded-button transition-colors ${
                      location.pathname === item.href
                        ? 'bg-secondary-500 text-white'
                        : 'text-neutral-700 hover:bg-primary-100 hover:text-accent-800'
                    }`}
                  >
                    <item.icon className={`mr-4 h-6 w-6 ${location.pathname === item.href ? 'icon-muted' : 'icon-interactive'}`} />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="flex-shrink-0 flex border-t border-primary-200 p-4">
              <div className="flex items-center">
                <UserCircleIcon className="h-10 w-10 icon-neutral" />
                <div className="ml-3">
                  <p className="text-base font-medium text-accent-800">{user?.name}</p>
                  <p className="text-sm font-medium text-neutral-600">{user?.role}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex-1 flex flex-col min-h-0 bg-white border-r border-primary-200 shadow-soft">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <h1 className="text-xl font-bold text-accent-800">Arroyo Seco</h1>
              </div>
              <nav className="mt-5 flex-1 px-2 bg-white space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-button transition-colors ${
                      location.pathname === item.href
                        ? 'bg-secondary-500 text-white'
                        : 'text-neutral-700 hover:bg-primary-100 hover:text-accent-800'
                    }`}
                  >
                    <item.icon className={`mr-3 h-6 w-6 ${location.pathname === item.href ? 'icon-muted' : 'icon-interactive'}`} />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="flex-shrink-0 flex border-t border-primary-200 p-4">
              <div className="flex items-center w-full">
                <UserCircleIcon className="h-10 w-10 text-neutral-500" />
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-accent-800">{user?.name}</p>
                  <p className="text-xs font-medium text-neutral-600">{user?.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-auto text-neutral-500 hover:text-accent-700 transition-colors"
                  title="Cerrar sesión"
                >
                  <ArrowLeftOnRectangleIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <div className="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-white border-b border-primary-100">
          <button
            className="h-12 w-12 inline-flex items-center justify-center rounded-md text-neutral-500 hover:text-accent-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-secondary-500 transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
        </div>

        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;