import React from 'react';

const AdminDashboard = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Panel de Administración</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Propiedades</h3>
          <p className="text-3xl font-bold text-secondary-600">0</p>
          <p className="text-sm text-neutral-600 mt-2">Total de propiedades</p>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Usuarios</h3>
          <p className="text-3xl font-bold text-green-600">0</p>
          <p className="text-sm text-neutral-600 mt-2">Usuarios registrados</p>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Reservas</h3>
          <p className="text-3xl font-bold text-purple-600">0</p>
          <p className="text-sm text-neutral-600 mt-2">Reservas activas</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;