import React from 'react';
import ReactDOM from 'react-dom/client';

import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'react-datepicker/dist/react-datepicker.css';

// PWA Service Worker
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <App />
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// Register PWA Service Worker
serviceWorkerRegistration.register({
  onSuccess: (registration) => {
    console.log('✅ PWA instalada y lista para uso offline');
  },
  onUpdate: (registration) => {
    console.log('📦 Nueva versión disponible. Por favor recarga la página.');
  }
});

// Setup online/offline detection
serviceWorkerRegistration.setupOnlineOfflineDetection();

// Setup install prompt
serviceWorkerRegistration.setupInstallPrompt();

// Optional: Request notification permission after user interaction
// serviceWorkerRegistration.requestNotificationPermission();