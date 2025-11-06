import { useState, useEffect } from 'react';

/**
 * PWA Install Prompt Component
 * Shows a banner prompting users to install the PWA
 */
const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    ) {
      setIsInstalled(true);
      return;
    }

    // Listen for install prompt event
    const handleBeforeInstallPrompt = (e) => {
      console.log('📲 PWA install prompt available');
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('✅ PWA installed successfully');
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Also listen for custom events
    window.addEventListener('app-install-available', (e) => {
      setDeferredPrompt(e.detail);
      setShowInstallPrompt(true);
    });

    window.addEventListener('app-installed', () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      console.log('❌ No hay prompt de instalación disponible');
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user's response
    const { outcome } = await deferredPrompt.userChoice;

    console.log(`Usuario respondió: ${outcome}`);

    if (outcome === 'accepted') {
      console.log('✅ Usuario aceptó instalar la PWA');
    } else {
      console.log('❌ Usuario rechazó instalar la PWA');
    }

    // Clear the prompt
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    // Remember dismissal for 7 days
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // Don't show if:
  // 1. Already installed
  // 2. No prompt available
  // 3. Dismissed recently (within 7 days)
  const dismissedTime = localStorage.getItem('pwa-install-dismissed');
  const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;

  if (
    isInstalled ||
    !showInstallPrompt ||
    (dismissedTime && Date.now() - parseInt(dismissedTime) < sevenDaysInMs)
  ) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-2xl animate-slide-up">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 flex-1">
          <div className="text-3xl">📱</div>
          <div>
            <h3 className="font-bold text-lg">¡Instala Arroyo Seco!</h3>
            <p className="text-sm text-sky-100">
              Accede más rápido y úsala sin conexión
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleDismiss}
            className="px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors font-medium"
          >
            Ahora no
          </button>
          <button
            onClick={handleInstallClick}
            className="px-6 py-2 rounded-lg bg-white text-blue-600 hover:bg-blue-50 transition-colors font-bold shadow-lg"
          >
            Instalar
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
