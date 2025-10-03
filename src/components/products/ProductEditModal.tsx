import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Save, Minus, Plus } from 'lucide-react';

interface Producto {
  id_producto: number;
  nombre: string;
  cantidad: number;
  precio_unitario: number;
  categoria: string;
  esencial: boolean;
}

interface ProductEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  producto: Producto | null;
  onSave: (producto: Producto, nuevaCantidad: number) => void;
  onDelete: (productoId: number) => void;
}

const ProductEditModal: React.FC<ProductEditModalProps> = ({
  isOpen,
  onClose,
  producto,
  onSave,
  onDelete
}) => {
  const [cantidad, setCantidad] = useState(1);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Actualizar cantidad cuando cambie el producto
  React.useEffect(() => {
    if (producto) {
      setCantidad(producto.cantidad);
    }
  }, [producto]);

  const handleSave = () => {
    if (producto) {
      onSave(producto, cantidad);
      onClose();
    }
  };

  const handleDelete = () => {
    if (producto) {
      onDelete(producto.id_producto);
      onClose();
    }
  };

  const incrementarCantidad = () => {
    setCantidad(prev => prev + 1);
  };

  const decrementarCantidad = () => {
    setCantidad(prev => Math.max(1, prev - 1));
  };

  if (!isOpen || !producto) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Editar Producto
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Product Info */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                {producto.nombre}
              </h3>
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <span>Categoría: {producto.categoria}</span>
                <span>Precio: {producto.precio_unitario.toFixed(2)}€</span>
                {producto.esencial && (
                  <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full">
                    Esencial
                  </span>
                )}
              </div>
            </div>

            {/* Quantity Editor */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Cantidad
              </label>
              <div className="flex items-center gap-4">
                <button
                  onClick={decrementarCantidad}
                  className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600
                           rounded-lg transition-colors"
                >
                  <Minus className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>
                
                <input
                  type="number"
                  min="1"
                  value={cantidad}
                  onChange={(e) => setCantidad(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 px-3 py-2 text-center border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-medium"
                />
                
                <button
                  onClick={incrementarCantidad}
                  className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600
                           rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
              
              <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Total: {(producto.precio_unitario * cantidad).toFixed(2)}€
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600
                         text-white rounded-lg transition-colors font-medium"
              >
                <Save className="w-4 h-4" />
                Guardar
              </button>
              
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-red-500 hover:bg-red-600
                         text-white rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Delete Confirmation */}
          <AnimatePresence>
            {showDeleteConfirm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center"
              >
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trash2 className="w-8 h-8 text-red-600 dark:text-red-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    ¿Eliminar producto?
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    Esta acción no se puede deshacer
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600
                               text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleDelete}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProductEditModal;
