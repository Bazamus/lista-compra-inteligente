import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Eye } from 'lucide-react';

interface CartWidgetProps {
  totalItems: number;
  totalPrice: number;
  onViewCart: () => void;
}

const CartWidget: React.FC<CartWidgetProps> = ({
  totalItems,
  totalPrice,
  onViewCart,
}) => {
  if (totalItems === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-40 md:bottom-6 md:right-6 md:left-auto md:max-w-sm"
      >
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-2xl md:rounded-2xl shadow-2xl p-4">
          <div className="flex items-center justify-between">
            {/* Info del carrito */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <ShoppingCart className="w-8 h-8" />
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                  {totalItems}
                </span>
              </div>

              <div>
                <p className="text-sm opacity-90">
                  {totalItems} {totalItems === 1 ? 'producto' : 'productos'}
                </p>
                <p className="text-2xl font-bold">
                  {totalPrice.toFixed(2)}€
                </p>
              </div>
            </div>

            {/* Botón ver carrito */}
            <button
              onClick={onViewCart}
              className="flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-colors shadow-lg"
            >
              <Eye className="w-5 h-5" />
              <span>Ver Carrito</span>
            </button>
          </div>

          {/* Barra de progreso animada */}
          <div className="mt-3 h-1 bg-blue-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              className="h-full bg-white"
            />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CartWidget;
