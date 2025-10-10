import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Plus, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { productosApi, categoriasApi, type Categoria, type Subcategoria } from '../../lib/api';
import ProductDetailModal from '../catalog/ProductDetailModal';
import type { CartProduct } from '../../types/cart.types';

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

interface Producto {
  id_producto: number;
  nombre_producto: string;
  formato_venta: string;
  precio_formato_venta: number;
  unidad_medida: string;
  precio_por_unidad: number;
  cantidad_unidad_medida: number;
  imagen_url?: string;
  url_enlace?: string;
  subcategorias: {
    nombre_subcategoria: string;
    categorias: {
      nombre_categoria: string;
    };
  };
}

interface ProductSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (producto: Producto, cantidad: number) => void;
  existingProductIds: Set<number>;
}

const ProductSearchModal: React.FC<ProductSearchModalProps> = ({
  isOpen,
  onClose,
  onAddProduct,
  existingProductIds
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filtros, setFiltros] = useState({
    categoria: '',
    subcategoria: '',
    precio_min: '',
    precio_max: ''
  });
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
  const [cantidades, setCantidades] = useState<Record<number, number>>({});
  const [selectedProduct, setSelectedProduct] = useState<CartProduct | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Cargar categorías al abrir el modal
  useEffect(() => {
    if (isOpen) {
      cargarCategorias();
    }
  }, [isOpen]);

  // Cargar subcategorías cuando cambie la categoría
  useEffect(() => {
    if (filtros.categoria) {
      const categoriaSeleccionada = categorias.find(c => c.nombre_categoria === filtros.categoria);
      setSubcategorias(categoriaSeleccionada?.subcategorias || []);
      // Resetear subcategoría seleccionada si no existe en la nueva lista
      if (filtros.subcategoria) {
        const subcategoriaExiste = categoriaSeleccionada?.subcategorias?.some(
          s => s.nombre_subcategoria === filtros.subcategoria
        );
        if (!subcategoriaExiste) {
          setFiltros(prev => ({ ...prev, subcategoria: '' }));
        }
      }
    } else {
      setSubcategorias([]);
      setFiltros(prev => ({ ...prev, subcategoria: '' }));
    }
  }, [filtros.categoria, categorias]);

  // Buscar productos cuando cambie el término de búsqueda o filtros
  // Permitir búsqueda con solo categoría (sin necesidad de texto)
  useEffect(() => {
    if (isOpen && (searchTerm.length >= 2 || filtros.categoria)) {
      buscarProductos();
    } else if (isOpen && searchTerm.length === 0 && !filtros.categoria) {
      setProductos([]);
    }
  }, [searchTerm, filtros, isOpen]);

  // Auto-colapsar filtros en móvil cuando hay resultados
  useEffect(() => {
    if (productos.length > 0 && window.innerWidth < 768) {
      setShowFilters(false);
    }
  }, [productos]);

  const cargarCategorias = async () => {
    try {
      const response = await categoriasApi.obtenerTodas();
      setCategorias(response.categorias);
    } catch (error) {
      console.error('Error cargando categorías:', error);
    }
  };

  const buscarProductos = async () => {
    setLoading(true);
    try {
      const response = await productosApi.obtener({
        search: searchTerm || undefined,
        categoria: filtros.categoria || undefined,
        subcategoria: filtros.subcategoria || undefined,
        precio_min: filtros.precio_min ? parseFloat(filtros.precio_min) : undefined,
        precio_max: filtros.precio_max ? parseFloat(filtros.precio_max) : undefined,
        limit: 50
      });
      setProductos(response.productos);
    } catch (error) {
      console.error('Error buscando productos:', error);
      setProductos([]);
    } finally {
      setLoading(false);
    }
  };

  // Convertir Producto a CartProduct
  const convertToCartProduct = (producto: Producto): CartProduct => {
    return {
      id_producto: producto.id_producto,
      nombre_producto: producto.nombre_producto,
      precio_por_unidad: producto.precio_por_unidad,
      unidad_medida: producto.unidad_medida,
      cantidad_unidad_medida: producto.cantidad_unidad_medida,
      formato_venta: producto.formato_venta,
      precio_formato_venta: producto.precio_formato_venta,
      imagen_url: producto.imagen_url,
      url_enlace: producto.url_enlace,
      nombre_categoria: producto.subcategorias.categorias.nombre_categoria,
      nombre_subcategoria: producto.subcategorias.nombre_subcategoria,
    };
  };

  const handleProductClick = (producto: Producto) => {
    const cartProduct = convertToCartProduct(producto);
    setSelectedProduct(cartProduct);
    setShowDetailModal(true);
  };

  const handleAddFromDetailModal = (product: CartProduct, quantity: number) => {
    // Convertir de vuelta a Producto para mantener compatibilidad con onAddProduct
    const productoOriginal = productos.find(p => p.id_producto === product.id_producto);
    if (productoOriginal) {
      onAddProduct(productoOriginal, quantity);
      setShowDetailModal(false);
      setSelectedProduct(null);
    }
  };

  const handleAddProduct = (producto: Producto) => {
    const cantidad = cantidades[producto.id_producto] || 1;
    onAddProduct(producto, cantidad);
    setCantidades(prev => ({ ...prev, [producto.id_producto]: 1 }));
  };

  const updateCantidad = (productId: number, cantidad: number) => {
    setCantidades(prev => ({ ...prev, [productId]: Math.max(1, cantidad) }));
  };

  const resetFiltros = () => {
    setFiltros({
      categoria: '',
      subcategoria: '',
      precio_min: '',
      precio_max: ''
    });
    setSubcategorias([]);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 z-50 flex items-end md:items-center justify-center md:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: "100%" }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="bg-white dark:bg-gray-800 rounded-t-3xl md:rounded-2xl shadow-2xl
                   w-full max-w-full md:max-w-4xl h-[94vh] md:h-auto md:max-h-[90vh]
                   flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 dark:border-gray-700 relative">
            {/* Indicador móvil drag */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full md:hidden" />

            <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white truncate pr-2">
              Buscar Productos
            </h2>
            <button
              onClick={onClose}
              className="flex-shrink-0 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 md:w-6 md:h-6 text-gray-500" />
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex-shrink-0 p-4 md:p-6 border-b border-gray-200 dark:border-gray-700">
            {/* Search Bar */}
            <div className="relative mb-3 md:mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 md:pl-10 pr-4 py-2.5 md:py-3 text-sm md:text-base
                         border border-gray-300 dark:border-gray-600 rounded-xl
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <Filter className="w-4 h-4" />
              Filtros avanzados
              {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {/* Filters Panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  <div className="min-w-0">
                    <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Categoría
                    </label>
                    <select
                      value={filtros.categoria}
                      onChange={(e) => setFiltros(prev => ({ ...prev, categoria: e.target.value }))}
                      className="w-full px-2 md:px-3 py-2 text-sm md:text-base border border-gray-300 dark:border-gray-600 rounded-lg
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Todas las categorías</option>
                      {categorias.map(cat => (
                        <option key={cat.id_categoria} value={cat.nombre_categoria}>
                          {getCategoryEmoji(cat.nombre_categoria)} {cat.nombre_categoria}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="min-w-0">
                    <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Subcategoría
                    </label>
                    <select
                      value={filtros.subcategoria}
                      onChange={(e) => setFiltros(prev => ({ ...prev, subcategoria: e.target.value }))}
                      disabled={!filtros.categoria}
                      className="w-full px-2 md:px-3 py-2 text-sm md:text-base border border-gray-300 dark:border-gray-600 rounded-lg
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">Todas las subcategorías</option>
                      {subcategorias.map(sub => (
                        <option key={sub.id_subcategoria} value={sub.nombre_subcategoria}>
                          {sub.nombre_subcategoria}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="min-w-0">
                    <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Precio mínimo (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={filtros.precio_min}
                      onChange={(e) => setFiltros(prev => ({ ...prev, precio_min: e.target.value }))}
                      className="w-full px-2 md:px-3 py-2 text-sm md:text-base border border-gray-300 dark:border-gray-600 rounded-lg
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="min-w-0">
                    <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Precio máximo (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="100.00"
                      value={filtros.precio_max}
                      onChange={(e) => setFiltros(prev => ({ ...prev, precio_max: e.target.value }))}
                      className="w-full px-2 md:px-3 py-2 text-sm md:text-base border border-gray-300 dark:border-gray-600 rounded-lg
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Reset Filters */}
            {(filtros.categoria || filtros.subcategoria || filtros.precio_min || filtros.precio_max) && (
              <button
                onClick={resetFiltros}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Limpiar filtros
              </button>
            )}
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-2 text-gray-600 dark:text-gray-400">Buscando...</span>
              </div>
            ) : productos.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                {searchTerm.length < 2 && !filtros.categoria
                  ? 'Escribe al menos 2 caracteres o selecciona una categoría para buscar'
                  : 'No se encontraron productos'
                }
              </div>
            ) : (
              <div className="space-y-3">
                {productos.map((producto) => {
                  const yaExiste = existingProductIds.has(producto.id_producto);
                  const categoryGradient = getCategoryGradient(producto.subcategorias.categorias.nombre_categoria);
                  const categoryEmoji = getCategoryEmoji(producto.subcategorias.categorias.nombre_categoria);

                  return (
                    <motion.div
                      key={producto.id_producto}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4 p-3 border border-gray-200 dark:border-gray-700
                               rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 w-full md:w-auto md:flex-1">
                        {/* Imagen en miniatura - CLICKEABLE */}
                        <div
                          onClick={() => handleProductClick(producto)}
                          className={`flex-shrink-0 w-16 h-16 md:w-16 md:h-16 rounded-lg overflow-hidden bg-gradient-to-br ${categoryGradient} flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity`}
                        >
                          {producto.imagen_url ? (
                            <img
                              src={producto.imagen_url}
                              alt={producto.nombre_producto}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                // Si falla la imagen, mostrar emoji
                                e.currentTarget.style.display = 'none';
                                if (e.currentTarget.nextSibling) {
                                  (e.currentTarget.nextSibling as HTMLElement).style.display = 'flex';
                                }
                              }}
                            />
                          ) : null}
                          <div className={`text-3xl ${producto.imagen_url ? 'hidden' : 'flex'} items-center justify-center w-full h-full`}>
                            {categoryEmoji}
                          </div>
                        </div>

                        {/* Información del producto - CLICKEABLE */}
                        <div
                          onClick={() => handleProductClick(producto)}
                          className="flex-1 min-w-0 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          <h3 className="font-medium text-sm md:text-base text-gray-900 dark:text-white line-clamp-2 md:truncate">
                            {producto.nombre_producto}
                          </h3>
                          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 truncate">
                            {producto.formato_venta}
                          </p>
                          <p className="text-sm md:text-sm font-medium text-green-600 dark:text-green-400 mt-1">
                            {producto.precio_formato_venta.toFixed(2)}€
                          </p>
                        </div>
                      </div>

                      {/* Acciones */}
                      <div className="flex items-center gap-2 w-full md:w-auto md:flex-shrink-0">
                        {!yaExiste && (
                          <div className="flex items-center gap-2 w-full md:w-auto">
                            <input
                              type="number"
                              min="1"
                              value={cantidades[producto.id_producto] || 1}
                              onChange={(e) => updateCantidad(producto.id_producto, parseInt(e.target.value) || 1)}
                              onClick={(e) => e.stopPropagation()}
                              className="w-14 md:w-16 px-2 py-1.5 md:py-1 text-center border border-gray-300 dark:border-gray-600 rounded
                                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddProduct(producto);
                              }}
                              className="flex items-center justify-center gap-1 flex-1 md:flex-initial px-3 md:px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white
                                       rounded-lg transition-colors text-sm whitespace-nowrap"
                            >
                              <Plus className="w-4 h-4" />
                              <span className="hidden sm:inline">Añadir</span>
                              <span className="sm:hidden">+</span>
                            </button>
                          </div>
                        )}
                        {yaExiste && (
                          <span className="w-full md:w-auto text-center px-3 py-2 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300
                                         rounded-lg text-xs md:text-sm">
                            Ya en la lista
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Modal de detalles del producto */}
      <ProductDetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        currentQuantity={0}
        onAddToCart={handleAddFromDetailModal}
        onUpdateQuantity={() => {}}
      />
    </AnimatePresence>
  );
};

export default ProductSearchModal;
