import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-800">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-lg font-semibold text-white">Arroyo Seco</h3>
            <p className="mt-2 text-sm text-gray-400">
              Plataforma de reservas turísticas para el municipio de Arroyo Seco, Querétaro.
              Descubre y reserva los mejores alojamientos en nuestra hermosa región.
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-white">Enlaces Rápidos</h4>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/search" className="text-sm text-gray-400 hover:text-white">
                  Buscar Propiedades
                </Link>
              </li>
              <li>
                <Link to="/register?role=host" className="text-sm text-gray-400 hover:text-white">
                  Conviértete en Anfitrión
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-gray-400 hover:text-white">
                  Acerca de
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-gray-400 hover:text-white">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-white">Legal</h4>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/terms" className="text-sm text-gray-400 hover:text-white">
                  Términos y Condiciones
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-gray-400 hover:text-white">
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <Link to="/cancellation" className="text-sm text-gray-400 hover:text-white">
                  Política de Cancelación
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 border-t border-gray-700 pt-8">
          <p className="text-center text-xs text-gray-400">
            © 2025 Arroyo Seco. Todos los derechos reservados. 
            Desarrollado por Equipo 2 - UTEQ
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;