import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import PropertyCard from '../components/guest/PropertyCard';
import SearchBar from '../components/guest/SearchBar';
import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

const Search = () => {
  const [searchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    zone: searchParams.get('zone') || '',
    checkIn: searchParams.get('checkIn') || '',
    checkOut: searchParams.get('checkOut') || '',
    guests: searchParams.get('guests') || '',
    minPrice: '',
    maxPrice: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 1,
    currentPage: 1,
    perPage: 12
  });

  useEffect(() => {
    searchProperties(1);
  }, [searchParams]);

  const searchProperties = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
      });
      params.append('page', page);
      params.append('limit', pagination.perPage);

      const response = await api.get(`/properties?${params}`);
      setProperties(response.data.properties);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error('Error al buscar propiedades');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    searchProperties(1);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({
      zone: '',
      checkIn: '',
      checkOut: '',
      guests: '',
      minPrice: '',
      maxPrice: ''
    });
    searchProperties(1);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <SearchBar initialValues={filters} />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {pagination.total} propiedades encontradas
          </h1>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            <FunnelIcon className="h-5 w-5 mr-2" />
            Filtros
          </button>
        </div>

        {/* Panel de Filtros */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio mínimo (MXN)
                </label>
                <input
                  type="number"
                  name="minPrice"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio máximo (MXN)
                </label>
                <input
                  type="number"
                  name="maxPrice"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="10000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de huéspedes
                </label>
                <input
                  type="number"
                  name="guests"
                  value={filters.guests}
                  onChange={handleFilterChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="2"
                  min="1"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Limpiar filtros
              </button>
              <button
                onClick={applyFilters}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
              >
                Aplicar filtros
              </button>
            </div>
          </div>
        )}

        {/* Resultados */}
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-300 h-48 rounded-lg"></div>
                <div className="mt-4 h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="mt-2 h-4 bg-gray-300 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : properties.length > 0 ? (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>

            {/* Paginación */}
            {pagination.pages > 1 && (
              <div className="mt-8 flex justify-center">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() => searchProperties(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  {[...Array(pagination.pages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => searchProperties(i + 1)}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        pagination.currentPage === i + 1
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => searchProperties(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.pages}
                    className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                  </button>
                </nav>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">No se encontraron propiedades con los filtros seleccionados</p>
            <button
              onClick={clearFilters}
              className="mt-4 text-blue-600 hover:text-blue-500 font-medium"
            >
              Limpiar filtros y buscar de nuevo
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;