import { X, Calendar, Users, Clock, ShoppingBag, Euro } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SavedList } from '../../hooks/useListHistory';

interface QuickPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  list: SavedList | null;
  onViewFull: () => void;
}

export const QuickPreviewModal = ({
  isOpen,
  onClose,
  list,
  onViewFull
}: QuickPreviewModalProps) => {
  if (!list) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-green-500 to-green-600 text-white p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl font-bold">
                        {list.nombre}
                      </h2>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        list.tipo === 'IA' 
                          ? 'bg-purple-500/20 backdrop-blur-sm border border-purple-300'
                          : 'bg-blue-500/20 backdrop-blur-sm border border-blue-300'
                      }`}>
                        {list.tipo === 'IA' ? '🤖 IA' : '✏️ Manual'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-green-100">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(list.fecha)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Contenido */}
              <div className="overflow-y-auto max-h-[calc(90vh-180px)] p-6">
                {/* Información general */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
                      <Users className="w-5 h-5" />
                      <span className="text-sm font-medium">Personas</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {list.personas}
                    </p>
                  </div>

                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-1">
                      <Clock className="w-5 h-5" />
                      <span className="text-sm font-medium">Días</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {list.dias}
                    </p>
                  </div>

                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-1">
                      <ShoppingBag className="w-5 h-5" />
                      <span className="text-sm font-medium">Productos</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {list.productos.length}
                    </p>
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400 mb-1">
                      <Euro className="w-5 h-5" />
                      <span className="text-sm font-medium">Presupuesto</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {list.presupuesto_estimado.toFixed(2)}€
                    </p>
                  </div>
                </div>

                {/* Lista de productos (preview) */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                    📦 Productos ({list.productos.length})
                  </h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {list.productos.slice(0, 10).map((producto, idx) => (
                      <div
                        key={`${producto.id_producto}-${idx}`}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {producto.nombre}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {producto.categoria}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {producto.precio_unitario.toFixed(2)}€
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            x{producto.cantidad}
                          </p>
                        </div>
                      </div>
                    ))}
                    {list.productos.length > 10 && (
                      <div className="p-3 text-center text-gray-600 dark:text-gray-400">
                        ... y {list.productos.length - 10} productos más
                      </div>
                    )}
                  </div>
                </div>

                {/* Menús (si existen) */}
                {Object.keys(list.menus).length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                      🍽️ Menús ({Object.keys(list.menus).length} días)
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(list.menus).slice(0, 3).map(([dia, menu]) => (
                        <div
                          key={dia}
                          className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                        >
                          <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                            {dia}
                          </h4>
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">🌅 Desayuno:</span>
                              <p className="text-gray-900 dark:text-white">{menu.desayuno}</p>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">🌞 Comida:</span>
                              <p className="text-gray-900 dark:text-white">{menu.comida}</p>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">🌙 Cena:</span>
                              <p className="text-gray-900 dark:text-white">{menu.cena}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                      {Object.keys(list.menus).length > 3 && (
                        <div className="p-3 text-center text-gray-600 dark:text-gray-400">
                          ... y {Object.keys(list.menus).length - 3} días más
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Recomendaciones (si existen) */}
                {list.recomendaciones && list.recomendaciones.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                      💡 Recomendaciones
                    </h3>
                    <ul className="space-y-2">
                      {list.recomendaciones.map((rec, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg"
                        >
                          <span className="text-amber-600 dark:text-amber-400">•</span>
                          <span className="text-gray-900 dark:text-white">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Footer con acciones */}
              <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4">
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                             text-gray-700 dark:text-gray-300 font-medium
                             hover:bg-gray-100 dark:hover:bg-gray-800
                             transition-colors"
                  >
                    Cerrar
                  </button>
                  <button
                    onClick={onViewFull}
                    className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg
                             font-medium transition-colors"
                  >
                    Ver lista completa
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

