import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import PropertyCard from './guest/PropertyCard';
import SearchBar from './guest/SearchBar';
import { toast } from 'react-toastify';

const Home = () => {
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedProperties();
  }, []);

  const loadFeaturedProperties = async () => {
    try {
      const response = await api.get('/properties?limit=6');
      setFeaturedProperties(response.data.properties);
    } catch (error) {
      toast.error('Error cargando propiedades');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-accent py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="heading-1 text-white drop-shadow-md">
              Descubre Arroyo Seco
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-xl text-primary-50">
              Encuentra el alojamiento perfecto para tu próxima aventura en el corazón de Querétaro
            </p>
          </div>
          <div className="mt-10">
            <SearchBar />
          </div>
        </div>
      </section>

      {/* Propiedades Destacadas */}
      <section className="section bg-primary-50">
        <div className="container-custom">
          <div className="text-center">
            <h2 className="heading-2">
              Propiedades Destacadas
            </h2>
            <p className="mt-4 text-lg text-neutral-700">
              Explora nuestras mejores opciones de hospedaje
            </p>
          </div>

          {loading ? (
            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-neutral-300 h-48 rounded-card"></div>
                  <div className="mt-4 h-4 bg-neutral-300 rounded w-3/4"></div>
                  <div className="mt-2 h-4 bg-neutral-300 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {featuredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}

          <div className="mt-12 text-center">
            <Link
              to="/search"
              className="btn-secondary"
            >
              Ver todas las propiedades
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-white section">
        <div className="container-custom">
          <div className="bg-gradient-primary rounded-2xl px-6 py-16 sm:p-16 shadow-large">
            <div className="mx-auto max-w-xl text-center">
              <h2 className="heading-2 text-accent-900">
                ¿Tienes una propiedad en Arroyo Seco?
              </h2>
              <p className="mt-6 text-lg text-accent-700">
                Únete a nuestra plataforma y comienza a recibir huéspedes de todo México
              </p>
              <Link
                to="/register?role=host"
                className="btn-accent mt-8"
              >
                Conviértete en Anfitrión
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;