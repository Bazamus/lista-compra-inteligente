import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone, Chrome, Info } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * Componente para mostrar un prompt de instalación de PWA
 * Detecta el evento beforeinstallprompt y muestra un modal atractivo
 */
export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Detectar si es iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(ios);

    // Detectar si ya está instalado (modo standalone)
    const standalone = window.matchMedia('(display-mode: standalone)').matches ||
                      (window.navigator as any).standalone ||
                      document.referrer.includes('android-app://');
    setIsStandalone(standalone);

    // Verificar si el usuario ya rechazó la instalación
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    const dismissedDate = dismissed ? new Date(dismissed) : null;
    const daysSinceDismissed = dismissedDate
      ? (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24)
      : 999;

    // Solo mostrar si:
    // 1. No está ya instalado
    // 2. No fue rechazado en los últimos 7 días
    // 3. Es la primera vez o han pasado más de 7 días
    if (!standalone && daysSinceDismissed > 7) {
      // Para navegadores Android/Chrome/Edge
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e as BeforeInstallPromptEvent);

        // Mostrar prompt después de 5 segundos (para no ser intrusivo)
        setTimeout(() => {
          setShowPrompt(true);
        }, 5000);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

      // Para iOS, mostrar instrucciones después de 5 segundos si no hay prompt nativo
      if (ios && !standalone) {
        setTimeout(() => {
          setShowPrompt(true);
        }, 5000);
      }

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    }
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt && !isIOS) {
      return;
    }

    if (deferredPrompt) {
      // Android/Chrome/Edge
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        console.log('✅ PWA instalada correctamente');
      } else {
        console.log('❌ Usuario rechazó la instalación');
        localStorage.setItem('pwa-install-dismissed', new Date().toISOString());
      }

      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', new Date().toISOString());
  };

  // No mostrar si ya está instalado
  if (isStandalone) {
    return null;
  }

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={handleDismiss}
        >
          <motion.div
            initial={{ y: 100, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header con gradiente */}
            <div className="bg-gradient-to-r from-blue-600 to-green-500 p-6 text-white relative">
              <button
                onClick={handleDismiss}
                className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-full transition-colors"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-4">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                  <Download className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Instala ListaGPT</h3>
                  <p className="text-sm text-white/90">Acceso rápido desde tu dispositivo</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                    <Smartphone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      Como una app nativa
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Instala ListaGPT en tu pantalla de inicio para acceso instantáneo
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
                    <Chrome className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      Sin ocupar espacio
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Ligera y rápida, funciona offline y se actualiza automáticamente
                    </p>
                  </div>
                </div>
              </div>

              {/* Instrucciones específicas para iOS */}
              {isIOS && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      <p className="font-semibold mb-2">Para instalar en iOS:</p>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Toca el botón de compartir (cuadrado con flecha)</li>
                        <li>Selecciona "Añadir a pantalla de inicio"</li>
                        <li>Toca "Añadir" en la esquina superior derecha</li>
                      </ol>
                    </div>
                  </div>
                </div>
              )}

              {/* Botones */}
              <div className="flex gap-3 pt-2">
                {!isIOS && deferredPrompt && (
                  <button
                    onClick={handleInstallClick}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600 text-white font-semibold py-3 px-6 rounded-xl transition-all transform hover:scale-105 active:scale-95 shadow-lg"
                  >
                    Instalar ahora
                  </button>
                )}
                <button
                  onClick={handleDismiss}
                  className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold py-3 px-6 rounded-xl transition-colors"
                >
                  {isIOS ? 'Entendido' : 'Tal vez después'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
