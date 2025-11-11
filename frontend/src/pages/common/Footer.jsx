import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-accent-700" role="contentinfo">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <nav aria-label="Enlaces del pie de página">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-lg font-semibold text-white">Arroyo Seco</h3>
              <p className="mt-2 text-sm text-primary-100">
                Plataforma de reservas turísticas para el municipio de Arroyo Seco, Querétaro.
                Descubre y reserva los mejores alojamientos en nuestra hermosa región.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white">Enlaces Rápidos</h4>
              <ul className="mt-4 space-y-2" role="list">
                <li>
                  <Link to="/search" className="text-sm text-primary-100 hover:text-white transition-colors">
                    Buscar Propiedades
                  </Link>
                </li>
                <li>
                  <Link to="/register?role=host" className="text-sm text-primary-100 hover:text-white transition-colors">
                    Conviértete en Anfitrión
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-sm text-primary-100 hover:text-white transition-colors">
                    Acerca de
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-sm text-primary-100 hover:text-white transition-colors">
                    Contacto
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white">Legal</h4>
              <ul className="mt-4 space-y-2" role="list">
                <li>
                  <Link to="/terms-of-service" className="text-sm text-primary-100 hover:text-white transition-colors">
                    Términos y Condiciones
                  </Link>
                </li>
                <li>
                  <Link to="/privacy-policy" className="text-sm text-primary-100 hover:text-white transition-colors">
                    Política de Privacidad
                  </Link>
                </li>
                <li>
                  <Link to="/cancellation" className="text-sm text-primary-100 hover:text-white transition-colors">
                    Política de Cancelación
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        <div className="mt-8 border-t border-accent-600 pt-8">
          <p className="text-center text-xs text-primary-100">
            © 2025 Arroyo Seco. Todos los derechos reservados.
            Desarrollado por Equipo 2 - UTEQ
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;