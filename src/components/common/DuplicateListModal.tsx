import { useState } from 'react';
import { X, Copy, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SavedList } from '../../hooks/useListHistory';

interface DuplicateListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDuplicate: (listId: string, newName: string) => Promise<void>;
  list: SavedList | null;
}

export const DuplicateListModal = ({
  isOpen,
  onClose,
  onDuplicate,
  list
}: DuplicateListModalProps) => {
  const [newName, setNewName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when modal opens with new list
  const handleOpen = () => {
    if (list) {
      setNewName(`${list.nombre} (Copia)`);
      setError(null);
    }
  };

  const handleDuplicate = async () => {
    if (!list) return;
    
    if (!newName.trim()) {
      setError('El nombre no puede estar vacío');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await onDuplicate(list.id, newName.trim());
      onClose();
    } catch (err) {
      setError('Error al duplicar la lista. Inténtalo de nuevo.');
      console.error('Error duplicating list:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
      setNewName('');
      setError(null);
    }
  };

  return (
    <AnimatePresence onExitComplete={handleOpen}>
      {isOpen && list && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Copy className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Duplicar Lista
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Crea una copia de "{list.nombre}"
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  disabled={isLoading}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Lista original info */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3 text-sm">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    list.tipo === 'IA' 
                      ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                      : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  }`}>
                    {list.tipo === 'IA' ? '🤖 IA' : '✏️ Manual'}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {list.productos.length} productos
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {list.presupuesto_estimado.toFixed(2)}€
                  </span>
                </div>
              </div>

              {/* Formulario */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nombre de la nueva lista
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => {
                      setNewName(e.target.value);
                      setError(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !isLoading) {
                        handleDuplicate();
                      }
                    }}
                    placeholder="Nombre de la lista duplicada"
                    disabled={isLoading}
                    autoFocus
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             dark:bg-gray-700 dark:text-white
                             disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  {error && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                      {error}
                    </p>
                  )}
                </div>

                {/* Info adicional */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    ℹ️ Se copiarán todos los productos, menús y configuración de la lista original.
                  </p>
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleClose}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           text-gray-700 dark:text-gray-300 font-medium
                           hover:bg-gray-50 dark:hover:bg-gray-700
                           transition-colors
                           disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDuplicate}
                  disabled={isLoading || !newName.trim()}
                  className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg
                           font-medium transition-colors
                           disabled:opacity-50 disabled:cursor-not-allowed
                           flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Duplicando...
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5" />
                      Duplicar
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

