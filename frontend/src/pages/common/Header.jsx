import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  HomeIcon
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
    <header className="bg-white shadow-soft border-b border-primary-100">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <Link to="/" className="flex flex-shrink-0 items-center">
              <HomeIcon className="h-8 w-8 text-secondary-500" />
              <span className="ml-2 text-xl font-bold text-accent-800">
                Arroyo Seco
              </span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-accent-800 border-b-2 border-transparent hover:border-secondary-500 transition-colors"
              >
                Inicio
              </Link>
              <Link
                to="/search"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-neutral-600 hover:text-accent-800 border-b-2 border-transparent hover:border-secondary-500 transition-colors"
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
                    className="text-sm font-medium text-neutral-700 hover:text-accent-800 transition-colors"
                  >
                    Mis Propiedades
                  </Link>
                )}
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="text-sm font-medium text-neutral-700 hover:text-accent-800 transition-colors"
                  >
                    Admin
                  </Link>
                )}
                <Link
                  to="/guest/bookings"
                  className="text-sm font-medium text-neutral-700 hover:text-accent-800 transition-colors"
                >
                  Mis Reservas
                </Link>
                <div className="relative ml-3">
                  <button
                    onClick={handleLogout}
                    className="flex items-center text-sm font-medium text-neutral-700 hover:text-accent-800 transition-colors"
                  >
                    <UserCircleIcon className="h-8 w-8 text-neutral-500" />
                    <span className="ml-2">{user.name}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-sm font-medium text-neutral-700 hover:text-accent-800 transition-colors"
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
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-neutral-500 hover:bg-primary-50 hover:text-accent-700 transition-colors"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="block h-6 w-6 icon-neutral" />
              ) : (
                <Bars3Icon className="block h-6 w-6 icon-neutral" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Menú móvil */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-white border-t border-primary-100">
          <div className="space-y-1 pb-3 pt-2">
            <Link
              to="/"
              className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-neutral-600 hover:border-secondary-500 hover:bg-primary-50 hover:text-accent-800 transition-colors"
            >
              Inicio
            </Link>
            <Link
              to="/search"
              className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-neutral-600 hover:border-secondary-500 hover:bg-primary-50 hover:text-accent-800 transition-colors"
            >
              Buscar Propiedades
            </Link>
          </div>
          <div className="border-t border-primary-200 pb-3 pt-4">
            {user ? (
              <>
                <div className="flex items-center px-4">
                  <UserCircleIcon className="h-10 w-10 text-neutral-500" />
                  <div className="ml-3">
                    <div className="text-base font-medium text-accent-800">
                      {user.name}
                    </div>
                    <div className="text-sm font-medium text-neutral-600">
                      {user.email}
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  <Link
                    to="/guest/bookings"
                    className="block px-4 py-2 text-base font-medium text-neutral-600 hover:bg-primary-50 hover:text-accent-800 transition-colors"
                  >
                    Mis Reservas
                  </Link>
                  {isHost && (
                    <Link
                      to="/host/properties"
                      className="block px-4 py-2 text-base font-medium text-neutral-600 hover:bg-primary-50 hover:text-accent-800 transition-colors"
                    >
                      Mis Propiedades
                    </Link>
                  )}
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="block px-4 py-2 text-base font-medium text-neutral-600 hover:bg-primary-50 hover:text-accent-800 transition-colors"
                    >
                      Admin
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="block w-full px-4 py-2 text-left text-base font-medium text-neutral-600 hover:bg-primary-50 hover:text-accent-800 transition-colors"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              </>
            ) : (
              <div className="mt-3 space-y-1">
                <Link
                  to="/login"
                  className="block px-4 py-2 text-base font-medium text-neutral-600 hover:bg-primary-50 hover:text-accent-800 transition-colors"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  to="/register"
                  className="block px-4 py-2 text-base font-medium text-neutral-600 hover:bg-primary-50 hover:text-accent-800 transition-colors"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;