import React from 'react';
import { Link } from 'react-router-dom';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8">
        <Link to="/" className="text-primary-600 hover:text-primary-700 mb-4 inline-block">
          ← Volver al inicio
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Términos y Condiciones de Servicio - Xi'lúm
        </h1>

        <p className="text-sm text-gray-600 mb-8">
          <strong>Última actualización:</strong> 6 de noviembre de 2025<br />
          <strong>Vigencia:</strong> A partir del 6 de noviembre de 2025
        </p>

        <hr className="mb-8" />

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Introducción y Descripción del Servicio</h2>
          <p className="text-gray-700 mb-4">
            <strong>Xi'lúm</strong>, en adelante la "Aplicación" o "Plataforma", les da la bienvenida a nuestro
            portal <a href="https://xilmq.com" className="text-primary-600 hover:underline">https://xilmq.com</a> y
            a nuestra aplicación móvil descargable. Esta Plataforma de Reservas de Arroyo Seco fue desarrollada
            para facilitar las reservas de alojamiento en el municipio de Arroyo Seco, Querétaro.
          </p>
          <p className="text-gray-700 mb-4">
            Al registrarse, conectarse, acceder o usar el Servicio, usted reconoce que ha leído y comprendido
            estos Términos de Servicio y nuestra{' '}
            <Link to="/privacy-policy" className="text-primary-600 hover:underline">Política de Privacidad</Link>,
            y acepta estar sujeto a ellos.
          </p>
          <p className="text-gray-700 font-semibold">
            Estos Términos son un contrato legalmente vinculante entre usted y la aplicación con respecto
            a su uso del Servicio.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">1. Aceptación de los Términos</h2>

          <h3 className="text-xl font-semibold text-gray-800 mb-3">Requisitos de edad:</h3>
          <ul className="list-disc ml-6 text-gray-700 space-y-2">
            <li>Debe tener al menos <strong>13 años</strong> para crear una cuenta</li>
            <li><strong>Los usuarios mayores de 18 años</strong> pueden utilizar la plataforma sin restricciones</li>
            <li>Los usuarios entre 13 y 17 años requieren supervisión y consentimiento de un padre o tutor legal</li>
            <li>Se recomienda que los usuarios tengan al menos <strong>18 años</strong> para realizar reservas y pagos</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">2. Descripción del Servicio</h2>
          <p className="text-gray-700 mb-4">
            Xi'lúm es una plataforma de intermediación que conecta:
          </p>
          <ul className="list-disc ml-6 text-gray-700 space-y-2 mb-4">
            <li><strong>Huéspedes:</strong> Personas que buscan alojamiento en Arroyo Seco, Querétaro</li>
            <li><strong>Anfitriones:</strong> Propietarios o administradores de propiedades que ofrecen alojamiento</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mb-3">Nuestra función:</h3>
          <ul className="list-disc ml-6 text-gray-700 space-y-2">
            <li>Facilitamos la conexión entre huéspedes y anfitriones</li>
            <li>Procesamos pagos de forma segura a través de Stripe</li>
            <li>Proporcionamos herramientas para gestionar reservas</li>
            <li>Proporcionamos herramientas de gestión y control al municipio</li>
            <li><strong>NO somos propietarios de las propiedades listadas</strong></li>
            <li><strong>NO garantizamos la calidad o disponibilidad de las propiedades</strong></li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">3. Registro y Cuentas</h2>

          <h3 className="text-xl font-semibold text-gray-800 mb-3">3.1 Creación de Cuenta</h3>
          <p className="text-gray-700 mb-4">Para utilizar nuestros servicios completos, debe crear una cuenta proporcionando:</p>
          <ul className="list-disc ml-6 text-gray-700 space-y-1 mb-4">
            <li>Nombre completo</li>
            <li>Dirección de correo electrónico válida</li>
            <li>Número de teléfono</li>
            <li><strong>Edad</strong> (mínimo 13 años)</li>
            <li>Contraseña segura</li>
            <li>Tipo de cuenta (Huésped o Anfitrión)</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mb-3">3.2 Responsabilidades del Usuario</h3>
          <p className="text-gray-700 mb-2">Al crear una cuenta, usted acepta:</p>
          <ul className="list-none ml-6 text-gray-700 space-y-1 mb-4">
            <li>✅ Proporcionar información verdadera, precisa y actualizada</li>
            <li>✅ Mantener la seguridad de su contraseña</li>
            <li>✅ Notificarnos inmediatamente si detecta uso no autorizado de su cuenta</li>
            <li>✅ Es responsable de mantener la confidencialidad de sus credenciales de acceso</li>
            <li>✅ Acepta la responsabilidad de todas las actividades que se realicen en su cuenta</li>
            <li>❌ No compartir su cuenta con terceros</li>
            <li>❌ No crear múltiples cuentas para la misma persona</li>
            <li>❌ No suplantar la identidad de otra persona</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">7. Políticas de Cancelación</h2>

          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Plazos de cancelación:</h3>
            <ul className="space-y-3 text-gray-700">
              <li>
                <strong>Más de 7 días antes del check-in:</strong><br />
                Reembolso del 100% menos comisión de servicio
              </li>
              <li>
                <strong>Entre 3-7 días antes:</strong><br />
                Reembolso del 50%. El 50% restante queda a disposición del propietario
              </li>
              <li>
                <strong>Menos de 3 días antes:</strong><br />
                Sin reembolso
              </li>
            </ul>
          </div>

          <p className="text-gray-700 mb-2">
            <strong>Importante:</strong> Las cancelaciones deben realizarse a través de la plataforma.
            El anfitrión puede tener políticas de cancelación más flexibles que las mencionadas arriba.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">10. Privacidad y Protección de Datos</h2>

          <h3 className="text-xl font-semibold text-gray-800 mb-3">10.1 Información Compartida</h3>
          <p className="text-gray-700 mb-4">
            Para facilitar las reservas, compartimos información entre huéspedes y anfitriones.
            También compartimos información con:
          </p>

          <div className="space-y-3">
            <div>
              <p className="font-semibold text-gray-800">a) Proveedores de Pago (Stripe)</p>
              <p className="text-gray-700">
                Para procesar transacciones de forma segura. Stripe tiene su propia política de privacidad.
              </p>
            </div>

            <div>
              <p className="font-semibold text-gray-800">b) Servicios de Almacenamiento (Firebase/Google Cloud)</p>
              <p className="text-gray-700">
                Para almacenar fotografías y datos de la aplicación de forma segura.
              </p>
            </div>

            <div>
              <p className="font-semibold text-gray-800">c) Administración Municipal</p>
              <p className="text-gray-700">
                Para fines de regulación, control de precios, transparencia fiscal y generación
                de estadísticas turísticas del municipio de Arroyo Seco.
              </p>
            </div>
          </div>

          <p className="text-gray-700 mt-4">
            Para más información, consulte nuestra{' '}
            <Link to="/privacy-policy" className="text-primary-600 hover:underline font-semibold">
              Política de Privacidad
            </Link>.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">15. Eliminación de Cuenta</h2>

          <h3 className="text-xl font-semibold text-gray-800 mb-3">15.1 Cómo Solicitar la Eliminación</h3>
          <p className="text-gray-700 mb-4">
            Si desea eliminar su cuenta y datos personales:
          </p>
          <ol className="list-decimal ml-6 text-gray-700 space-y-2 mb-4">
            <li>Inicie sesión en la aplicación</li>
            <li>Vaya a <strong>Configuración → Mi Perfil</strong></li>
            <li>Complete el formulario de "Solicitar Eliminación de Cuenta"</li>
            <li>Recibirá una confirmación por correo electrónico</li>
            <li>Procesaremos su solicitud dentro de <strong>30 días</strong></li>
          </ol>

          <h3 className="text-xl font-semibold text-gray-800 mb-3">15.2 Restricciones</h3>
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <p className="text-gray-700 mb-2">
              <strong>No puede eliminar su cuenta si tiene:</strong>
            </p>
            <ul className="list-disc ml-6 text-gray-700 space-y-1">
              <li>Reservas activas pendientes o confirmadas</li>
              <li>Pagos pendientes o disputas en proceso</li>
              <li>Obligaciones contractuales sin cumplir</li>
            </ul>
          </div>

          <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-4">15.3 Retención de Datos Legales</h3>
          <p className="text-gray-700">
            Después de eliminar su cuenta, podemos retener cierta información si es requerido por ley:
          </p>
          <ul className="list-disc ml-6 text-gray-700 space-y-1 mt-2">
            <li>Registros de transacciones financieras (requisitos fiscales: 5-7 años)</li>
            <li>Registros de disputas o reclamaciones legales</li>
            <li>Información necesaria para cumplir con obligaciones legales</li>
          </ul>
          <p className="text-gray-700 mt-4">
            Los datos personales identificables serán anonimizados para proteger su privacidad.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Información de Contacto</h2>
          <p className="text-gray-700 mb-4">
            Si tiene preguntas sobre estos Términos de Servicio, puede contactarnos:
          </p>

          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="font-bold text-gray-800 mb-2">Arroyo Seco Booking - Xi'lúm</p>
            <ul className="space-y-1 text-gray-700">
              <li><strong>Correo electrónico:</strong> <a href="mailto:maridimas08@gmail.com" className="text-primary-600 hover:underline">maridimas08@gmail.com</a></li>
              <li><strong>Sitio web:</strong> <a href="https://xilmq.com" className="text-primary-600 hover:underline">https://xilmq.com</a></li>
              <li><strong>Ubicación:</strong> Arroyo Seco, Querétaro, México</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Resumen en Términos Simples</h2>

          <div className="bg-blue-50 border-l-4 border-primary-600 p-4 space-y-3">
            <div>
              <p className="font-semibold text-gray-800">¿Quién puede usar Xi'lúm?</p>
              <p className="text-gray-700">Usuarios mayores de 13 años. Los menores de 18 requieren supervisión parental.</p>
            </div>

            <div>
              <p className="font-semibold text-gray-800">¿Qué hace Xi'lúm?</p>
              <p className="text-gray-700">Conecta huéspedes con anfitriones en Arroyo Seco y procesa pagos de forma segura.</p>
            </div>

            <div>
              <p className="font-semibold text-gray-800">¿Puedo cancelar una reserva?</p>
              <p className="text-gray-700">Sí, pero el reembolso depende de cuánto tiempo falte para el check-in (ver políticas de cancelación).</p>
            </div>

            <div>
              <p className="font-semibold text-gray-800">¿Cómo elimino mi cuenta?</p>
              <p className="text-gray-700">Ve a Configuración → Mi Perfil y solicita la eliminación. La procesaremos en 30 días.</p>
            </div>

            <div>
              <p className="font-semibold text-gray-800">¿Mis datos están seguros?</p>
              <p className="text-gray-700">Sí, usamos encriptación HTTPS, Stripe para pagos, y cumplimos con GDPR y leyes mexicanas.</p>
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

export default TermsOfService;
