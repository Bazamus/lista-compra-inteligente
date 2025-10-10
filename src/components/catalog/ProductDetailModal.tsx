import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, Tag, ShoppingCart, Plus, Minus, ExternalLink, Info } from 'lucide-react';
import type { CartProduct } from '../../types/cart.types';

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: CartProduct | null;
  currentQuantity: number;
  onAddToCart: (product: CartProduct, quantity: number) => void;
  onUpdateQuantity: (productId: number, newQuantity: number) => void;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  isOpen,
  onClose,
  product,
  currentQuantity,
  onAddToCart,
  onUpdateQuantity,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [imageError, setImageError] = useState(false);

  if (!product) return null;

  const isInCart = currentQuantity > 0;
  // Usar precio_formato_venta para cálculo total
  const totalPrice = product.precio_formato_venta * (isInCart ? currentQuantity : quantity);

  const handleIncrement = () => {
    if (isInCart) {
      onUpdateQuantity(product.id_producto, currentQuantity + 1);
    } else {
      setQuantity(prev => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (isInCart) {
      if (currentQuantity > 1) {
        onUpdateQuantity(product.id_producto, currentQuantity - 1);
      }
    } else {
      setQuantity(prev => Math.max(1, prev - 1));
    }
  };

  const handleAddToCart = () => {
    if (!isInCart) {
      onAddToCart(product, quantity);
      setQuantity(1);
    }
  };

  const handleImageError = () => {
    setImageError(true);
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
            className="fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm"
          />

          {/* Modal - Bottom sheet en móvil, centrado en desktop */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 100 }}
            className="fixed bottom-0 md:bottom-auto left-0 right-0 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:top-[5%]
                     md:w-full md:max-w-4xl h-[92vh] md:h-auto md:max-h-[90vh]
                     bg-white dark:bg-gray-800 rounded-t-3xl md:rounded-2xl shadow-2xl z-[60] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 dark:border-gray-700">
              {/* Indicador drag móvil */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full md:hidden" />

              <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Detalles del Producto</h2>
              <button
                onClick={onClose}
                className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto h-[calc(92vh-70px)] md:h-auto md:max-h-[calc(90vh-120px)]">
              <div className="grid md:grid-cols-2 gap-4 md:gap-6 p-4 md:p-6">
                {/* Imagen */}
                <div className="space-y-4">
                  <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-2xl overflow-hidden flex items-center justify-center">
                    {imageError || !product.imagen_url ? (
                      <Package className="w-32 h-32 text-gray-400" />
                    ) : (
                      <img
                        src={product.imagen_url}
                        alt={product.nombre_producto}
                        className="w-full h-full object-cover"
                        onError={handleImageError}
                      />
                    )}
                  </div>

                  {/* Enlace a Mercadona */}
                  {product.url_enlace && (
                    <a
                      href={product.url_enlace}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors text-gray-700 dark:text-gray-300"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span className="text-sm font-medium">Ver en Mercadona</span>
                    </a>
                  )}
                </div>

                {/* Información */}
                <div className="space-y-6">
                  {/* Nombre */}
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {product.nombre_producto}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <Tag className="w-4 h-4" />
                      <span>{product.nombre_categoria}</span>
                      <span>•</span>
                      <span>{product.nombre_subcategoria}</span>
                    </div>
                  </div>

                  {/* Precio - FORMATO es el principal */}
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-5 border-2 border-blue-200 dark:border-blue-800">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                      Precio del {product.formato_venta}
                    </p>
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {product.precio_formato_venta.toFixed(2)}€
                      </span>
                    </div>
                    <div className="pt-3 border-t border-blue-200 dark:border-blue-800">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {product.formato_venta} • {product.cantidad_unidad_medida} {product.unidad_medida}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Precio unitario: {product.precio_por_unidad.toFixed(2)}€ / {product.unidad_medida}
                      </p>
                    </div>
                  </div>

                  {/* Detalles adicionales */}
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                          Información del producto
                        </h4>
                        <dl className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <dt className="text-gray-600 dark:text-gray-400">Formato de venta:</dt>
                            <dd className="font-medium text-gray-900 dark:text-white">{product.formato_venta}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-gray-600 dark:text-gray-400">Cantidad:</dt>
                            <dd className="font-medium text-gray-900 dark:text-white">
                              {product.cantidad_unidad_medida} {product.unidad_medida}
                            </dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-gray-600 dark:text-gray-400">Categoría:</dt>
                            <dd className="font-medium text-gray-900 dark:text-white">{product.nombre_categoria}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-gray-600 dark:text-gray-400">Subcategoría:</dt>
                            <dd className="font-medium text-gray-900 dark:text-white">{product.nombre_subcategoria}</dd>
                          </div>
                        </dl>
                      </div>
                    </div>
                  </div>

                  {/* Selector de cantidad */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Cantidad
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                        <button
                          onClick={handleDecrement}
                          disabled={isInCart && currentQuantity <= 1}
                          className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Minus className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                        </button>
                        <span className="w-12 text-center text-xl font-semibold text-gray-900 dark:text-white">
                          {isInCart ? currentQuantity : quantity}
                        </span>
                        <button
                          onClick={handleIncrement}
                          className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          <Plus className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                        </button>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-gray-500 dark:text-gray-400">Subtotal</div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {totalPrice.toFixed(2)}€
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Botón de acción */}
                  <div className="pt-4">
                    {isInCart ? (
                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                          <ShoppingCart className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-green-900 dark:text-green-100">
                            Producto en el carrito
                          </div>
                          <div className="text-sm text-green-600 dark:text-green-400">
                            {currentQuantity} {currentQuantity === 1 ? 'unidad' : 'unidades'}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={handleAddToCart}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                      >
                        <ShoppingCart className="w-5 h-5" />
                        <span>Añadir al Carrito</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProductDetailModal;
