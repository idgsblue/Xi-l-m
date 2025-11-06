import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchBar from './SearchBar';
import PropertyCard from './PropertyCard';
import api from '../../services/api';
import accommodationTypeService from '../../services/accommodationType.service';
import serviceService from '../../services/service.service';
import { toast } from 'react-toastify';
import { 
  FunnelIcon, 
  XMarkIcon,
  AdjustmentsHorizontalIcon 
} from '@heroicons/react/24/outline';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  // Catálogos
  const [accommodationTypes, setAccommodationTypes] = useState([]);
  const [services, setServices] = useState([]);

  // Filtros avanzados (REQ-021)
  const [filters, setFilters] = useState({
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    accommodationType: searchParams.get('accommodationType') || '',
    services: searchParams.get('services')?.split(',').filter(Boolean) || [],
    minRating: searchParams.get('minRating') || '',
    sortBy: searchParams.get('sortBy') || 'recommended'
  });

  const [resultsCount, setResultsCount] = useState(0);

  useEffect(() => {
    loadCatalogs();
  }, []);

  useEffect(() => {
    searchProperties();
  }, [searchParams]);

  const loadCatalogs = async () => {
    try {
      const [typesRes, servicesRes] = await Promise.all([
        accommodationTypeService.getAll(),
        serviceService.getAll()
      ]);

      setAccommodationTypes(typesRes.accommodationTypes || []);
      setServices(servicesRes.services || []);
    } catch (error) {
      console.error('Error cargando catálogos:', error);
    }
  };

  const searchProperties = async () => {
    try {
      setLoading(true);
      
      const params = {
        location: searchParams.get('zone') || '',
        checkIn: searchParams.get('checkIn') || '',
        checkOut: searchParams.get('checkOut') || '',
        guests: searchParams.get('guests') || '',
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        accommodation_type_id: filters.accommodationType,
        // services: filters.services.join(','), // Si tu backend lo soporta
        // minRating: filters.minRating,
        sortBy: filters.sortBy
      };

      // Limpiar parámetros vacíos
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });

      const response = await api.get('/properties', { params });
      
      let results = response.data.properties || [];
      setResultsCount(results.length);

      // Aplicar filtros del lado del cliente (si el backend no los soporta)
      if (filters.services.length > 0) {
        results = results.filter(property => 
          property.services?.some(s => 
            filters.services.includes(s.id.toString())
          )
        );
      }

      // Ordenamiento
      results = sortProperties(results, filters.sortBy);

      setProperties(results);
    } catch (error) {
      toast.error('Error al buscar propiedades');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const sortProperties = (props, sortBy) => {
    const sorted = [...props];
    
    switch (sortBy) {
      case 'price-asc':
        return sorted.sort((a, b) => parseFloat(a.price_per_night) - parseFloat(b.price_per_night));
      case 'price-desc':
        return sorted.sort((a, b) => parseFloat(b.price_per_night) - parseFloat(a.price_per_night));
      case 'rating':
        return sorted.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));
      case 'recommended':
      default:
        // Algoritmo recomendado: rating 40%, disponibilidad 30%, precio 20%, fotos 10%
        return sorted.sort((a, b) => {
          const scoreA = 
            (a.average_rating || 3) * 0.4 +
            (a.images?.length || 0) * 0.1;
          const scoreB = 
            (b.average_rating || 3) * 0.4 +
            (b.images?.length || 0) * 0.1;
          return scoreB - scoreA;
        });
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleService = (serviceId) => {
    setFilters(prev => ({
      ...prev,
      services: prev.services.includes(serviceId.toString())
        ? prev.services.filter(id => id !== serviceId.toString())
        : [...prev.services, serviceId.toString()]
    }));
  };

  const applyFilters = () => {
    // Actualizar URL con filtros
    const newParams = new URLSearchParams(searchParams);
    
    if (filters.minPrice) newParams.set('minPrice', filters.minPrice);
    else newParams.delete('minPrice');
    
    if (filters.maxPrice) newParams.set('maxPrice', filters.maxPrice);
    else newParams.delete('maxPrice');
    
    if (filters.accommodationType) newParams.set('accommodationType', filters.accommodationType);
    else newParams.delete('accommodationType');
    
    if (filters.services.length > 0) newParams.set('services', filters.services.join(','));
    else newParams.delete('services');
    
    if (filters.minRating) newParams.set('minRating', filters.minRating);
    else newParams.delete('minRating');
    
    if (filters.sortBy) newParams.set('sortBy', filters.sortBy);
    else newParams.delete('sortBy');

    setSearchParams(newParams);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({
      minPrice: '',
      maxPrice: '',
      accommodationType: '',
      services: [],
      minRating: '',
      sortBy: 'recommended'
    });

    // Limpiar URL pero mantener búsqueda base
    const newParams = new URLSearchParams();
    if (searchParams.get('zone')) newParams.set('zone', searchParams.get('zone'));
    if (searchParams.get('checkIn')) newParams.set('checkIn', searchParams.get('checkIn'));
    if (searchParams.get('checkOut')) newParams.set('checkOut', searchParams.get('checkOut'));
    if (searchParams.get('guests')) newParams.set('guests', searchParams.get('guests'));
    
    setSearchParams(newParams);
  };

  const activeFiltersCount = 
    (filters.minPrice ? 1 : 0) +
    (filters.maxPrice ? 1 : 0) +
    (filters.accommodationType ? 1 : 0) +
    filters.services.length +
    (filters.minRating ? 1 : 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Barra de búsqueda */}
      <div className="mb-6">
        <SearchBar initialValues={{
          zone: searchParams.get('zone'),
          checkIn: searchParams.get('checkIn'),
          checkOut: searchParams.get('checkOut'),
          guests: searchParams.get('guests')
        }} />
      </div>

      {/* Header con resultados y botones */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-accent-900">
            {resultsCount} {resultsCount === 1 ? 'propiedad encontrada' : 'propiedades encontradas'}
          </h1>
          {searchParams.get('zone') && (
            <p className="text-neutral-600 mt-1">
              en {searchParams.get('zone')}
            </p>
          )}
        </div>

        <div className="flex gap-3">
          {/* Ordenar */}
          <select
            value={filters.sortBy}
            onChange={(e) => {
              handleFilterChange('sortBy', e.target.value);
              setTimeout(applyFilters, 100);
            }}
            className="input py-2"
          >
            <option value="recommended">Recomendado</option>
            <option value="price-asc">Precio: menor a mayor</option>
            <option value="price-desc">Precio: mayor a menor</option>
            <option value="rating">Mejor valorados</option>
          </select>

          {/* Botón filtros */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary flex items-center relative"
          >
            <FunnelIcon className="h-5 w-5 mr-2" />
            Filtros
            {activeFiltersCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-secondary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Panel de filtros avanzados */}
      {showFilters && (
        <div className="card mb-6 animate-fadeIn">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold flex items-center">
              <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2" />
              Filtros avanzados
            </h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-neutral-400 hover:text-neutral-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Rango de precio */}
            <div>
              <label className="block text-sm font-medium mb-3">
                💰 Rango de precio (MXN por noche)
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    className="input"
                    placeholder="Mínimo"
                    min="0"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    className="input"
                    placeholder="Máximo"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Tipo de alojamiento */}
            <div>
              <label className="block text-sm font-medium mb-3">
                🏠 Tipo de alojamiento
              </label>
              <select
                value={filters.accommodationType}
                onChange={(e) => handleFilterChange('accommodationType', e.target.value)}
                className="input w-full"
              >
                <option value="">Todos los tipos</option>
                {accommodationTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Servicios */}
            {services.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-3">
                  ✨ Servicios
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {services.map(service => (
                    <label
                      key={service.id}
                      className="flex items-center space-x-2 cursor-pointer hover:bg-neutral-50 p-2 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={filters.services.includes(service.id.toString())}
                        onChange={() => toggleService(service.id)}
                        className="rounded text-secondary-600 focus:ring-secondary-500"
                      />
                      <span className="text-sm">
                        {service.icon && <span className="mr-1">{service.icon}</span>}
                        {service.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Valoración mínima */}
            <div>
              <label className="block text-sm font-medium mb-3">
                ⭐ Valoración mínima
              </label>
              <div className="flex gap-2">
                {[3, 4, 5].map(rating => (
                  <button
                    key={rating}
                    onClick={() => handleFilterChange('minRating', rating.toString())}
                    className={`px-4 py-2 rounded-lg border ${
                      filters.minRating === rating.toString()
                        ? 'bg-secondary-600 text-white border-secondary-600'
                        : 'bg-white text-neutral-700 border-neutral-300 hover:border-secondary-600'
                    }`}
                  >
                    {rating}+ ⭐
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="mt-6 flex justify-end space-x-3 pt-4 border-t">
            <button
              onClick={clearFilters}
              className="px-5 py-2 text-neutral-600 hover:text-neutral-900 font-medium"
            >
              Limpiar todo
            </button>
            <button
              onClick={applyFilters}
              className="btn-secondary"
            >
              Aplicar filtros
            </button>
          </div>

          {/* Contador de resultados */}
          <div className="mt-4 text-center text-sm text-neutral-600">
            {resultsCount} {resultsCount === 1 ? 'resultado' : 'resultados'} con estos filtros
          </div>
        </div>
      )}

      {/* Filtros activos (chips) */}
      {activeFiltersCount > 0 && !showFilters && (
        <div className="flex flex-wrap gap-2 mb-6">
          {filters.minPrice && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-secondary-100 text-secondary-800">
              Min: ${filters.minPrice}
              <button
                onClick={() => {
                  handleFilterChange('minPrice', '');
                  setTimeout(applyFilters, 100);
                }}
                className="ml-2 hover:text-secondary-900"
              >
                ×
              </button>
            </span>
          )}
          {filters.maxPrice && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-secondary-100 text-secondary-800">
              Max: ${filters.maxPrice}
              <button
                onClick={() => {
                  handleFilterChange('maxPrice', '');
                  setTimeout(applyFilters, 100);
                }}
                className="ml-2 hover:text-secondary-900"
              >
                ×
              </button>
            </span>
          )}
          {filters.accommodationType && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-secondary-100 text-secondary-800">
              {accommodationTypes.find(t => t.id.toString() === filters.accommodationType)?.name}
              <button
                onClick={() => {
                  handleFilterChange('accommodationType', '');
                  setTimeout(applyFilters, 100);
                }}
                className="ml-2 hover:text-secondary-900"
              >
                ×
              </button>
            </span>
          )}
          {filters.services.length > 0 && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-secondary-100 text-secondary-800">
              {filters.services.length} servicio(s)
              <button
                onClick={() => {
                  handleFilterChange('services', []);
                  setTimeout(applyFilters, 100);
                }}
                className="ml-2 hover:text-secondary-900"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}

      {/* Grid de resultados */}
      {properties.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-neutral-600 text-lg mb-4">
            No se encontraron propiedades con esos criterios
          </p>
          <button
            onClick={clearFilters}
            className="btn-secondary"
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map(property => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Search;