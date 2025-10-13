import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Registrar Service Worker para PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((registration) => {
        console.log('✅ Service Worker registrado correctamente:', registration.scope);

        // Verificar actualizaciones cada hora
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);
      })
      .catch((error) => {
        console.error('❌ Error al registrar Service Worker:', error);
      });

    // Escuchar actualizaciones del Service Worker
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('🔄 Service Worker actualizado - Recargando página...');
      window.location.reload();
    });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
