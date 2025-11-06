// Service Worker Registration for Arroyo Seco PWA
// Este archivo maneja el registro, actualización y desregistro del service worker

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
    window.location.hostname === '[::1]' ||
    window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

export function register(config) {
  if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
    // The URL constructor is available in all browsers that support SW.
    const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
    if (publicUrl.origin !== window.location.origin) {
      // Our service worker won't work if PUBLIC_URL is on a different origin
      // from what our page is served on. This might happen if a CDN is used to
      // serve assets; see https://github.com/facebook/create-react-app/issues/2374
      return;
    }

    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

      if (isLocalhost) {
        // This is running on localhost. Let's check if a service worker still exists or not.
        checkValidServiceWorker(swUrl, config);

        // Add some additional logging to localhost, pointing developers to the
        // service worker/PWA documentation.
        navigator.serviceWorker.ready.then(() => {
          console.log(
            '🎉 Esta aplicación web está siendo servida con cache-first por un service ' +
              'worker. Para más información, visita https://cra.link/PWA'
          );
        });
      } else {
        // Is not localhost. Just register service worker
        registerValidSW(swUrl, config);
      }
    });
  }
}

function registerValidSW(swUrl, config) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      console.log('✅ Service Worker registrado exitosamente:', registration.scope);

      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // At this point, the updated precached content has been fetched,
              // but the previous service worker will still serve the older
              // content until all client tabs are closed.
              console.log(
                '📦 Nuevo contenido está disponible; se usará cuando todas las ' +
                  'pestañas de esta página estén cerradas. Ver https://cra.link/PWA.'
              );

              // Execute callback
              if (config && config.onUpdate) {
                config.onUpdate(registration);
              }

              // Mostrar notificación al usuario
              if (window.confirm('Nueva versión disponible. ¿Deseas actualizar ahora?')) {
                // Tell the service worker to skip waiting and become active
                if (registration.waiting) {
                  registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                }
                window.location.reload();
              }
            } else {
              // At this point, everything has been precached.
              // It's the perfect time to display a
              // "Content is cached for offline use." message.
              console.log('✅ Contenido cacheado para uso offline.');

              // Execute callback
              if (config && config.onSuccess) {
                config.onSuccess(registration);
              }
            }
          }
        };
      };
    })
    .catch((error) => {
      console.error('❌ Error durante el registro del service worker:', error);
    });
}

function checkValidServiceWorker(swUrl, config) {
  // Check if the service worker can be found. If it can't reload the page.
  fetch(swUrl, {
    headers: { 'Service-Worker': 'script' },
  })
    .then((response) => {
      // Ensure service worker exists, and that we really are getting a JS file.
      const contentType = response.headers.get('content-type');
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        // No service worker found. Probably a different app. Reload the page.
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        // Service worker found. Proceed as normal.
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log('❌ No se encontró conexión a internet. La app está corriendo en modo offline.');
    });
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
        console.log('🗑️ Service Worker desregistrado');
      })
      .catch((error) => {
        console.error('❌ Error desregistrando service worker:', error.message);
      });
  }
}

// Detectar cuando la app está online/offline
export function setupOnlineOfflineDetection() {
  window.addEventListener('online', () => {
    console.log('🌐 Conexión restablecida');

    // Mostrar notificación al usuario
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Conexión Restablecida', {
        body: 'Ya puedes usar todas las funciones de Arroyo Seco',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-96x96.png'
      });
    }
  });

  window.addEventListener('offline', () => {
    console.log('📡 Sin conexión - Modo offline activado');

    // Mostrar notificación al usuario
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Sin Conexión', {
        body: 'Algunas funciones pueden estar limitadas',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-96x96.png'
      });
    }
  });
}

// Solicitar permiso para notificaciones
export function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        console.log('✅ Permisos de notificación otorgados');
      } else {
        console.log('❌ Permisos de notificación denegados');
      }
    });
  }
}

// Verificar si la app está instalada
export function isAppInstalled() {
  // Para Chrome/Edge
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return true;
  }

  // Para Safari iOS
  if (window.navigator.standalone === true) {
    return true;
  }

  return false;
}

// Hook para detectar si se puede instalar
export function setupInstallPrompt() {
  let deferredPrompt = null;

  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later.
    deferredPrompt = e;
    console.log('📲 App puede ser instalada');

    // Dispatch custom event for React components to listen
    window.dispatchEvent(new CustomEvent('app-install-available', { detail: deferredPrompt }));
  });

  window.addEventListener('appinstalled', () => {
    console.log('✅ PWA instalada exitosamente');
    deferredPrompt = null;

    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('app-installed'));
  });

  return {
    getPrompt: () => deferredPrompt,
    clearPrompt: () => {
      deferredPrompt = null;
    }
  };
}
