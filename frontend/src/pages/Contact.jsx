import React from 'react';
import { Link } from 'react-router-dom';
import { PhoneIcon, EnvelopeIcon, MapPinIcon } from '@heroicons/react/24/outline';

const Contact = () => {
  return (
    <div className="bg-gray-50 dark:bg-neutral-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-neutral-800 shadow-lg rounded-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-neutral-100 mb-6">
          Contacto
        </h1>

        <section className="mb-8">
          <p className="text-gray-700 dark:text-neutral-300 mb-6">
            ¿Tienes alguna pregunta, sugerencia o necesitas ayuda? Estamos aquí para ayudarte.
            No dudes en ponerte en contacto con nosotros a través de los siguientes medios:
          </p>

          <div className="space-y-6">
            {/* Teléfono */}
            <div className="flex items-start space-x-4 p-6 bg-primary-50 dark:bg-neutral-700 rounded-lg hover:bg-primary-100 dark:hover:bg-neutral-600 transition-colors">
              <div className="flex-shrink-0">
                <PhoneIcon className="h-8 w-8 text-secondary-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-neutral-200 mb-2">Teléfono</h3>
                <a
                  href="tel:4428139975"
                  className="text-lg text-secondary-600 hover:text-secondary-700 font-medium"
                >
                  442 813 9975
                </a>
                <p className="text-sm text-gray-600 dark:text-neutral-400 mt-1">
                  Lunes a Viernes: 9:00 AM - 6:00 PM
                </p>
              </div>
            </div>

            {/* Correo electrónico */}
            <div className="flex items-start space-x-4 p-6 bg-primary-50 dark:bg-neutral-700 rounded-lg hover:bg-primary-100 dark:hover:bg-neutral-600 transition-colors">
              <div className="flex-shrink-0">
                <EnvelopeIcon className="h-8 w-8 text-secondary-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-neutral-200 mb-2">Correo Electrónico</h3>
                <a
                  href="mailto:maridimas@gmail.com"
                  className="text-lg text-secondary-600 hover:text-secondary-700 font-medium break-all"
                >
                  maridimas@gmail.com
                </a>
                <p className="text-sm text-gray-600 dark:text-neutral-400 mt-1">
                  Tiempo de respuesta: 24-48 horas
                </p>
              </div>
            </div>

            {/* Ubicación */}
            <div className="flex items-start space-x-4 p-6 bg-primary-50 dark:bg-neutral-700 rounded-lg">
              <div className="flex-shrink-0">
                <MapPinIcon className="h-8 w-8 text-secondary-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-neutral-200 mb-2">Ubicación</h3>
                <p className="text-gray-700 dark:text-neutral-300">
                  Arroyo Seco, Querétaro<br />
                  México
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-neutral-200 mb-4">Preguntas Frecuentes</h2>
          <div className="space-y-4">
            <div className="border-l-4 border-secondary-500 dark:border-secondary-400 pl-4">
              <h3 className="font-semibold text-gray-800 dark:text-neutral-200 mb-2">¿Cómo puedo reservar un alojamiento?</h3>
              <p className="text-gray-700 dark:text-neutral-300">
                Simplemente busca la propiedad que te interesa, selecciona las fechas y completa
                el proceso de reserva siguiendo los pasos indicados en la plataforma.
              </p>
            </div>

            <div className="border-l-4 border-secondary-500 dark:border-secondary-400 pl-4">
              <h3 className="font-semibold text-gray-800 dark:text-neutral-200 mb-2">¿Cómo me convierto en anfitrión?</h3>
              <p className="text-gray-700 dark:text-neutral-300">
                Regístrate en nuestra plataforma seleccionando la opción "Anfitrión" y sigue los
                pasos para publicar tu propiedad. Nuestro equipo revisará tu solicitud.
              </p>
            </div>

            <div className="border-l-4 border-secondary-500 dark:border-secondary-400 pl-4">
              <h3 className="font-semibold text-gray-800 dark:text-neutral-200 mb-2">¿Cuál es la política de cancelación?</h3>
              <p className="text-gray-700 dark:text-neutral-300">
                Consulta nuestra{' '}
                <Link to="/cancellation" className="text-secondary-600 hover:text-secondary-700 font-medium">
                  Política de Cancelación
                </Link>{' '}
                para conocer los detalles completos.
              </p>
            </div>

            <div className="border-l-4 border-secondary-500 dark:border-secondary-400 pl-4">
              <h3 className="font-semibold text-gray-800 dark:text-neutral-200 mb-2">¿Mis datos están seguros?</h3>
              <p className="text-gray-700 dark:text-neutral-300">
                Sí, tomamos muy en serio la seguridad de tus datos. Lee nuestra{' '}
                <Link to="/privacy-policy" className="text-secondary-600 hover:text-secondary-700 font-medium">
                  Política de Privacidad
                </Link>{' '}
                para más información.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-gradient-primary p-6 rounded-lg">
          <h2 className="text-2xl font-bold text-accent-900 mb-4">¿Necesitas Ayuda Inmediata?</h2>
          <p className="text-accent-700 mb-4">
            Nuestro equipo está listo para asistirte. Contáctanos por teléfono o correo electrónico
            y te responderemos lo antes posible.
          </p>
          <div className="flex flex-wrap gap-4">
            <a href="tel:4428139975" className="btn-secondary">
              Llamar Ahora
            </a>
            <a href="mailto:maridimas@gmail.com" className="btn-accent">
              Enviar Email
            </a>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Contact;
