import { useState, useEffect } from 'react';

/**
 * Hook personalizado para detectar el estado de conexión a internet
 * @returns {boolean} true si hay conexión, false si está offline
 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    // Handlers para eventos de conexión
    const handleOnline = () => {
      setIsOnline(true);
      console.log('🌐 Conexión a internet restaurada');
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log('📡 Sin conexión a internet - Modo offline activado');
    };

    // Agregar event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Verificación periódica adicional (cada 30 segundos)
    const intervalId = setInterval(() => {
      const currentStatus = navigator.onLine;
      if (currentStatus !== isOnline) {
        setIsOnline(currentStatus);
        console.log(
          `🔄 Estado de conexión actualizado: ${currentStatus ? 'Online' : 'Offline'}`
        );
      }
    }, 30000);

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(intervalId);
    };
  }, [isOnline]);

  return isOnline;
}
