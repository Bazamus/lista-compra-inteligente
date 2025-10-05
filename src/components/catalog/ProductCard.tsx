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
      className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
    >
      {/* Imagen del producto */}
      <div
        className="relative h-48 bg-gray-100 dark:bg-gray-700 cursor-pointer overflow-hidden"
        onClick={() => onShowDetail(product)}
      >
        {imageLoading && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}

        {imageError || !product.imagen_url ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-600">
            <Package className="w-16 h-16 text-gray-400 dark:text-gray-500" />
          </div>
        ) : (
          <img
            src={product.imagen_url}
            alt={product.nombre_producto}
            className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-300"
            onError={handleImageError}
            onLoad={handleImageLoad}
            loading="lazy"
          />
        )}

        {/* Badge de categoría */}
        <div className="absolute top-2 left-2">
          <span className="px-2 py-1 bg-blue-500 text-white text-xs font-semibold rounded-full">
            {product.nombre_categoria}
          </span>
        </div>

        {/* Botón info */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onShowDetail(product);
          }}
          className="absolute top-2 right-2 p-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors opacity-0 group-hover:opacity-100"
          title="Ver detalles"
        >
          <Info className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        </button>

        {/* Indicador de producto en carrito */}
        {isInCart && (
          <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
            <ShoppingCart className="w-3 h-3" />
            <span>{quantity}</span>
          </div>
        )}
      </div>

      {/* Información del producto */}
      <div className="p-4">
        <h3
          className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 min-h-[2.5rem] cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
          onClick={() => onShowDetail(product)}
          title={product.nombre_producto}
        >
          {product.nombre_producto}
        </h3>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {product.formato_venta} - {product.cantidad_unidad_medida} {product.unidad_medida}
        </p>

        {/* Precio */}
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            {product.precio_por_unidad.toFixed(2)}€
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            / {product.unidad_medida}
          </span>
        </div>

        {/* Botones de acción */}
        <div className="mt-4">
          {!isInCart ? (
            <button
              onClick={() => onAddToCart(product, 1)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Añadir</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onDecrement(product.id_producto)}
                className="flex-1 flex items-center justify-center px-3 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-bold rounded-lg min-w-[3rem]">
                {quantity}
              </div>

              <button
                onClick={() => onIncrement(product.id_producto)}
                className="flex-1 flex items-center justify-center px-3 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
