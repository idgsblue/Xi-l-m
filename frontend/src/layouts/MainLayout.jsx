import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../pages/common/Header';
import Footer from '../pages/common/Footer';

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-900">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;