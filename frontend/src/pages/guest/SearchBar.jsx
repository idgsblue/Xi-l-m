import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import { MagnifyingGlassIcon, MapPinIcon, CalendarIcon, UsersIcon } from '@heroicons/react/24/outline';

function parseParams(sp) {
  const getDate = (k) => {
    const v = sp.get(k);
    return v ? new Date(v) : null;
  };
  const getNum = (k, fallback) => {
    const v = sp.get(k);
    return v ? Number(v) : fallback;
  };

  return {
    zone: sp.get('zone') || '',
    checkIn: getDate('checkIn'),
    checkOut: getDate('checkOut'),
    guests: getNum('guests', 2),
  };
}

const SearchBar = ({ initialValues = {}, showHostButton = false }) => {
  const navigate = useNavigate();
  const [parentSearchParams] = useSearchParams();

  const [searchData, setSearchData] = useState({
    zone: initialValues.zone || '',
    checkIn: initialValues.checkIn ? new Date(initialValues.checkIn) : null,
    checkOut: initialValues.checkOut ? new Date(initialValues.checkOut) : null,
    guests: initialValues.guests ? Number(initialValues.guests) : 2
  });

  // 🔄 Mantén sincronizados los inputs con el querystring cuando éste cambie
  useEffect(() => {
    const next = parseParams(parentSearchParams);
    setSearchData((prev) => {
      // Evita sobrescribir mientras el usuario escribe lo mismo
      const same =
        prev.zone === next.zone &&
        (prev.checkIn?.toDateString() || null) === (next.checkIn?.toDateString() || null) &&
        (prev.checkOut?.toDateString() || null) === (next.checkOut?.toDateString() || null) &&
        prev.guests === next.guests;
      return same ? prev : next;
    });
  }, [parentSearchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    // Inicia desde los params existentes para conservar filtros avanzados
    const params = new URLSearchParams(parentSearchParams.toString());

    if (searchData.zone) params.set('zone', searchData.zone);
    else params.delete('zone');

    if (searchData.checkIn) params.set('checkIn', searchData.checkIn.toISOString().split('T')[0]);
    else params.delete('checkIn');

    if (searchData.checkOut) params.set('checkOut', searchData.checkOut.toISOString().split('T')[0]);
    else params.delete('checkOut');

    // Validación de fechas
    if (searchData.checkIn && searchData.checkOut && searchData.checkOut < searchData.checkIn) {
      alert('La fecha de check-out debe ser posterior a la fecha de check-in.');
      return;
    }

    // Huéspedes (exact match)
    if (typeof searchData.guests === 'number' && !Number.isNaN(searchData.guests)) {
      params.set('guests', String(searchData.guests));
      params.set('guestsExact', '1');
    } else {
      params.delete('guests');
      params.delete('guestsExact');
    }

    // Navega a /search con los nuevos params
    navigate(
      { pathname: '/search', search: `?${params.toString()}` },
      { state: searchData }
    );
  };

  return (
    <form onSubmit={handleSearch} className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg p-3 md:p-4 border border-neutral-200 dark:border-neutral-700">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 md:gap-4">
        {/* Ubicación */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MapPinIcon className="h-5 w-5 text-neutral-400 dark:text-neutral-500" />
          </div>
          <input
            type="text"
            value={searchData.zone}
            onChange={(e) => setSearchData({ ...searchData, zone: e.target.value })}
            placeholder="¿A dónde vas?"
            className="input pl-10"
          />
        </div>

        {/* Check-in */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
            <CalendarIcon className="h-5 w-5 text-neutral-400 dark:text-neutral-500" />
          </div>
          <DatePicker
            selected={searchData.checkIn}
            onChange={(date) => setSearchData({ ...searchData, checkIn: date })}
            selectsStart
            startDate={searchData.checkIn}
            endDate={searchData.checkOut}
            minDate={new Date()}
            placeholderText="Check-in"
            className="input pl-10"
          />
        </div>

        {/* Check-out */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
            <CalendarIcon className="h-5 w-5 text-neutral-400 dark:text-neutral-500" />
          </div>
          <DatePicker
            selected={searchData.checkOut}
            onChange={(date) => setSearchData({ ...searchData, checkOut: date })}
            selectsEnd
            startDate={searchData.checkIn}
            endDate={searchData.checkOut}
            minDate={searchData.checkIn || new Date()}
            placeholderText="Check-out"
            className="input pl-10"
          />
        </div>

        {/* Huéspedes */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
            <UsersIcon className="h-5 w-5 text-neutral-400 dark:text-neutral-500" />
          </div>
          <select
            value={searchData.guests}
            onChange={(e) => setSearchData({ ...searchData, guests: Number(e.target.value) })}
            className="input pl-10"
          >
            {[...Array(10)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1} {i === 0 ? 'huésped' : 'huéspedes'}
              </option>
            ))}
          </select>
        </div>

        {/* Botón Buscar */}
        <button
          type="submit"
          className="btn-secondary w-full md:w-auto flex items-center justify-center py-3 md:py-2"
        >
          <MagnifyingGlassIcon className="h-5 w-5" />
          <span className="ml-2">Buscar</span>
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
