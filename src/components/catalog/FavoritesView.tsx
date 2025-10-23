import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Package, ShoppingBag } from 'lucide-react';
import { useFavorites } from '../../hooks/useFavorites';
import { useCart } from '../../hooks/useCart';
import ProductCard from './ProductCard';
import { productosApi } from '../../lib/api';
import type { CartProduct } from '../../types/cart.types';
import { toast } from 'sonner';

export const FavoritesView = () => {
  const { getFavoriteIds, isLoading: loadingFavorites } = useFavorites();
  const { addProduct, getProductQuantity, incrementQuantity, decrementQuantity } = useCart();
  const [favoriteProducts, setFavoriteProducts] = useState<CartProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar productos favoritos
  useEffect(() => {
    loadFavoriteProducts();
  }, [getFavoriteIds()]);

  const loadFavoriteProducts = async () => {
    try {
      setLoading(true);
      const favoriteIds = getFavoriteIds();

      if (favoriteIds.length === 0) {
        setFavoriteProducts([]);
        setLoading(false);
        return;
      }

      // Cargar detalles de productos favoritos
      // Como la API no tiene endpoint para buscar por IDs múltiples,
      // vamos a cargar todos los productos y filtrar
      // (En producción, sería mejor tener un endpoint específico)
      const { productos } = await productosApi.obtener({
        limit: 1000 // Cargar muchos para asegurar que tenemos todos
      });

      const favProducts = productos.filter((p: any) => favoriteIds.includes(p.id_producto));
      
      // Transformar a formato CartProduct
      const transformedProducts: CartProduct[] = favProducts.map((p: any) => ({
        id_producto: p.id_producto,
        nombre_producto: p.nombre_producto,
        formato_venta: p.formato_venta,
        precio_formato_venta: p.precio_formato_venta,
        unidad_medida: p.unidad_medida,
        precio_por_unidad: p.precio_por_unidad,
        cantidad_unidad_medida: p.cantidad_unidad_medida,
        url_enlace: p.url_enlace,
        imagen_url: p.imagen_url,
        nombre_categoria: p.subcategorias?.categorias?.nombre_categoria || 'Sin categoría',
        nombre_subcategoria: p.subcategorias?.nombre_subcategoria || 'Sin subcategoría',
      }));
      
      setFavoriteProducts(transformedProducts);
    } catch (error) {
      console.error('Error loading favorite products:', error);
      toast.error('Error al cargar favoritos');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product: CartProduct, quantity: number) => {
    addProduct(product, quantity);
    toast.success(`${product.nombre_producto} añadido a la lista`, {
      icon: '🛒'
    });
  };

  const handleAddAllToCart = () => {
    let addedCount = 0;
    favoriteProducts.forEach(product => {
      const quantity = getProductQuantity(product.id_producto);
      if (quantity === 0) {
        addProduct(product, 1);
        addedCount++;
      }
    });
    if (addedCount > 0) {
      toast.success(`${addedCount} productos añadidos a la lista`, {
        icon: '🛒'
      });
    } else {
      toast.info('Todos los favoritos ya están en tu lista', {
        icon: 'ℹ️'
      });
    }
  };

  const handleShowDetail = (product: CartProduct) => {
    // Podríamos abrir un modal aquí en el futuro
    console.log('Detalle de producto:', product);
  };

  if (loadingFavorites || loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando favoritos...</p>
        </div>
      </div>
    );
  }

  if (favoriteProducts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        <div className="inline-flex items-center justify-center w-24 h-24 bg-yellow-100 dark:bg-yellow-900/20 rounded-full mb-6">
          <Star className="w-12 h-12 text-yellow-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          No tienes favoritos aún
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
          Marca productos como favoritos para acceder a ellos rápidamente. 
          Haz clic en la estrella ⭐ de cualquier producto para añadirlo a favoritos.
        </p>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Package className="w-5 h-5" />
          <span>Los productos favoritos aparecerán aquí</span>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Star className="w-7 h-7 text-yellow-500 fill-yellow-500" />
            Mis Favoritos
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {favoriteProducts.length} {favoriteProducts.length === 1 ? 'producto favorito' : 'productos favoritos'}
          </p>
        </div>
        
        <button
          onClick={handleAddAllToCart}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="hidden sm:inline">Añadir todos a la lista</span>
          <span className="sm:hidden">Añadir todos</span>
        </button>
      </div>

      {/* Grid de productos favoritos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        <AnimatePresence mode="popLayout">
          {favoriteProducts.map((product) => (
            <motion.div
              key={product.id_producto}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <ProductCard
                product={product}
                quantity={getProductQuantity(product.id_producto)}
                onAddToCart={handleAddToCart}
                onIncrement={(id) => incrementQuantity(id)}
                onDecrement={(id) => decrementQuantity(id)}
                onShowDetail={handleShowDetail}
                showFavorite={true}
                showRecurrent={false}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Info adicional */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mt-6">
        <div className="flex items-start gap-3">
          <Star className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-yellow-900 dark:text-yellow-100 mb-1">
              Tip: Acceso Rápido
            </h3>
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Tus productos favoritos estarán siempre disponibles aquí. 
              Perfecto para productos que compras regularmente como leche, pan, o tus marcas preferidas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

