import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, ShoppingBag, TrendingUp } from 'lucide-react';
import { useState } from 'react';

interface RecurrentSuggestionProps {
  productCount: number;
  productNames: string[]; // Primeros 3-5 nombres para mostrar
  onAccept: () => void;
  onDismiss: () => void;
}

export const RecurrentSuggestion = ({
  productCount,
  productNames,
  onAccept,
  onDismiss
}: RecurrentSuggestionProps) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => onDismiss(), 300); // Esperar a que termine la animación
  };

  const handleAccept = () => {
    onAccept();
    setIsVisible(false);
    setTimeout(() => onDismiss(), 300);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="relative bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 
                     border-2 border-purple-200 dark:border-purple-700 rounded-xl p-6 shadow-lg"
        >
          {/* Botón cerrar */}
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 p-1.5 hover:bg-purple-200 dark:hover:bg-purple-800 
                     rounded-full transition-colors"
            title="Cerrar sugerencia"
          >
            <X className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </button>

          <div className="flex items-start gap-4">
            {/* Icono */}
            <div className="flex-shrink-0 p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl">
              <Sparkles className="w-6 h-6 text-white" />
            </div>

            {/* Contenido */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-bold text-purple-900 dark:text-purple-100">
                  ¡Tus productos habituales!
                </h3>
                <span className="px-2 py-0.5 bg-purple-200 dark:bg-purple-800 text-purple-700 dark:text-purple-300 
                               text-xs font-bold rounded-full">
                  {productCount} productos
                </span>
              </div>

              <p className="text-sm text-purple-800 dark:text-purple-200 mb-3">
                Detectamos que estos productos aparecen frecuentemente en tus listas:
              </p>

              {/* Lista de productos de ejemplo */}
              <div className="flex flex-wrap gap-2 mb-4">
                {productNames.slice(0, 5).map((name, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-white dark:bg-gray-800 text-purple-700 dark:text-purple-300 
                             text-sm rounded-full border border-purple-200 dark:border-purple-700"
                  >
                    {name}
                  </span>
                ))}
                {productCount > 5 && (
                  <span className="px-3 py-1 text-purple-600 dark:text-purple-400 text-sm font-medium">
                    +{productCount - 5} más
                  </span>
                )}
              </div>

              {/* Botones de acción */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleAccept}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 
                           hover:from-purple-700 hover:to-blue-700 text-white font-medium rounded-lg 
                           transition-all transform hover:scale-105 shadow-md"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Añadir todos a mi lista</span>
                </button>

                <button
                  onClick={handleDismiss}
                  className="px-4 py-2 bg-white dark:bg-gray-800 hover:bg-purple-100 dark:hover:bg-purple-900/30 
                           text-purple-700 dark:text-purple-300 font-medium rounded-lg border-2 border-purple-200 
                           dark:border-purple-700 transition-colors"
                >
                  Ahora no
                </button>
              </div>

              {/* Info adicional */}
              <div className="flex items-center gap-2 mt-4 text-xs text-purple-600 dark:text-purple-400">
                <TrendingUp className="w-4 h-4" />
                <span>Basado en tus últimas 5 listas de compra</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

