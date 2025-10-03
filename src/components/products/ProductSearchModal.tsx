import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Plus, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { productosApi, categoriasApi } from '../../lib/api';

interface Producto {
  id_producto: number;
  nombre_producto: string;
  formato_venta: string;
  precio_formato_venta: number;
  unidad_medida: string;
  precio_por_unidad: number;
  cantidad_unidad_medida: number;
  subcategorias: {
    nombre_subcategoria: string;
    categorias: {
      nombre_categoria: string;
    };
  };
}

interface Categoria {
  id_categoria: number;
  nombre_categoria: string;
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
    precio_min: '',
    precio_max: ''
  });
  const [cantidades, setCantidades] = useState<Record<number, number>>({});

  // Cargar categorías al abrir el modal
  useEffect(() => {
    if (isOpen) {
      cargarCategorias();
    }
  }, [isOpen]);

  // Buscar productos cuando cambie el término de búsqueda o filtros
  useEffect(() => {
    if (isOpen && searchTerm.length >= 2) {
      buscarProductos();
    } else if (isOpen && searchTerm.length === 0) {
      setProductos([]);
    }
  }, [searchTerm, filtros, isOpen]);

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
        search: searchTerm,
        categoria: filtros.categoria || undefined,
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
      precio_min: '',
      precio_max: ''
    });
  };

  if (!isOpen) return null;

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
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Buscar Productos
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {/* Search and Filters */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            {/* Search Bar */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl
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
                  className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Categoría
                    </label>
                    <select
                      value={filtros.categoria}
                      onChange={(e) => setFiltros(prev => ({ ...prev, categoria: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Todas las categorías</option>
                      {categorias.map(cat => (
                        <option key={cat.id_categoria} value={cat.nombre_categoria}>
                          {cat.nombre_categoria}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Precio mínimo (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={filtros.precio_min}
                      onChange={(e) => setFiltros(prev => ({ ...prev, precio_min: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Precio máximo (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="100.00"
                      value={filtros.precio_max}
                      onChange={(e) => setFiltros(prev => ({ ...prev, precio_max: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Reset Filters */}
            {(filtros.categoria || filtros.precio_min || filtros.precio_max) && (
              <button
                onClick={resetFiltros}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Limpiar filtros
              </button>
            )}
          </div>

          {/* Results */}
          <div className="p-6 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-2 text-gray-600 dark:text-gray-400">Buscando...</span>
              </div>
            ) : productos.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                {searchTerm.length < 2 
                  ? 'Escribe al menos 2 caracteres para buscar'
                  : 'No se encontraron productos'
                }
              </div>
            ) : (
              <div className="space-y-3">
                {productos.map((producto) => {
                  const yaExiste = existingProductIds.has(producto.id_producto);
                  return (
                    <motion.div
                      key={producto.id_producto}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700
                               rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {producto.nombre_producto}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {producto.subcategorias.categorias.nombre_categoria} • {producto.formato_venta}
                        </p>
                        <p className="text-sm font-medium text-green-600 dark:text-green-400">
                          {producto.precio_formato_venta.toFixed(2)}€
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        {!yaExiste && (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="1"
                              value={cantidades[producto.id_producto] || 1}
                              onChange={(e) => updateCantidad(producto.id_producto, parseInt(e.target.value) || 1)}
                              className="w-16 px-2 py-1 text-center border border-gray-300 dark:border-gray-600 rounded
                                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                            <button
                              onClick={() => handleAddProduct(producto)}
                              className="flex items-center gap-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white
                                       rounded-lg transition-colors text-sm"
                            >
                              <Plus className="w-4 h-4" />
                              Añadir
                            </button>
                          </div>
                        )}
                        {yaExiste && (
                          <span className="px-3 py-2 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300
                                         rounded-lg text-sm">
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
    </AnimatePresence>
  );
};

export default ProductSearchModal;
