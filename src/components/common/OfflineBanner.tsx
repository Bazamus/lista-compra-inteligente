import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { useState, useEffect } from 'react';

/**
 * Banner que se muestra cuando el usuario está offline
 * Con animación de entrada/salida y mensaje de reconexión
 */
export default function OfflineBanner() {
  const isOnline = useOnlineStatus();
  const [showReconnected, setShowReconnected] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    // Si estaba offline y ahora está online, mostrar mensaje de reconexión
    if (wasOffline && isOnline) {
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
        setWasOffline(false);
      }, 3000);
      return () => clearTimeout(timer);
    }

    // Marcar que estuvo offline
    if (!isOnline) {
      setWasOffline(true);
    }
  }, [isOnline, wasOffline]);

  return (
    <AnimatePresence mode="wait">
      {/* Banner de OFFLINE */}
      {!isOnline && (
        <motion.div
          key="offline"
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg"
        >
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-center gap-3">
            <WifiOff className="w-5 h-5 animate-pulse" />
            <p className="text-sm font-medium">
              Sin conexión a internet - Algunas funciones pueden estar limitadas
            </p>
          </div>
        </motion.div>
      )}

      {/* Banner de RECONECTADO */}
      {showReconnected && isOnline && (
        <motion.div
          key="reconnected"
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg"
        >
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-center gap-3">
            <Wifi className="w-5 h-5" />
            <p className="text-sm font-medium">
              Conexión restaurada correctamente
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
