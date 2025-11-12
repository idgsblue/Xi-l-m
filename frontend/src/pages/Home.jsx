import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import PropertyCard from './guest/PropertyCard';
import SearchBar from './guest/SearchBar';
import { toast } from 'react-toastify';

const Home = () => {
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [ctaImageIndex, setCtaImageIndex] = useState(0);

  const carouselImages = [
    '/images/pexels-chaitaastic-1796727.jpg',
    '/images/pexels-damir-24973254.jpg',
    '/images/pexels-kazim-guven-198262678-16532341.jpg',
    '/images/pexels-landsmann-803094805-19279547.jpg',
    '/images/pexels-pixabay-259637.jpg'
  ];

  useEffect(() => {
    loadFeaturedProperties();

    // Auto-rotate hero carousel every 5 seconds
    const heroInterval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % carouselImages.length);
    }, 5000);

    // Auto-rotate CTA carousel every 4 seconds (different timing)
    const ctaInterval = setInterval(() => {
      setCtaImageIndex((prev) => (prev + 1) % carouselImages.length);
    }, 4000);

    return () => {
      clearInterval(heroInterval);
      clearInterval(ctaInterval);
    };
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
      {/* Hero Section with Carousel Background */}
      <section id="main-content" className="relative h-screen min-h-[600px] overflow-hidden" tabIndex="-1">
        {/* Carousel Images */}
        <div className="absolute inset-0">
          {carouselImages.map((image, index) => (
            <div
              key={image}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentImageIndex ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                src={image}
                alt={`Arroyo Seco ${index + 1}`}
                className="w-full h-full object-cover"
              />
              {/* Dark green transparent overlay */}
              <div className="absolute inset-0 bg-emerald-950/60 dark:bg-emerald-950/70"></div>
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
          <div className="text-center">
            <h1 className="heading-1 text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-white drop-shadow-lg">
              Descubre Arroyo Seco
            </h1>
            <p className="mx-auto mt-4 sm:mt-6 max-w-2xl text-base sm:text-lg md:text-xl text-white drop-shadow-lg px-4">
              Encuentra el alojamiento perfecto para tu próxima aventura en el corazón de Querétaro
            </p>
          </div>
          <div className="mt-8 sm:mt-10">
            <SearchBar />
          </div>
        </div>

        {/* Carousel Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
          {carouselImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentImageIndex
                  ? 'bg-white w-8'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Ir a imagen ${index + 1}`}
            />
          ))}
        </div>
      </section>

      <section className="section bg-primary-50 dark:bg-neutral-900">
        <div className="container-custom">
          <div className="text-center">
            <h2 className="heading-2 dark:text-neutral-100">
              Propiedades Destacadas
            </h2>
            <p className="mt-4 text-lg text-neutral-700 dark:text-neutral-300">
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

      {/* CTA Section with Carousel Background */}
      <section className="bg-white dark:bg-neutral-800 section">
        <div className="container-custom">
          <div className="relative rounded-2xl overflow-hidden shadow-large min-h-[400px]">
            {/* Carousel Images for CTA */}
            <div className="absolute inset-0">
              {carouselImages.map((image, index) => (
                <div
                  key={`cta-${image}`}
                  className={`absolute inset-0 transition-opacity duration-1000 ${
                    index === ctaImageIndex ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <img
                    src={image}
                    alt={`Arroyo Seco CTA ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {/* Dark green transparent overlay */}
                  <div className="absolute inset-0 bg-emerald-950/70 dark:bg-emerald-950/80"></div>
                </div>
              ))}
            </div>

            {/* Content */}
            <div className="relative z-10 px-6 py-16 sm:p-16">
              <div className="mx-auto max-w-xl text-center">
                <h2 className="heading-2 text-white drop-shadow-lg">
                  ¿Tienes una propiedad en Arroyo Seco?
                </h2>
                <p className="mt-6 text-lg text-white drop-shadow-md">
                  Únete a nuestra plataforma y comienza a recibir huéspedes de todo México
                </p>
                <Link
                  to="/register?role=host"
                  className="btn-accent mt-8 inline-block shadow-lg hover:shadow-xl transition-shadow"
                >
                  Conviértete en Anfitrión
                </Link>
              </div>
            </div>

            {/* Carousel Indicators */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
              {carouselImages.map((_, index) => (
                <button
                  key={`cta-indicator-${index}`}
                  onClick={() => setCtaImageIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === ctaImageIndex
                      ? 'bg-white w-6'
                      : 'bg-white/50 hover:bg-white/75'
                  }`}
                  aria-label={`Ir a imagen CTA ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;