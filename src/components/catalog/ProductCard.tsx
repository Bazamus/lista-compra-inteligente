import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, ShoppingCart, Info, Package } from 'lucide-react';
import type { CartProduct } from '../../types/cart.types';

interface ProductCardProps {
  product: CartProduct;
  quantity: number;
  onAddToCart: (product: CartProduct, quantity: number) => void;
  onIncrement: (productId: number) => void;
  onDecrement: (productId: number) => void;
  onShowDetail: (product: CartProduct) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  quantity,
  onAddToCart,
  onIncrement,
  onDecrement,
  onShowDetail,
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const isInCart = quantity > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group border border-gray-100 dark:border-gray-700"
    >
      {/* Imagen del producto - Aspect Ratio 1:1 */}
      <div
        className="relative aspect-square bg-gray-50 dark:bg-gray-700 cursor-pointer overflow-hidden"
        onClick={() => onShowDetail(product)}
      >
        {imageLoading && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-3 border-blue-500 border-t-transparent"></div>
          </div>
        )}

        {imageError || !product.imagen_url ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600">
            <Package className="w-20 h-20 text-gray-300 dark:text-gray-500" />
          </div>
        ) : (
          <img
            src={product.imagen_url}
            alt={product.nombre_producto}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={handleImageError}
            onLoad={handleImageLoad}
            loading="lazy"
          />
        )}

        {/* Overlay oscuro al hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>

        {/* Badge de categoría */}
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold rounded-full shadow-lg">
            {product.nombre_categoria}
          </span>
        </div>

        {/* Botón info - Más grande */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onShowDetail(product);
          }}
          className="absolute top-3 right-3 p-2.5 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
          title="Ver detalles"
        >
          <Info className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>

        {/* Indicador de producto en carrito */}
        {isInCart && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-bold rounded-full shadow-lg">
            <ShoppingCart className="w-4 h-4" />
            <span>{quantity}</span>
          </div>
        )}
      </div>

      {/* Información del producto */}
      <div className="p-5">
        <h3
          className="text-base font-bold text-gray-900 dark:text-white line-clamp-2 min-h-[3rem] cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-2"
          onClick={() => onShowDetail(product)}
        >
          {product.nombre_producto}
        </h3>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          {product.formato_venta} • {product.cantidad_unidad_medida} {product.unidad_medida}
        </p>

        {/* Precio */}
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {product.precio_por_unidad.toFixed(2)}€
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            / {product.unidad_medida}
          </span>
        </div>

        {/* Botones de acción - MÁS GRANDES */}
        {!isInCart ? (
          <button
            onClick={() => onAddToCart(product, 1)}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <ShoppingCart className="w-5 h-5" />
            <span>Añadir al carrito</span>
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={() => onDecrement(product.id_producto)}
              className="flex-1 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white font-bold py-3.5 px-4 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <Minus className="w-5 h-5" />
            </button>
            <div className="flex items-center justify-center min-w-[3rem] h-12 bg-gray-100 dark:bg-gray-700 rounded-xl">
              <span className="text-xl font-bold text-gray-900 dark:text-white">{quantity}</span>
            </div>
            <button
              onClick={() => onIncrement(product.id_producto)}
              className="flex-1 flex items-center justify-center bg-green-500 hover:bg-green-600 text-white font-bold py-3.5 px-4 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ProductCard;
