import React from 'react';
import { Link } from 'react-router-dom';

const CancellationPolicy = () => {
  return (
    <div className="bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Política de Cancelación - Xi'lúm
        </h1>

        <p className="text-sm text-gray-600 mb-8">
          <strong>Última actualización:</strong> 6 de noviembre de 2025<br />
          <strong>Vigencia:</strong> A partir del 6 de noviembre de 2025
        </p>

        <hr className="mb-8" />

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Introducción</h2>
          <p className="text-gray-700 mb-4">
            Esta Política de Cancelación establece los términos y condiciones bajo los cuales los huéspedes
            pueden cancelar sus reservas en <strong>Xi'lúm</strong>, la plataforma de reservas de alojamiento
            de Arroyo Seco, Querétaro.
          </p>
          <p className="text-gray-700">
            Al realizar una reserva, usted acepta cumplir con esta política de cancelación.
            Por favor, léala cuidadosamente antes de confirmar su reserva.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">1. Plazos y Reembolsos</h2>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Política de Cancelación Estándar</h3>

            <div className="space-y-4">
              <div>
                <p className="font-semibold text-gray-800 mb-2">
                  ✅ Cancelación con más de 7 días de anticipación
                </p>
                <p className="text-gray-700">
                  <strong>Reembolso:</strong> 100% del monto pagado<br />
                  <strong>Tiempo de procesamiento:</strong> 5-10 días hábiles
                </p>
              </div>

              <div>
                <p className="font-semibold text-gray-800 mb-2">
                  ⚠️ Cancelación entre 3 y 7 días antes del check-in
                </p>
                <p className="text-gray-700">
                  <strong>Reembolso:</strong> 50% del monto pagado<br />
                  <strong>Comisión de servicio:</strong> No reembolsable<br />
                  <strong>Tiempo de procesamiento:</strong> 5-10 días hábiles
                </p>
              </div>

              <div>
                <p className="font-semibold text-gray-800 mb-2">
                  ❌ Cancelación con menos de 3 días de anticipación
                </p>
                <p className="text-gray-700">
                  <strong>Reembolso:</strong> 0% (sin reembolso)<br />
                  <strong>Motivo:</strong> El anfitrión ya no puede reorganizar el calendario
                </p>
              </div>

              <div>
                <p className="font-semibold text-gray-800 mb-2">
                  🚫 No show (no presentarse sin cancelar)
                </p>
                <p className="text-gray-700">
                  <strong>Reembolso:</strong> 0% (sin reembolso)<br />
                  <strong>Consecuencia:</strong> Se cobrará el monto total de la reserva
                </p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border-l-4 border-amber-500 p-4">
            <p className="text-amber-800">
              <strong>Nota importante:</strong> Las comisiones de servicio de la plataforma (15%)
              no son reembolsables en ningún caso, excepto cuando la cancelación se realiza
              con más de 7 días de anticipación.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">2. Cómo Cancelar una Reserva</h2>

          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-3">Pasos para cancelar:</h3>
              <ol className="list-decimal ml-6 text-gray-700 space-y-2">
                <li>Inicia sesión en tu cuenta de Xi'lúm</li>
                <li>Ve a <strong>"Mis Reservas"</strong> en el menú principal</li>
                <li>Selecciona la reserva que deseas cancelar</li>
                <li>Haz clic en el botón <strong>"Cancelar Reserva"</strong></li>
                <li>Confirma la cancelación y selecciona el motivo</li>
                <li>Recibirás un correo electrónico de confirmación</li>
              </ol>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-3">Información que recibirás:</h3>
              <ul className="list-disc ml-6 text-gray-700 space-y-2">
                <li>Correo de confirmación de cancelación</li>
                <li>Detalles del reembolso (monto y fecha estimada)</li>
                <li>Número de referencia de la cancelación</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">3. Excepciones y Casos Especiales</h2>

          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">3.1 Cancelación por el Anfitrión</h3>
              <p className="text-gray-700 mb-2">
                Si el anfitrión cancela tu reserva confirmada:
              </p>
              <ul className="list-disc ml-6 text-gray-700 space-y-1">
                <li><strong>Reembolso:</strong> 100% del monto pagado (incluyendo comisiones)</li>
                <li><strong>Tiempo de procesamiento:</strong> 3-5 días hábiles</li>
                <li><strong>Asistencia:</strong> Ayudaremos a encontrar un alojamiento alternativo</li>
                <li><strong>Penalización al anfitrión:</strong> El anfitrión recibirá una penalización en su cuenta</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">3.2 Circunstancias Extraordinarias</h3>
              <p className="text-gray-700 mb-2">
                En casos de fuerza mayor, podrás recibir un reembolso completo:
              </p>
              <ul className="list-disc ml-6 text-gray-700 space-y-1">
                <li>Desastres naturales (terremotos, huracanes, inundaciones)</li>
                <li>Emergencias de salud pública (pandemias, cuarentenas obligatorias)</li>
                <li>Cierres gubernamentales de fronteras o restricciones de viaje</li>
                <li>Accidentes graves o emergencias médicas (requiere documentación)</li>
              </ul>
              <p className="text-gray-700 mt-3">
                <strong>Documentación requerida:</strong> Deberás proporcionar evidencia válida
                (certificados médicos, órdenes gubernamentales, etc.) dentro de las 48 horas
                posteriores a la solicitud de cancelación.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">3.3 Problemas con la Propiedad</h3>
              <p className="text-gray-700 mb-2">
                Si la propiedad no cumple con lo anunciado o tiene problemas graves:
              </p>
              <ul className="list-disc ml-6 text-gray-700 space-y-1">
                <li>Contacta al anfitrión inmediatamente al llegar</li>
                <li>Si el problema no se resuelve, contacta a soporte de Xi'lúm</li>
                <li>Proporciona fotos y evidencia del problema</li>
                <li>Podrás recibir un reembolso parcial o total según la gravedad</li>
              </ul>
              <div className="bg-blue-50 border border-blue-200 rounded p-3 mt-3">
                <p className="text-blue-800 text-sm">
                  ⏰ <strong>Importante:</strong> Debes reportar los problemas dentro de las primeras
                  24 horas del check-in. Los reportes posteriores no califican para reembolso.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">4. Proceso de Reembolso</h2>

          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">¿Cómo funcionan los reembolsos?</h3>

            <div className="space-y-4">
              <div>
                <p className="font-semibold text-gray-800 mb-2">Método de reembolso:</p>
                <p className="text-gray-700">
                  Los reembolsos se procesan automáticamente al método de pago original utilizado
                  para la reserva (tarjeta de crédito/débito, transferencia bancaria).
                </p>
              </div>

              <div>
                <p className="font-semibold text-gray-800 mb-2">Tiempo de procesamiento:</p>
                <ul className="list-disc ml-6 text-gray-700 space-y-1">
                  <li><strong>Procesamiento interno:</strong> 2-3 días hábiles</li>
                  <li><strong>Tiempo bancario:</strong> 3-7 días hábiles adicionales</li>
                  <li><strong>Total estimado:</strong> 5-10 días hábiles</li>
                </ul>
                <p className="text-gray-600 text-sm mt-2">
                  * Los tiempos pueden variar según tu institución bancaria
                </p>
              </div>

              <div>
                <p className="font-semibold text-gray-800 mb-2">Seguimiento:</p>
                <p className="text-gray-700">
                  Podrás ver el estado de tu reembolso en la sección "Mis Reservas" de tu cuenta.
                  También recibirás notificaciones por correo electrónico sobre el progreso.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">5. Modificaciones de Reserva</h2>

          <p className="text-gray-700 mb-4">
            Si necesitas cambiar las fechas de tu reserva en lugar de cancelar:
          </p>

          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
            <h3 className="font-semibold text-green-800 mb-2">Opción recomendada: Modificar en lugar de cancelar</h3>
            <p className="text-green-700">
              Contacta al anfitrión directamente para solicitar un cambio de fechas.
              Si el anfitrión acepta, podrás modificar tu reserva sin penalización.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <p className="font-semibold text-gray-800 mb-2">Pasos para modificar:</p>
              <ol className="list-decimal ml-6 text-gray-700 space-y-1">
                <li>Contacta al anfitrión a través del sistema de mensajería de Xi'lúm</li>
                <li>Explica las nuevas fechas que necesitas</li>
                <li>Espera la confirmación del anfitrión</li>
                <li>Si acepta, podrás modificar la reserva sin costo adicional</li>
              </ol>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded p-3">
              <p className="text-amber-800 text-sm">
                <strong>Nota:</strong> Si las nuevas fechas tienen un precio diferente,
                deberás pagar la diferencia o recibirás un reembolso parcial según corresponda.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">6. Política de No Presentación (No Show)</h2>

          <div className="bg-red-50 border-l-4 border-red-500 p-6">
            <h3 className="text-xl font-semibold text-red-800 mb-3">
              Consecuencias de no presentarse sin cancelar
            </h3>
            <p className="text-red-700 mb-3">
              Si no te presentas a tu reserva y no la cancelaste previamente:
            </p>
            <ul className="list-disc ml-6 text-red-700 space-y-2">
              <li><strong>Sin reembolso:</strong> Se cobra el 100% del monto de la reserva</li>
              <li><strong>Impacto en tu cuenta:</strong> Se registrará como "no show" en tu historial</li>
              <li><strong>Restricciones futuras:</strong> Múltiples "no shows" pueden resultar en la suspensión de tu cuenta</li>
            </ul>

            <div className="bg-white rounded p-4 mt-4">
              <p className="text-gray-800 font-semibold mb-2">💡 Recomendación importante:</p>
              <p className="text-gray-700">
                Si sabes que no podrás asistir, <strong>siempre cancela tu reserva</strong>,
                incluso si es con menos de 3 días de anticipación. Aunque no recibas reembolso,
                evitarás penalizaciones en tu cuenta.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">7. Disputas y Resolución</h2>

          <p className="text-gray-700 mb-4">
            Si no estás de acuerdo con una decisión de cancelación o reembolso:
          </p>

          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-3">Proceso de disputa:</h3>
              <ol className="list-decimal ml-6 text-gray-700 space-y-2">
                <li>Contacta a nuestro equipo de soporte dentro de los 7 días posteriores a la cancelación</li>
                <li>Proporciona toda la documentación relevante</li>
                <li>Nuestro equipo revisará el caso en un plazo de 5-7 días hábiles</li>
                <li>Recibirás una resolución final por correo electrónico</li>
              </ol>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-3">Documentación requerida para disputas:</h3>
              <ul className="list-disc ml-6 text-gray-700 space-y-1">
                <li>Número de reserva</li>
                <li>Capturas de pantalla de comunicaciones con el anfitrión</li>
                <li>Fotos o evidencia del problema (si aplica)</li>
                <li>Certificados médicos o documentos oficiales (en caso de emergencias)</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">8. Responsabilidades del Huésped</h2>

          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Como huésped, te comprometes a:</h3>
            <ul className="list-disc ml-6 text-gray-700 space-y-2">
              <li>Leer y comprender esta política de cancelación antes de realizar una reserva</li>
              <li>Cancelar con la mayor anticipación posible si cambias de planes</li>
              <li>Comunicarte con el anfitrión antes de cancelar, para explorar opciones de modificación</li>
              <li>Proporcionar información veraz y documentación válida en caso de circunstancias extraordinarias</li>
              <li>Respetar los plazos establecidos para reportar problemas con la propiedad</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">9. Cambios en esta Política</h2>

          <p className="text-gray-700 mb-4">
            Xi'lúm se reserva el derecho de modificar esta Política de Cancelación en cualquier momento.
          </p>

          <ul className="list-disc ml-6 text-gray-700 space-y-2">
            <li>Los cambios serán publicados en esta página</li>
            <li>La fecha de "Última actualización" será modificada</li>
            <li>Las reservas existentes seguirán rigiéndose por la política vigente al momento de la reserva</li>
            <li>Los usuarios serán notificados por correo electrónico sobre cambios significativos</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Información de Contacto</h2>
          <p className="text-gray-700 mb-4">
            Si tienes preguntas sobre esta Política de Cancelación o necesitas ayuda con una cancelación,
            contáctanos:
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
                  <strong>Horario:</strong> Lunes a Viernes, 9:00 AM - 6:00 PM (Hora del Centro de México)
                </div>
              </li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Resumen en Términos Simples</h2>

          <div className="bg-green-50 border-l-4 border-green-500 p-6 space-y-3">
            <div>
              <p className="font-semibold text-gray-800">¿Puedo cancelar mi reserva?</p>
              <p className="text-gray-700">Sí, pero el reembolso depende de cuándo canceles.</p>
            </div>

            <div>
              <p className="font-semibold text-gray-800">¿Cuánto dinero recupero?</p>
              <p className="text-gray-700">
                100% si cancelas con +7 días de anticipación, 50% entre 3-7 días, 0% con menos de 3 días.
              </p>
            </div>

            <div>
              <p className="font-semibold text-gray-800">¿Cuánto tarda el reembolso?</p>
              <p className="text-gray-700">Entre 5 y 10 días hábiles en tu método de pago original.</p>
            </div>

            <div>
              <p className="font-semibold text-gray-800">¿Qué pasa si el anfitrión cancela?</p>
              <p className="text-gray-700">Recibes el 100% de tu dinero de vuelta + ayuda para encontrar otro alojamiento.</p>
            </div>

            <div>
              <p className="font-semibold text-gray-800">¿Puedo cambiar las fechas sin cancelar?</p>
              <p className="text-gray-700">Sí, contacta al anfitrión. Si acepta, puedes modificar sin penalización.</p>
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

export default CancellationPolicy;
