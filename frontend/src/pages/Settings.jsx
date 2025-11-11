import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';

const Settings = () => {
  const { user } = useAuth();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteEmail, setDeleteEmail] = useState(user?.email || '');
  const [deleteReason, setDeleteReason] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleRequestAccountDeletion = async (e) => {
    e.preventDefault();

    if (!deleteEmail) {
      toast.error('Por favor ingresa tu correo electrónico');
      return;
    }

    if (!deleteReason.trim()) {
      toast.error('Por favor explica brevemente tu motivo para eliminar la cuenta');
      return;
    }

    setIsSending(true);

    try {
      await api.post('/auth/request-account-deletion', {
        email: deleteEmail,
        reason: deleteReason,
        userId: user?.user_id,
        userName: user?.full_name || user?.name
      });

      toast.success('Tu solicitud ha sido enviada exitosamente. Nos pondremos en contacto contigo pronto.');

      // Cerrar modal y limpiar campos
      setShowDeleteModal(false);
      setDeleteEmail(user?.email || '');
      setDeleteReason('');

    } catch (error) {
      console.error('Error enviando solicitud:', error);

      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('Error al enviar la solicitud. Por favor intenta nuevamente o contáctanos directamente.');
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary-50 dark:bg-neutral-900 py-12">
      <div className="container-custom max-w-4xl">
        <h1 className="heading-1 text-neutral-900 dark:text-neutral-100 mb-8">
          Configuración de Cuenta
        </h1>

        {/* Información del Usuario */}
        <div className="card mb-8">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
            Mi Perfil
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Nombre Completo
              </label>
              <p className="text-lg text-neutral-900 dark:text-neutral-100">{user?.full_name || user?.name}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Correo Electrónico
              </label>
              <p className="text-lg text-neutral-900 dark:text-neutral-100">{user?.email}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Teléfono
              </label>
              <p className="text-lg text-neutral-900 dark:text-neutral-100">{user?.phone || 'No proporcionado'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Tipo de Cuenta
              </label>
              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                user?.role === 'host' ? 'bg-accent-100 dark:bg-accent-900/30 text-accent-800 dark:text-accent-200' :
                user?.role === 'admin' ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200' :
                'bg-neutral-100 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200'
              }`}>
                {user?.role === 'host' ? 'Anfitrión' :
                 user?.role === 'admin' ? 'Administrador' :
                 'Huésped'}
              </span>
            </div>
          </div>
        </div>

        {/* Información de Contacto */}
        <div className="card mb-8">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
            Contáctanos
          </h2>

          <p className="text-neutral-600 dark:text-neutral-300 mb-4">
            Si tienes alguna pregunta, inquietud o necesitas ayuda con tu cuenta, no dudes en contactarnos:
          </p>

          <div className="space-y-4 bg-primary-50 dark:bg-neutral-700 p-6 rounded-lg">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-primary-600 dark:text-primary-400 mt-1 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <div>
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1">Correo Electrónico</h3>
                <a href="mailto:maridimas08@gmail.com" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium">
                  maridimas08@gmail.com
                </a>
              </div>
            </div>

            <div className="flex items-start">
              <svg className="w-6 h-6 text-primary-600 dark:text-primary-400 mt-1 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <div>
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1">Teléfono</h3>
                <a href="tel:+524428139975" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium">
                  +52 442 813 9975
                </a>
              </div>
            </div>
          </div>

          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-4">
            Horario de atención: Lunes a Viernes de 9:00 AM a 6:00 PM (Hora del Centro de México)
          </p>
        </div>

        {/* Privacidad y Datos */}
        <div className="card mb-8">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
            Privacidad y Datos
          </h2>

          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-1">
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                  Política de Privacidad
                </h3>
                <p className="text-neutral-600 dark:text-neutral-300 mb-3">
                  Lee cómo recopilamos, usamos y protegemos tu información personal.
                </p>
                <Link
                  to="/privacy-policy"
                  className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
                >
                  Ver Política de Privacidad →
                </Link>
              </div>
            </div>

            <div className="flex items-start pt-4 border-t border-neutral-200 dark:border-neutral-700">
              <div className="flex-1">
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                  Términos de Servicio
                </h3>
                <p className="text-neutral-600 dark:text-neutral-300 mb-3">
                  Conoce los términos y condiciones de uso de la plataforma.
                </p>
                <Link
                  to="/terms-of-service"
                  className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
                >
                  Ver Términos de Servicio →
                </Link>
              </div>
            </div>

            <div className="flex items-start pt-4 border-t border-neutral-200 dark:border-neutral-700">
              <div className="flex-1">
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                  Descargar Mis Datos
                </h3>
                <p className="text-neutral-600 dark:text-neutral-300 mb-3">
                  Descarga una copia de tu información personal en formato JSON.
                </p>
                <button
                  onClick={() => toast.info('Funcionalidad de exportación próximamente')}
                  className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
                >
                  Solicitar Exportación →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Zona de Peligro - Solicitar Eliminación de Cuenta */}
        <div className="card border-2 border-error-200 dark:border-error-700 bg-error-50 dark:bg-error-900/20">
          <h2 className="text-2xl font-bold text-error-700 dark:text-error-400 mb-4">
            Zona de Peligro
          </h2>

          <div className="bg-white dark:bg-neutral-700 rounded-lg p-6 border border-error-200 dark:border-error-700">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              Solicitar Eliminación de mi Cuenta
            </h3>
            <p className="text-neutral-600 dark:text-neutral-300 mb-4">
              Si deseas eliminar tu cuenta, envíanos una solicitud y nos pondremos en contacto contigo
              para procesar tu petición de acuerdo con nuestras políticas de privacidad.
            </p>

            <ul className="list-disc list-inside text-sm text-neutral-600 dark:text-neutral-300 mb-4 space-y-1">
              <li>Recibirás una confirmación por correo electrónico</li>
              <li>Procesaremos tu solicitud dentro de 30 días</li>
              <li>Se eliminarán tus datos personales (nombre, email, teléfono)</li>
              <li>Las reservas completadas se mantendrán por requisitos legales (anónimas)</li>
              <li>No podrás solicitar eliminación si tienes reservas activas</li>
            </ul>

            <button
              onClick={() => setShowDeleteModal(true)}
              className="bg-error-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-error-700 transition-colors"
            >
              Solicitar Eliminación de Cuenta
            </button>
          </div>
        </div>

        {/* Modal de Solicitud de Eliminación */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-neutral-800 rounded-lg max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-error-700 dark:text-error-400 mb-4">
                Solicitar Eliminación de Cuenta
              </h3>

              <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6">
                <p className="text-blue-800 dark:text-blue-200 font-medium mb-2">
                  ℹ️ ¿Cómo funciona?
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Enviaremos tu solicitud a nuestro equipo. Te contactaremos por correo electrónico
                  dentro de 30 días para confirmar la eliminación de tu cuenta y datos personales.
                </p>
              </div>

              <form onSubmit={handleRequestAccountDeletion}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Tu correo electrónico *
                  </label>
                  <input
                    type="email"
                    value={deleteEmail}
                    onChange={(e) => setDeleteEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="tu@email.com"
                    required
                    disabled={isSending}
                  />
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    Usaremos este correo para contactarte sobre tu solicitud
                  </p>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    ¿Por qué deseas eliminar tu cuenta? *
                  </label>
                  <textarea
                    value={deleteReason}
                    onChange={(e) => setDeleteReason(e.target.value)}
                    className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    rows="4"
                    placeholder="Por favor explícanos tu motivo. Esto nos ayudará a mejorar nuestros servicios..."
                    maxLength="500"
                    required
                    disabled={isSending}
                  />
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    {deleteReason.length}/500 caracteres
                  </p>
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4 mb-6">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    <strong>Nota:</strong> No podrás solicitar la eliminación si tienes reservas activas.
                    Por favor cancela tus reservas antes de solicitar la eliminación de tu cuenta.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeleteEmail(user?.email || '');
                      setDeleteReason('');
                    }}
                    className="flex-1 px-6 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg font-medium text-neutral-700 dark:text-neutral-200 bg-white dark:bg-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-600 transition-colors"
                    disabled={isSending}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-error-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-error-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSending}
                  >
                    {isSending ? 'Enviando...' : 'Enviar Solicitud'}
                  </button>
                </div>
              </form>

              <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                <p className="text-xs text-neutral-600 dark:text-neutral-400 text-center">
                  También puedes contactarnos directamente en:{' '}
                  <a href="mailto:maridimas08@gmail.com" className="text-primary-600 dark:text-primary-400 hover:underline font-medium">
                    maridimas08@gmail.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
