import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PendingBookingsBadge from '../components/PendingBookingsBadge';
import ThemeToggle from '../components/ThemeToggle';
import {
  HomeIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  UsersIcon,
  ChartBarIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowLeftOnRectangleIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowLeftIcon
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
    { name: 'Reservas Recibidas', href: '/host/bookings', icon: CalendarIcon, showBadge: true }
  ];

const adminNavigation = [
  { name: 'Dashboard', href: '/admin', icon: HomeIcon },
  { name: 'Propiedades Pendientes', href: '/admin/properties/pending', icon: BuildingOfficeIcon },
  { name: 'Todas las Reservas', href: '/admin/bookings', icon: CalendarIcon, showBadge: true },
  { name: 'Usuarios', href: '/admin/users', icon: UsersIcon },
  { name: 'Tipos de Alojamiento', href: '/admin/accommodation-types', icon: BuildingOfficeIcon },
  { name: 'Reportes', href: '/admin/reports', icon: ChartBarIcon }
];

  const navigation = isAdmin ? adminNavigation : (isHost ? hostNavigation : guestNavigation);

  return (
    <div className="h-screen flex overflow-hidden bg-neutral-50 dark:bg-neutral-900">
      {/* Sidebar móvil */}
      <div className={`md:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 flex z-40">
          <div className="fixed inset-0" onClick={() => setSidebarOpen(false)}>
            <div className="absolute inset-0 bg-neutral-900 opacity-75"></div>
          </div>

          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-neutral-800 shadow-large">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-300"
                onClick={() => setSidebarOpen(false)}
              >
                <XMarkIcon className="h-6 w-6 text-white icon-muted" />
              </button>
            </div>

            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center justify-between px-4 mb-4">
                <h1 className="text-xl font-bold text-accent-800 dark:text-accent-200">Arroyo Seco</h1>
                <button
                  onClick={() => {
                    setSidebarOpen(false);
                    navigate(-1);
                  }}
                  className="p-2 rounded-md transition-colors hover:bg-primary-100 dark:hover:bg-neutral-700"
                  title="Regresar"
                >
                  <ArrowLeftIcon className="h-5 w-5 icon-interactive" />
                </button>
              </div>

              {/* Botón para ir a la página principal */}
              <div className="px-2 mb-2">
                <Link
                  to="/"
                  onClick={() => setSidebarOpen(false)}
                  className="group flex items-center px-2 py-2 text-base font-medium rounded-button transition-colors text-neutral-700 dark:text-neutral-200 hover:bg-primary-100 dark:hover:bg-neutral-700 hover:text-accent-800 dark:hover:text-accent-300"
                >
                  <HomeIcon className="mr-4 h-6 w-6 icon-interactive" />
                  Página Principal
                </Link>
              </div>

              <nav className="mt-3 px-2 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center justify-between px-2 py-2 text-base font-medium rounded-button transition-colors ${
                      location.pathname === item.href
                        ? 'bg-secondary-500 text-white dark:bg-secondary-600'
                        : 'text-neutral-700 dark:text-neutral-200 hover:bg-primary-100 dark:hover:bg-neutral-700 hover:text-accent-800 dark:hover:text-accent-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <item.icon className={`mr-4 h-6 w-6 ${location.pathname === item.href ? 'icon-muted' : 'icon-interactive'}`} />
                      {item.name}
                    </div>
                    {item.showBadge && <PendingBookingsBadge userRole={user?.role} />}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="flex-shrink-0 flex border-t border-primary-200 dark:border-neutral-700 p-4">
              <div className="flex items-center w-full">
                <UserCircleIcon className="h-10 w-10 icon-neutral" />
                <div className="ml-3 flex-1">
                  <p className="text-base font-medium text-accent-800 dark:text-accent-200">{user?.name}</p>
                  <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">{user?.role}</p>
                </div>
                <div className="flex items-center gap-2">
                  <ThemeToggle />
                  <Link
                    to={`/${user?.role}/settings`}
                    className="group transition-colors"
                    title="Configuración"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Cog6ToothIcon className="h-6 w-6 icon-neutral group-hover:text-accent-700" />
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="group transition-colors"
                    title="Cerrar sesión"
                  >
                    <ArrowLeftOnRectangleIcon className="h-6 w-6 icon-neutral group-hover:text-accent-700" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-neutral-800 border-r border-primary-200 dark:border-neutral-700 shadow-soft">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4 mb-4">
                <h1 className="text-xl font-bold text-accent-800 dark:text-accent-200">Arroyo Seco</h1>
              </div>

              {/* Botón para ir a la página principal */}
              <div className="px-2 mb-2">
                <Link
                  to="/"
                  className="group flex items-center px-2 py-2 text-sm font-medium rounded-button transition-colors text-neutral-700 dark:text-neutral-200 hover:bg-primary-100 dark:hover:bg-neutral-700 hover:text-accent-800 dark:hover:text-accent-300"
                >
                  <HomeIcon className="mr-3 h-6 w-6 icon-interactive" />
                  Página Principal
                </Link>
              </div>

              <nav className="mt-3 flex-1 px-2 bg-white dark:bg-neutral-800 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center justify-between px-2 py-2 text-sm font-medium rounded-button transition-colors ${
                      location.pathname === item.href
                        ? 'bg-secondary-500 text-white dark:bg-secondary-600'
                        : 'text-neutral-700 dark:text-neutral-200 hover:bg-primary-100 dark:hover:bg-neutral-700 hover:text-accent-800 dark:hover:text-accent-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <item.icon className={`mr-3 h-6 w-6 ${location.pathname === item.href ? 'icon-muted' : 'icon-interactive'}`} />
                      {item.name}
                    </div>
                    {item.showBadge && <PendingBookingsBadge userRole={user?.role} />}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="flex-shrink-0 flex border-t border-primary-200 dark:border-neutral-700 p-4">
              <div className="flex items-center w-full">
                <UserCircleIcon className="h-10 w-10 icon-neutral" />
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-accent-800 dark:text-accent-200">{user?.name}</p>
                  <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400">{user?.role}</p>
                </div>
                <div className="flex items-center gap-2">
                  <ThemeToggle />
                  <Link
                    to={`/${user?.role}/settings`}
                    className="group transition-colors"
                    title="Configuración"
                  >
                    <Cog6ToothIcon className="h-5 w-5 icon-neutral group-hover:text-accent-700" />
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="group transition-colors"
                    title="Cerrar sesión"
                  >
                    <ArrowLeftOnRectangleIcon className="h-5 w-5 icon-neutral group-hover:text-accent-700" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <div className="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-white dark:bg-neutral-800 border-b border-primary-100 dark:border-neutral-700 flex items-center gap-2">
          <button
            className="h-12 w-12 inline-flex items-center justify-center rounded-md transition-colors hover:bg-primary-100 dark:hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-secondary-500"
            onClick={() => navigate(-1)}
            title="Regresar"
          >
            <ArrowLeftIcon className="h-6 w-6 icon-interactive" />
          </button>
          <button
            className="h-12 w-12 inline-flex items-center justify-center rounded-md transition-colors hover:bg-primary-100 dark:hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-secondary-500"
            onClick={() => setSidebarOpen(true)}
            title="Menú"
          >
            <Bars3Icon className="h-6 w-6 icon-interactive" />
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