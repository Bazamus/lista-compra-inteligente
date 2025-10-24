import React, { useState, useEffect } from 'react';
import { X, FileText, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  currentNote?: string;
  onSave: (note: string) => void;
}

export const ProductNoteModal: React.FC<ProductNoteModalProps> = ({
  isOpen,
  onClose,
  productName,
  currentNote = '',
  onSave,
}) => {
  const [note, setNote] = useState(currentNote);

  useEffect(() => {
    setNote(currentNote);
  }, [currentNote, isOpen]);

  const handleSave = () => {
    onSave(note.trim());
    onClose();
  };

  const handleRemove = () => {
    onSave('');
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSave();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            <div
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Añadir Nota
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                      {productName}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ej: Comprar ecológico, sin lactosa, para el cumpleaños..."
                  className="w-full h-32 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           placeholder-gray-400 dark:placeholder-gray-500
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           resize-none transition-all"
                  autoFocus
                />
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  💡 <strong>Tip:</strong> Usa notas para recordar preferencias específicas
                </p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleRemove}
                  className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 
                           hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  disabled={!currentNote}
                >
                  Eliminar Nota
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 
                             hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium 
                             bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Guardar
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

