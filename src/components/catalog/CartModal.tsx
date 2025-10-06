import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Plus, Minus, Trash2, AlertCircle, ShoppingBag } from 'lucide-react';
import type { Cart, CartItem } from '../../types/cart.types';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: Cart;
  onUpdateQuantity: (productId: number, newQuantity: number) => void;
  onRemoveProduct: (productId: number) => void;
  onGenerateList: (listName: string) => void;
}

const CartModal: React.FC<CartModalProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveProduct,
  onGenerateList,
}) => {
  const [listName, setListName] = useState('');
  const [error, setError] = useState('');

  const handleGenerateList = () => {
    if (!listName.trim()) {
      setError('Por favor, introduce un nombre para tu lista');
      return;
    }

    if (cart.items.length === 0) {
      setError('El carrito está vacío');
      return;
    }

    onGenerateList(listName.trim());
    setListName('');
    setError('');
  };

  const handleIncrement = (item: CartItem) => {
    onUpdateQuantity(item.product.id_producto, item.quantity + 1);
  };

  const handleDecrement = (item: CartItem) => {
    if (item.quantity > 1) {
      onUpdateQuantity(item.product.id_producto, item.quantity - 1);
    } else {
      onRemoveProduct(item.product.id_producto);
    }
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
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 top-[5%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-3xl max-h-[90vh] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Mi Carrito</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {cart.totalItems} {cart.totalItems === 1 ? 'producto' : 'productos'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {cart.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                    <ShoppingBag className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Tu carrito está vacío
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Añade productos desde el catálogo para crear tu lista
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.items.map((item) => (
                    <motion.div
                      key={item.product.id_producto}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:shadow-md transition-shadow"
                    >
                      {/* Imagen */}
                      <div className="w-20 h-20 flex-shrink-0 bg-white dark:bg-gray-600 rounded-lg overflow-hidden">
                        {item.product.imagen_url ? (
                          <img
                            src={item.product.imagen_url}
                            alt={item.product.nombre_producto}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                          {item.product.nombre_producto}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {item.product.nombre_categoria} • {item.product.nombre_subcategoria}
                        </p>
                        <div className="flex items-baseline gap-2 mt-1">
                          <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                            {item.product.precio_por_unidad.toFixed(2)}€
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            / {item.product.unidad_medida}
                          </p>
                        </div>
                      </div>

                      {/* Controles */}
                      <div className="flex flex-col items-end justify-between">
                        {/* Cantidad */}
                        <div className="flex items-center gap-2 bg-white dark:bg-gray-600 rounded-lg p-1">
                          <button
                            onClick={() => handleDecrement(item)}
                            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-500 transition-colors"
                          >
                            {item.quantity === 1 ? (
                              <Trash2 className="w-4 h-4 text-red-500" />
                            ) : (
                              <Minus className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                            )}
                          </button>
                          <span className="w-8 text-center font-semibold text-gray-900 dark:text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleIncrement(item)}
                            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-500 transition-colors"
                          >
                            <Plus className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                          </button>
                        </div>

                        {/* Subtotal */}
                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                          {(item.product.precio_por_unidad * item.quantity).toFixed(2)}€
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {cart.items.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-700 p-6 space-y-4">
                {/* Resumen */}
                <div className="flex items-center justify-between text-lg">
                  <span className="font-semibold text-gray-900 dark:text-white">Total:</span>
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {cart.totalPrice.toFixed(2)}€
                  </span>
                </div>

                {/* Input nombre lista */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nombre de la lista
                  </label>
                  <input
                    type="text"
                    value={listName}
                    onChange={(e) => {
                      setListName(e.target.value);
                      setError('');
                    }}
                    placeholder="Ej: Compra semanal, Despensa..."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                  {error && (
                    <div className="flex items-center gap-2 mt-2 text-red-500 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>{error}</span>
                    </div>
                  )}
                </div>

                {/* Botón generar */}
                <button
                  onClick={handleGenerateList}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
                >
                  Generar Lista de Compra
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartModal;
