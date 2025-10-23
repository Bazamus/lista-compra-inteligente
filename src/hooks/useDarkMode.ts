import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'darkMode';
const DARK_CLASS = 'dark';

/**
 * Hook para gestionar el modo oscuro de la aplicación
 * 
 * Características:
 * - Persistencia en localStorage
 * - Respeta preferencia del sistema como default
 * - Toggle suave con transición
 * - Actualiza la clase 'dark' en el elemento HTML
 */
export const useDarkMode = () => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    // Intentar cargar preferencia guardada
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      return stored === 'true';
    }
    
    // Si no hay preferencia guardada, usar preferencia del sistema
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Aplicar clase dark al HTML cuando cambie el estado
  useEffect(() => {
    const root = document.documentElement;
    
    if (isDark) {
      root.classList.add(DARK_CLASS);
    } else {
      root.classList.remove(DARK_CLASS);
    }
    
    // Guardar preferencia en localStorage
    localStorage.setItem(STORAGE_KEY, isDark.toString());
    
    console.log('🌙 Dark mode:', isDark ? 'enabled' : 'disabled');
  }, [isDark]);

  // Escuchar cambios en la preferencia del sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      // Solo aplicar si no hay preferencia guardada explícitamente
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === null) {
        setIsDark(e.matches);
      }
    };
    
    // Navegadores modernos
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    // Fallback para navegadores antiguos
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  /**
   * Toggle entre dark y light mode
   */
  const toggle = useCallback(() => {
    setIsDark(prev => !prev);
  }, []);

  /**
   * Activar dark mode
   */
  const enable = useCallback(() => {
    setIsDark(true);
  }, []);

  /**
   * Desactivar dark mode
   */
  const disable = useCallback(() => {
    setIsDark(false);
  }, []);

  /**
   * Resetear a preferencia del sistema
   */
  const resetToSystem = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDark(systemPreference);
  }, []);

  return {
    isDark,
    toggle,
    enable,
    disable,
    resetToSystem
  };
};

