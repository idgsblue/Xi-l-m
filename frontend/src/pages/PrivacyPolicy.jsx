import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8">
        <Link to="/" className="text-primary-600 hover:text-primary-700 mb-4 inline-block">
          ← Volver al inicio
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Política de Privacidad - Xilum (Arroyo Seco Booking)
        </h1>

        <p className="text-sm text-gray-600 mb-8">
          <strong>Última actualización:</strong> 6 de noviembre de 2025<br />
          <strong>Vigencia:</strong> A partir del 6 de noviembre de 2025
        </p>

        <hr className="mb-8" />

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">1. Introducción</h2>
          <p className="text-gray-700 mb-4">
            Bienvenido a <strong>Xilum</strong> (en adelante, "la Aplicación", "nosotros", "nuestro" o "nos"),
            una plataforma de reservas de alojamiento operada por Arroyo Seco Booking.
          </p>
          <p className="text-gray-700 mb-4">
            Esta Política de Privacidad describe cómo recopilamos, usamos, almacenamos, compartimos y protegemos
            su información personal cuando utiliza nuestra aplicación móvil y servicios relacionados.
          </p>
          <p className="text-gray-700 mb-4">
            <strong>Al utilizar Xilum, usted acepta las prácticas descritas en esta Política de Privacidad.</strong>
          </p>
          <p className="text-gray-700">
            Si no está de acuerdo con esta política, por favor no utilice nuestra aplicación.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">2. Información que Recopilamos</h2>

          <h3 className="text-xl font-semibold text-gray-800 mb-3">2.1 Información que Usted nos Proporciona Directamente</h3>
          <p className="text-gray-700 mb-4">
            Recopilamos la siguiente información cuando se registra y utiliza nuestros servicios:
          </p>

          <div className="ml-4 mb-4">
            <h4 className="font-semibold text-gray-800 mb-2">Información de Cuenta:</h4>
            <ul className="list-disc ml-6 text-gray-700 space-y-1">
              <li>Nombre completo</li>
              <li>Dirección de correo electrónico</li>
              <li>Número de teléfono</li>
              <li>Contraseña (almacenada de forma encriptada)</li>
              <li>Tipo de cuenta (Huésped o Anfitrión)</li>
            </ul>
          </div>

          <div className="ml-4 mb-4">
            <h4 className="font-semibold text-gray-800 mb-2">Información de Propiedades (Solo Anfitriones):</h4>
            <ul className="list-disc ml-6 text-gray-700 space-y-1">
              <li>Título y descripción de la propiedad</li>
              <li>Ubicación de la propiedad</li>
              <li>Precio por noche</li>
              <li>Capacidad de huéspedes</li>
              <li>Fotografías de la propiedad</li>
              <li>Tipo de alojamiento</li>
            </ul>
          </div>

          <div className="ml-4 mb-4">
            <h4 className="font-semibold text-gray-800 mb-2">Información de Reservas:</h4>
            <ul className="list-disc ml-6 text-gray-700 space-y-1">
              <li>Fechas de check-in y check-out</li>
              <li>Número de huéspedes</li>
              <li>Monto total de la reserva</li>
              <li>Estado de pago</li>
            </ul>
          </div>

          <div className="ml-4 mb-4">
            <h4 className="font-semibold text-gray-800 mb-2">Información de Pago:</h4>
            <ul className="list-disc ml-6 text-gray-700 space-y-1">
              <li>Información de tarjeta de crédito/débito (procesada por Stripe, no almacenada en nuestros servidores)</li>
              <li>Historial de transacciones</li>
            </ul>
          </div>

          <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">2.2 Información Recopilada Automáticamente</h3>
          <p className="text-gray-700 mb-4">Cuando utiliza la Aplicación, podemos recopilar automáticamente:</p>
          <ul className="list-disc ml-6 text-gray-700 space-y-1 mb-4">
            <li><strong>Información del Dispositivo:</strong> Modelo del dispositivo, sistema operativo, versión de la aplicación</li>
            <li><strong>Datos de Uso:</strong> Propiedades visitadas, búsquedas realizadas, interacciones con la aplicación</li>
            <li><strong>Información de Red:</strong> Dirección IP, tipo de navegador (cuando accede vía web)</li>
            <li><strong>Fecha y hora de acceso</strong></li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">2.3 Información que NO Recopilamos</h3>
          <ul className="list-none ml-6 text-gray-700 space-y-1">
            <li>❌ No recopilamos su ubicación GPS en tiempo real</li>
            <li>❌ No accedemos a su cámara sin su permiso</li>
            <li>❌ No leemos sus contactos</li>
            <li>❌ No monitoreamos sus otras aplicaciones</li>
            <li>❌ No recopilamos información de menores de 13 años intencionalmente</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">3. Cómo Utilizamos su Información</h2>

          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">3.1 Prestación de Servicios</h3>
              <ul className="list-disc ml-6 text-gray-700 space-y-1">
                <li>Crear y administrar su cuenta</li>
                <li>Procesar reservas de alojamiento</li>
                <li>Facilitar pagos y transacciones</li>
                <li>Conectar huéspedes con anfitriones</li>
                <li>Enviar confirmaciones de reserva</li>
                <li>Proporcionar atención al cliente</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">3.2 Mejora de la Aplicación</h3>
              <ul className="list-disc ml-6 text-gray-700 space-y-1">
                <li>Analizar el uso de la aplicación para mejorar funcionalidades</li>
                <li>Detectar y prevenir errores técnicos</li>
                <li>Desarrollar nuevas características basadas en el comportamiento del usuario</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">3.3 Comunicaciones</h3>
              <ul className="list-disc ml-6 text-gray-700 space-y-1">
                <li>Enviar notificaciones sobre el estado de sus reservas</li>
                <li>Informar sobre cambios en la aplicación</li>
                <li>Responder a sus consultas y solicitudes de soporte</li>
                <li>Enviar actualizaciones importantes de servicio</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">3.4 Seguridad y Cumplimiento Legal</h3>
              <ul className="list-disc ml-6 text-gray-700 space-y-1">
                <li>Detectar y prevenir fraude</li>
                <li>Proteger contra actividades maliciosas</li>
                <li>Cumplir con obligaciones legales y regulatorias</li>
                <li>Hacer cumplir nuestros Términos de Servicio</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">7. Sus Derechos de Privacidad</h2>
          <p className="text-gray-700 mb-4">
            Usted tiene los siguientes derechos respecto a su información personal:
          </p>

          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">7.1 Derecho de Acceso</h3>
              <p className="text-gray-700">
                Puede solicitar una copia de la información personal que tenemos sobre usted.
                Le proporcionaremos los datos en formato JSON descargable.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">7.2 Derecho de Rectificación</h3>
              <p className="text-gray-700">
                Puede corregir información inexacta en cualquier momento desde su perfil.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">7.3 Derecho de Eliminación ("Derecho al Olvido")</h3>
              <p className="text-gray-700 mb-2">
                Puede solicitar la eliminación de su cuenta y datos personales.
              </p>
              <p className="text-gray-700 mb-2"><strong>Cómo ejercer este derecho:</strong></p>
              <ol className="list-decimal ml-6 text-gray-700 space-y-1">
                <li>Inicie sesión en la aplicación</li>
                <li>Vaya a Configuración → Mi Perfil</li>
                <li>Complete el formulario de "Solicitar Eliminación de Cuenta"</li>
                <li>Envíe su solicitud</li>
              </ol>
              <p className="text-gray-700 mt-2">
                <strong>Nota:</strong> No podemos eliminar información que debemos conservar por obligaciones
                legales (registros de transacciones financieras).
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">7.7 Cómo Ejercer sus Derechos</h3>
              <ul className="list-disc ml-6 text-gray-700 space-y-1">
                <li><strong>Desde la aplicación:</strong> Configuración → Mi Perfil</li>
                <li><strong>Por correo electrónico:</strong> maridimas08@gmail.com</li>
                <li><strong>Tiempo de respuesta:</strong> Dentro de 30 días</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">8. Privacidad de Menores de Edad</h2>

          <h3 className="text-xl font-semibold text-gray-800 mb-3">8.1 Menores de 13 Años</h3>
          <ul className="list-disc ml-6 text-gray-700 space-y-2 mb-4">
            <li><strong>No recopilamos intencionalmente información de niños menores de 13 años</strong></li>
            <li>La aplicación requiere que los usuarios tengan al menos 13 años</li>
            <li>Si descubrimos que hemos recopilado información de un menor de 13 años, eliminaremos inmediatamente esa información</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mb-3">8.2 Menores entre 13 y 17 Años</h3>
          <ul className="list-disc ml-6 text-gray-700 space-y-2 mb-4">
            <li>Los usuarios entre 13 y 17 años deben obtener el consentimiento de sus padres o tutores legales</li>
            <li>Se recomienda supervisión de un adulto para realizar reservas y pagos</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mb-3">8.3 Si Usted es Padre o Tutor</h3>
          <p className="text-gray-700">
            Si cree que su hijo menor de 13 años nos ha proporcionado información personal,
            contáctenos inmediatamente a <a href="mailto:maridimas08@gmail.com" className="text-primary-600 hover:underline">maridimas08@gmail.com</a> y
            eliminaremos esa información.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">14. Información de Contacto</h2>
          <p className="text-gray-700 mb-4">
            Si tiene preguntas, inquietudes o solicitudes relacionadas con esta Política de Privacidad
            o el manejo de su información personal, puede contactarnos:
          </p>

          <div className="bg-blue-50 border-2 border-blue-200 p-6 rounded-lg">
            <p className="font-bold text-gray-800 mb-4 text-lg">Arroyo Seco Booking - Xi'lúm</p>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div>
                  <strong>Correo electrónico:</strong>{' '}
                  <a href="mailto:maridimas08@gmail.com" className="text-primary-600 hover:underline font-semibold">
                    maridimas08@gmail.com
                  </a>
                </div>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <div>
                  <strong>Teléfono:</strong>{' '}
                  <a href="tel:+524428139975" className="text-primary-600 hover:underline font-semibold">
                    +52 442 813 9975
                  </a>
                </div>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                <div>
                  <strong>Sitio web:</strong>{' '}
                  <a href="https://xilmq.com" className="text-primary-600 hover:underline">https://xilmq.com</a>
                </div>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <strong>Tiempo de respuesta:</strong> Dentro de 30 días hábiles
                </div>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <strong>Horario:</strong> Lunes a Viernes, 9:00 AM - 6:00 PM (Hora del Centro de México)
                </div>
              </li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Resumen en Términos Simples</h2>

          <div className="bg-blue-50 border-l-4 border-primary-600 p-4 space-y-3">
            <div>
              <p className="font-semibold text-gray-800">¿Qué información recopilamos?</p>
              <p className="text-gray-700">Su nombre, email, teléfono, información de reservas y pagos (procesados por Stripe).</p>
            </div>

            <div>
              <p className="font-semibold text-gray-800">¿Cómo la usamos?</p>
              <p className="text-gray-700">Para procesar reservas, conectar huéspedes con anfitriones, y mejorar la aplicación.</p>
            </div>

            <div>
              <p className="font-semibold text-gray-800">¿Con quién la compartimos?</p>
              <p className="text-gray-700">Solo con anfitriones/huéspedes para reservas, Stripe para pagos, y Firebase/Google Cloud para almacenamiento. <strong>Nunca vendemos sus datos.</strong></p>
            </div>

            <div>
              <p className="font-semibold text-gray-800">¿Cómo la protegemos?</p>
              <p className="text-gray-700">Encriptación HTTPS, contraseñas hasheadas, autenticación segura.</p>
            </div>

            <div>
              <p className="font-semibold text-gray-800">¿Cuáles son sus derechos?</p>
              <p className="text-gray-700">Puede acceder, corregir, eliminar o exportar sus datos en cualquier momento.</p>
            </div>

            <div>
              <p className="font-semibold text-gray-800">¿Menores de edad?</p>
              <p className="text-gray-700">No aceptamos usuarios menores de 13 años. Usuarios de 13-17 requieren supervisión parental.</p>
            </div>
          </div>
        </section>

        <hr className="my-8" />

        <p className="text-sm text-gray-600 text-center">
          <strong>Última actualización:</strong> 6 de noviembre de 2025<br />
          <strong>Documento versión:</strong> 1.0<br />
          © 2025 Arroyo Seco Booking. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
