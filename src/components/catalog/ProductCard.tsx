import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, ShoppingCart, Info } from 'lucide-react';
import type { CartProduct } from '../../types/cart.types';
import { FavoriteButton } from '../common/FavoriteButton';
import { RecurrentBadge } from '../common/RecurrentBadge';
import { useFavorites } from '../../hooks/useFavorites';
import { useRecurrentProducts } from '../../hooks/useRecurrentProducts';

interface ProductCardProps {
  product: CartProduct;
  quantity: number;
  onAddToCart: (product: CartProduct, quantity: number) => void;
  onIncrement: (productId: number) => void;
  onDecrement: (productId: number) => void;
  onShowDetail: (product: CartProduct) => void;
  showFavorite?: boolean; // Nueva prop opcional para mostrar botón de favorito
  showRecurrent?: boolean; // Nueva prop opcional para mostrar badge de recurrente
}

// Función para obtener gradiente por categoría
const getCategoryGradient = (categoria: string): string => {
  const gradients: Record<string, string> = {
    'Aceite, especias y salsas': 'from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30',
    'Agua y refrescos': 'from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30',
    'Aperitivos': 'from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30',
    'Arroz, legumbres y pasta': 'from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30',
    'Azúcar, caramelos y chocolate': 'from-pink-100 to-rose-100 dark:from-pink-900/30 dark:to-rose-900/30',
    'Bebé': 'from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30',
    'Bodega': 'from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30',
    'Cacao, café e infusiones': 'from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30',
    'Carne': 'from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30',
    'Cereales y galletas': 'from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30',
    'Charcutería y quesos': 'from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30',
    'Congelados': 'from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30',
    'Conservas, caldos y cremas': 'from-green-100 to-lime-100 dark:from-green-900/30 dark:to-lime-900/30',
    'Cuidado del cabello': 'from-teal-100 to-cyan-100 dark:from-teal-900/30 dark:to-cyan-900/30',
    'Cuidado facial y corporal': 'from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30',
    'Droguería y parafarmacia': 'from-teal-100 to-emerald-100 dark:from-teal-900/30 dark:to-emerald-900/30',
    'Frescos': 'from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30',
    'Huevos, leche y mantequilla': 'from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30',
    'Limpieza': 'from-teal-100 to-blue-100 dark:from-teal-900/30 dark:to-blue-900/30',
    'Panadería y pastelería': 'from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30',
    'Pescado': 'from-blue-100 to-teal-100 dark:from-blue-900/30 dark:to-teal-900/30',
    'Platos preparados': 'from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30',
    'Yogures y postres': 'from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30',
  };
  return gradients[categoria] || 'from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600';
};

// Función para obtener emoji por categoría
const getCategoryEmoji = (categoria: string): string => {
  const emojis: Record<string, string> = {
    'Aceite, especias y salsas': '🫒',
    'Agua y refrescos': '💧',
    'Aperitivos': '🍿',
    'Arroz, legumbres y pasta': '🍚',
    'Azúcar, caramelos y chocolate': '🍫',
    'Bebé': '👶',
    'Bodega': '🍷',
    'Cacao, café e infusiones': '☕',
    'Carne': '🥩',
    'Cereales y galletas': '🍪',
    'Charcutería y quesos': '🧀',
    'Congelados': '🧊',
    'Conservas, caldos y cremas': '🥫',
    'Cuidado del cabello': '💆',
    'Cuidado facial y corporal': '🧴',
    'Droguería y parafarmacia': '💊',
    'Frescos': '🥗',
    'Huevos, leche y mantequilla': '🥛',
    'Limpieza': '🧽',
    'Panadería y pastelería': '🍞',
    'Pescado': '🐟',
    'Platos preparados': '🍱',
    'Yogures y postres': '🍮',
  };
  return emojis[categoria] || '📦';
};

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  quantity,
  onAddToCart,
  onIncrement,
  onDecrement,
  onShowDetail,
  showFavorite = true, // Por defecto mostrar el botón de favorito
  showRecurrent = true, // Por defecto mostrar badge de recurrente
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isRecurrent } = useRecurrentProducts();

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const isInCart = quantity > 0;
  const categoryGradient = getCategoryGradient(product.nombre_categoria);
  const categoryEmoji = getCategoryEmoji(product.nombre_categoria);

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
          <div className={`absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br ${categoryGradient}`}>
            <div className="text-7xl mb-2">
              {categoryEmoji}
            </div>
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

        {/* Badges izquierda */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {/* Badge de categoría */}
          <span className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold rounded-full shadow-lg">
            {product.nombre_categoria}
          </span>
          
          {/* Badge de recurrente */}
          {showRecurrent && isRecurrent(product.id_producto) && (
            <RecurrentBadge size="sm" />
          )}
        </div>

        {/* Botones superiores derechos */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          {/* Botón Favorito - Siempre visible */}
          {showFavorite && (
            <FavoriteButton
              isFavorite={isFavorite(product.id_producto)}
              onToggle={() => toggleFavorite(product.id_producto, product.nombre_producto)}
              size="md"
              className="shadow-lg"
            />
          )}

          {/* Botón info - Visible al hover */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onShowDetail(product);
            }}
            className="p-2.5 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
            title="Ver detalles"
          >
            <Info className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
        </div>

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

        {/* Precio - FORMATO es el principal */}
        <div className="mb-4">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {product.precio_formato_venta.toFixed(2)}€
            </span>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            ({product.precio_por_unidad.toFixed(2)}€ / {product.unidad_medida})
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
