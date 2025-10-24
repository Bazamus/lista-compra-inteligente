import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, FileText, Printer, Check } from 'lucide-react';

interface ExportOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExportPDF: (options: ExportOptions) => void;
  onPrint: (options: ExportOptions) => void;
}

export interface ExportOptions {
  includePrices: boolean;
  includeMenus: boolean;
}

export const ExportOptionsModal = ({
  isOpen,
  onClose,
  onExportPDF,
  onPrint,
}: ExportOptionsModalProps) => {
  const [options, setOptions] = useState<ExportOptions>({
    includePrices: true,
    includeMenus: true,
  });

  const handleExportPDF = () => {
    onExportPDF(options);
    onClose();
  };

  const handlePrint = () => {
    onPrint(options);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Exportar Lista
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Configura las opciones de exportación
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Opciones */}
          <div className="space-y-4 mb-6">
            {/* Incluir precios */}
            <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={options.includePrices}
                onChange={(e) =>
                  setOptions({ ...options, includePrices: e.target.checked })
                }
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">
                  Incluir precios
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Muestra precios unitarios y totales
                </p>
              </div>
              {options.includePrices && (
                <Check className="w-5 h-5 text-blue-600" />
              )}
            </label>

            {/* Incluir menús */}
            <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={options.includeMenus}
                onChange={(e) =>
                  setOptions({ ...options, includeMenus: e.target.checked })
                }
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">
                  Incluir menú semanal
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Añade el menú planificado al documento
                </p>
              </div>
              {options.includeMenus && (
                <Check className="w-5 h-5 text-blue-600" />
              )}
            </label>
          </div>

          {/* Acciones */}
          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-medium transition-colors"
            >
              <Printer className="w-5 h-5" />
              <span>Imprimir</span>
            </button>
            <button
              onClick={handleExportPDF}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
            >
              <Download className="w-5 h-5" />
              <span>Descargar PDF</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

