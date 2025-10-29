import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import { MagnifyingGlassIcon, MapPinIcon, CalendarIcon, UsersIcon } from '@heroicons/react/24/outline';

const SearchBar = ({ initialValues = {} }) => {
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState({
    zone: initialValues.zone || '',
    checkIn: initialValues.checkIn ? new Date(initialValues.checkIn) : null,
    checkOut: initialValues.checkOut ? new Date(initialValues.checkOut) : null,
    guests: initialValues.guests || '2'
  });

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    
    if (searchData.zone) params.append('zone', searchData.zone);
    if (searchData.checkIn) params.append('checkIn', searchData.checkIn.toISOString().split('T')[0]);
    if (searchData.checkOut) params.append('checkOut', searchData.checkOut.toISOString().split('T')[0]);
    if (searchData.guests) params.append('guests', searchData.guests);
    
    navigate(`/search?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="bg-white rounded-lg shadow-lg p-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Ubicación */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MapPinIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchData.zone}
            onChange={(e) => setSearchData({ ...searchData, zone: e.target.value })}
            placeholder="¿A dónde vas?"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Check-in */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <CalendarIcon className="h-5 w-5 text-gray-400" />
          </div>
          <DatePicker
            selected={searchData.checkIn}
            onChange={(date) => setSearchData({ ...searchData, checkIn: date })}
            selectsStart
            startDate={searchData.checkIn}
            endDate={searchData.checkOut}
            minDate={new Date()}
            placeholderText="Check-in"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Check-out */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <CalendarIcon className="h-5 w-5 text-gray-400" />
          </div>
          <DatePicker
            selected={searchData.checkOut}
            onChange={(date) => setSearchData({ ...searchData, checkOut: date })}
            selectsEnd
            startDate={searchData.checkIn}
            endDate={searchData.checkOut}
            minDate={searchData.checkIn || new Date()}
            placeholderText="Check-out"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Huéspedes y Buscar */}
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <UsersIcon className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={searchData.guests}
              onChange={(e) => setSearchData({ ...searchData, guests: e.target.value })}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              {[...Array(10)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1} {i === 0 ? 'huésped' : 'huéspedes'}
                </option>
              ))}
            </select>
          </div>
          
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <MagnifyingGlassIcon className="h-5 w-5" />
            <span className="hidden sm:ml-2 sm:inline">Buscar</span>
          </button>
        </div>
      </div>
    </form>
  );
};

export default SearchBar;