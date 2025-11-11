import React from 'react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Acerca de Xilum
        </h1>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Nuestra Historia</h2>
          <p className="text-gray-700 mb-4">
            <strong>Xilum</strong> es una plataforma innovadora de reservas turísticas dedicada a promover
            el turismo en el hermoso municipio de Arroyo Seco, Querétaro. Nacimos con la visión de conectar
            a viajeros de todo México con experiencias auténticas en uno de los destinos más encantadores
            de la Sierra Gorda.
          </p>
          <p className="text-gray-700 mb-4">
            Arroyo Seco es conocido por su rica biodiversidad, paisajes montañosos, clima agradable y
            tradiciones culturales profundamente arraigadas. Nuestra misión es facilitar el acceso a
            alojamientos de calidad que permitan a los visitantes disfrutar plenamente de todo lo que
            este pueblo mágico tiene para ofrecer.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">¿Qué Ofrecemos?</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Para Viajeros</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Búsqueda fácil y rápida de alojamientos en Arroyo Seco</li>
                <li>Variedad de opciones: casas, cabañas, departamentos y más</li>
                <li>Reservas seguras con confirmación inmediata</li>
                <li>Información detallada de cada propiedad</li>
                <li>Sistema de calificaciones y reseñas confiables</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Para Anfitriones</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Plataforma intuitiva para publicar propiedades</li>
                <li>Gestión completa de reservas y disponibilidad</li>
                <li>Herramientas para maximizar tus ingresos</li>
                <li>Soporte dedicado para anfitriones</li>
                <li>Visibilidad para huéspedes de todo el país</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Nuestros Valores</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-primary-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Turismo Sostenible</h3>
              <p className="text-gray-700">
                Promovemos prácticas responsables que respetan el medio ambiente y la cultura local.
              </p>
            </div>

            <div className="bg-primary-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Comunidad Local</h3>
              <p className="text-gray-700">
                Apoyamos a los residentes de Arroyo Seco generando oportunidades económicas.
              </p>
            </div>

            <div className="bg-primary-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Confianza y Seguridad</h3>
              <p className="text-gray-700">
                Garantizamos transacciones seguras y protección de datos personales.
              </p>
            </div>

            <div className="bg-primary-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Experiencias Auténticas</h3>
              <p className="text-gray-700">
                Conectamos a los viajeros con la verdadera esencia de Arroyo Seco.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Desarrollo del Proyecto</h2>
          <p className="text-gray-700 mb-4">
            Xilum fue desarrollado por el <strong>Equipo 2</strong> de estudiantes de la
            Universidad Tecnológica de Querétaro (UTEQ) como parte de un proyecto académico
            enfocado en impulsar el desarrollo turístico regional a través de la tecnología.
          </p>
          <p className="text-gray-700">
            Nuestro equipo está comprometido con la innovación, la excelencia técnica y el
            impacto social positivo en las comunidades locales.
          </p>
        </section>

        <section className="bg-gradient-primary p-6 rounded-lg">
          <h2 className="text-2xl font-bold text-accent-900 mb-4">¿Listo para Descubrir Arroyo Seco?</h2>
          <p className="text-accent-700 mb-4">
            Ya sea que estés buscando tu próxima aventura o quieras compartir tu espacio con viajeros,
            Xilum es tu aliado perfecto.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/search" className="btn-secondary">
              Buscar Alojamientos
            </Link>
            <Link to="/register?role=host" className="btn-accent">
              Ser Anfitrión
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
