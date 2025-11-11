import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import FontSizeControl from './FontSizeControl';
import ThemeToggle from '../../components/ThemeToggle';
import {
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  HomeIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon
} from '@heroicons/react/24/outline';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout, isHost, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-accent-700 focus:text-white focus:rounded-md focus:shadow-lg"
      >
        Saltar al contenido principal
      </a>

      <header className="bg-white dark:bg-neutral-800 shadow-soft border-b border-primary-100 dark:border-neutral-700">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Navegación principal">
          <div className="flex h-16 justify-between">
            <div className="flex items-center gap-4">
              {/* NORMA 2: Texto alternativo descriptivo (WCAG 1.1.1) */}
              <Link to="/" className="flex flex-shrink-0 items-center">
                <img
                  src="/xilum_logo1.png"
                  alt="Arroyo Seco - Ir a página de inicio"
                  className="h-20 w-auto"
                />
              </Link>

              <div className="hidden lg:flex lg:items-center lg:gap-2">
                <FontSizeControl />
                <ThemeToggle />
              </div>

              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to="/"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-accent-800 dark:text-accent-200 border-b-2 border-transparent hover:border-secondary-500 transition-colors"
                >
                  Inicio
                </Link>
                <Link
                  to="/search"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:text-accent-800 dark:hover:text-accent-200 border-b-2 border-transparent hover:border-secondary-500 transition-colors"
                >
                  Buscar Propiedades
                </Link>
              </div>
            </div>

            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              {user ? (
                <div className="flex items-center space-x-4">
                  {isHost && (
                    <Link
                      to="/host/properties"
                      className="text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-accent-800 dark:hover:text-accent-200 transition-colors"
                    >
                      Mis Propiedades
                    </Link>
                  )}
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-accent-800 dark:hover:text-accent-200 transition-colors"
                    >
                      Admin
                    </Link>
                  )}
                  <Link
                    to="/guest/bookings"
                    className="text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-accent-800 dark:hover:text-accent-200 transition-colors"
                  >
                    Mis Reservas
                  </Link>
                  <div className="flex items-center gap-3 ml-3 pl-3 border-l border-neutral-200 dark:border-neutral-600">
                    {/* NORMA 2: ARIA labels para iconos (WCAG 4.1.2) */}
                    <Link
                      to={`/${user?.role}/settings`}
                      className="group transition-colors"
                      aria-label="Ir a configuración de la cuenta"
                    >
                      <Cog6ToothIcon className="h-6 w-6 text-neutral-500 dark:text-neutral-400 group-hover:text-accent-700 dark:group-hover:text-accent-300" aria-hidden="true" />
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="group transition-colors"
                      aria-label="Cerrar sesión"
                    >
                      <ArrowLeftOnRectangleIcon className="h-6 w-6 text-neutral-500 dark:text-neutral-400 group-hover:text-accent-700 dark:group-hover:text-accent-300" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/login"
                    className="text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-accent-800 dark:hover:text-accent-200 transition-colors"
                  >
                    Iniciar Sesión
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary"
                  >
                    Registrarse
                  </Link>
                </div>
              )}
            </div>

            <div className="-mr-2 flex items-center sm:hidden">
              {/* NORMA 2: ARIA para botón de menú móvil (WCAG 4.1.2) */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center rounded-md p-2 text-neutral-500 dark:text-neutral-400 hover:bg-primary-50 dark:hover:bg-neutral-700 hover:text-accent-700 dark:hover:text-accent-300 transition-colors"
                aria-label={mobileMenuOpen ? "Cerrar menú de navegación" : "Abrir menú de navegación"}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-menu"
              >
                {mobileMenuOpen ? (
                  <XMarkIcon className="block h-6 w-6 icon-neutral" aria-hidden="true" />
                ) : (
                  <Bars3Icon className="block h-6 w-6 icon-neutral" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </nav>

        {/* Menú móvil */}
        {mobileMenuOpen && (
          <div id="mobile-menu" className="sm:hidden bg-white dark:bg-neutral-800 border-t border-primary-100 dark:border-neutral-700">
            {/* NORMA 3: Control de tamaño de fuente (WCAG 1.4.4) - Móvil */}
            <div className="px-4 py-3 border-b border-primary-100 dark:border-neutral-700 flex items-center justify-between gap-4">
              <FontSizeControl />
              <ThemeToggle />
            </div>

            <div className="space-y-1 pb-3 pt-2">
              <Link
                to="/"
                className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-neutral-600 dark:text-neutral-300 hover:border-secondary-500 hover:bg-primary-50 dark:hover:bg-neutral-700 hover:text-accent-800 dark:hover:text-accent-200 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Inicio
              </Link>
              <Link
                to="/search"
                className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-neutral-600 dark:text-neutral-300 hover:border-secondary-500 hover:bg-primary-50 dark:hover:bg-neutral-700 hover:text-accent-800 dark:hover:text-accent-200 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Buscar Propiedades
              </Link>
            </div>
            <div className="border-t border-primary-200 dark:border-neutral-700 pb-3 pt-4">
              {user ? (
                <>
                  <div className="flex items-center px-4">
                    <UserCircleIcon className="h-10 w-10 text-neutral-500 dark:text-neutral-400" aria-hidden="true" />
                    <div className="ml-3 flex-1">
                      <div className="text-base font-medium text-accent-800 dark:text-accent-200">
                        {user.name}
                      </div>
                      <div className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                        {user.email}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/${user?.role}/settings`}
                        className="group transition-colors"
                        aria-label="Ir a configuración de la cuenta"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Cog6ToothIcon className="h-6 w-6 text-neutral-500 dark:text-neutral-400 group-hover:text-accent-700 dark:group-hover:text-accent-300" aria-hidden="true" />
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="group transition-colors"
                        aria-label="Cerrar sesión"
                      >
                        <ArrowLeftOnRectangleIcon className="h-6 w-6 text-neutral-500 dark:text-neutral-400 group-hover:text-accent-700 dark:group-hover:text-accent-300" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1">
                    <Link
                      to="/guest/bookings"
                      className="block px-4 py-2 text-base font-medium text-neutral-600 dark:text-neutral-300 hover:bg-primary-50 dark:hover:bg-neutral-700 hover:text-accent-800 dark:hover:text-accent-200 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Mis Reservas
                    </Link>
                    {isHost && (
                      <Link
                        to="/host/properties"
                        className="block px-4 py-2 text-base font-medium text-neutral-600 dark:text-neutral-300 hover:bg-primary-50 dark:hover:bg-neutral-700 hover:text-accent-800 dark:hover:text-accent-200 transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Mis Propiedades
                      </Link>
                    )}
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="block px-4 py-2 text-base font-medium text-neutral-600 dark:text-neutral-300 hover:bg-primary-50 dark:hover:bg-neutral-700 hover:text-accent-800 dark:hover:text-accent-200 transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Admin
                      </Link>
                    )}
                  </div>
                </>
              ) : (
                <div className="mt-3 space-y-1">
                  <Link
                    to="/login"
                    className="block px-4 py-2 text-base font-medium text-neutral-600 dark:text-neutral-300 hover:bg-primary-50 dark:hover:bg-neutral-700 hover:text-accent-800 dark:hover:text-accent-200 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Iniciar Sesión
                  </Link>
                  <Link
                    to="/register"
                    className="block px-4 py-2 text-base font-medium text-neutral-600 dark:text-neutral-300 hover:bg-primary-50 dark:hover:bg-neutral-700 hover:text-accent-800 dark:hover:text-accent-200 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Registrarse
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;