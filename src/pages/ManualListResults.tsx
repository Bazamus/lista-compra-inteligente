import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart, Package, Euro, CheckCircle, Circle, Download,
  Home, ChevronDown, ChevronUp, Plus, Edit3, Trash2, Save, Check, ShoppingBag
} from 'lucide-react';
import ProductSearchModal from '../components/products/ProductSearchModal';
import ProductEditModal from '../components/products/ProductEditModal';
import { useListHistory } from '../hooks/useListHistory';
import { exportToPDF } from '../utils/exportPDF';
import { exportToExcel } from '../utils/exportExcel';
import type { Cart, CartItem } from '../types/cart.types';

interface LocationState {
  listName: string;
  cart: Cart;
}

const ManualListResults: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;

  // Si no hay datos, redirigir al catálogo
  useEffect(() => {
    if (!state || !state.cart || state.cart.items.length === 0) {
      navigate('/catalog');
    }
  }, [state, navigate]);

  if (!state || !state.cart) {
    return null;
  }

  const { listName, cart } = state;
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [checkedProducts, setCheckedProducts] = useState<Set<number>>(new Set());
  const [productosLista, setProductosLista] = useState(cart.items);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [productoEditando, setProductoEditando] = useState<any>(null);
  const [listaSaved, setListaSaved] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const { saveList } = useListHistory();

  // Calcular totales actualizados - Usar precio_formato_venta
  const presupuestoTotal = productosLista.reduce(
    (sum, item) => sum + item.product.precio_formato_venta * item.quantity,
    0
  );

  const totalProductos = productosLista.reduce((sum, item) => sum + item.quantity, 0);

  // Agrupar productos por categoría
  const productosPorCategoria = productosLista.reduce((acc, item) => {
    const categoria = item.product.nombre_categoria;
    if (!acc[categoria]) {
      acc[categoria] = [];
    }
    acc[categoria].push(item);
    return acc;
  }, {} as Record<string, CartItem[]>);

  const categorias = Object.keys(productosPorCategoria).sort();

  // Guardar lista automáticamente al cargar la página
  useEffect(() => {
    try {
      // Adaptar formato Cart a formato SavedList
      const resultadoParaGuardar = {
        lista: {
          nombre: listName,
          fecha: new Date().toISOString(),
          presupuesto: presupuestoTotal,
          dias: 7, // Default
          personas: 1, // Default
        },
        productos: productosLista.map(item => ({
          id_producto: item.product.id_producto,
          nombre: item.product.nombre_producto,
          cantidad: item.quantity,
          precio_unitario: item.product.precio_formato_venta, // Precio del formato de venta
          categoria: item.product.nombre_categoria,
          esencial: false,
        })),
        menus: {}, // Lista manual no tiene menús
        presupuesto_estimado: presupuestoTotal,
        recomendaciones: [],
        tipo: 'Manual' as const,
      };

      saveList(resultadoParaGuardar);
      setListaSaved(true);
      setTimeout(() => setListaSaved(false), 3000);
    } catch (error) {
      console.error('Error al guardar lista automáticamente:', error);
    }
  }, []);

  // Cerrar menú de exportación al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showExportMenu && !target.closest('.export-menu-container')) {
        setShowExportMenu(false);
      }
    };

    if (showExportMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showExportMenu]);

  const toggleCategory = (categoria: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoria)) {
        newSet.delete(categoria);
      } else {
        newSet.add(categoria);
      }
      return newSet;
    });
  };

  const toggleProductCheck = (idProducto: number) => {
    setCheckedProducts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(idProducto)) {
        newSet.delete(idProducto);
      } else {
        newSet.add(idProducto);
      }
      return newSet;
    });
  };

  const handleSaveList = () => {
    try {
      const resultadoActualizado = {
        lista: {
          nombre: listName,
          fecha: new Date().toISOString(),
          presupuesto: presupuestoTotal,
          dias: 7,
          personas: 1,
        },
        productos: productosLista.map(item => ({
          id_producto: item.product.id_producto,
          nombre: item.product.nombre_producto,
          cantidad: item.quantity,
          precio_unitario: item.product.precio_formato_venta, // Precio del formato de venta
          categoria: item.product.nombre_categoria,
          esencial: false,
        })),
        menus: {},
        presupuesto_estimado: presupuestoTotal,
        recomendaciones: [],
        tipo: 'Manual' as const,
      };

      saveList(resultadoActualizado);
      setListaSaved(true);
      setTimeout(() => setListaSaved(false), 3000);
    } catch (error) {
      console.error('Error al guardar lista:', error);
      alert('No se pudo guardar la lista');
    }
  };

  const handleExportPDF = () => {
    try {
      const datosExportar = {
        lista: {
          nombre_lista: listName,
          num_personas: 1,
          dias_duracion: 7,
          presupuesto_total: presupuestoTotal,
        },
        productos: productosLista.map(item => ({
          id_producto: item.product.id_producto,
          nombre: item.product.nombre_producto,
          cantidad: item.quantity,
          precio_unitario: item.product.precio_formato_venta, // Precio del formato de venta
          categoria: item.product.nombre_categoria,
          esencial: false,
        })),
        menus: {},
        presupuesto_estimado: presupuestoTotal,
        recomendaciones: [`Lista de compra manual creada con ${totalProductos} productos`],
      };
      exportToPDF(datosExportar);
      setShowExportMenu(false);
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      alert('Error al exportar PDF');
    }
  };

  const handleExportExcel = () => {
    try {
      const datosExportar = {
        lista: {
          nombre_lista: listName,
          num_personas: 1,
          dias_duracion: 7,
          presupuesto_total: presupuestoTotal,
        },
        productos: productosLista.map(item => ({
          id_producto: item.product.id_producto,
          nombre: item.product.nombre_producto,
          cantidad: item.quantity,
          precio_unitario: item.product.precio_formato_venta, // Precio del formato de venta
          categoria: item.product.nombre_categoria,
          esencial: false,
        })),
        menus: {},
        presupuesto_estimado: presupuestoTotal,
        recomendaciones: [],
      };
      exportToExcel(datosExportar);
      setShowExportMenu(false);
    } catch (error) {
      console.error('Error al exportar Excel:', error);
      alert('Error al exportar Excel');
    }
  };

  const handleAddProduct = (producto: any) => {
    const nuevoItem: CartItem = {
      product: {
        id_producto: producto.id_producto,
        nombre_producto: producto.nombre_producto,
        precio_por_unidad: producto.precio_por_unidad,
        unidad_medida: producto.unidad_medida || 'ud',
        cantidad_unidad_medida: producto.cantidad_unidad_medida || 1,
        formato_venta: producto.formato_venta || 'Unidad',
        precio_formato_venta: producto.precio_formato_venta || producto.precio_por_unidad,
        imagen_url: producto.imagen_url,
        url_enlace: producto.url_enlace,
        nombre_categoria: producto.subcategorias?.categorias?.nombre_categoria || 'Sin categoría',
        nombre_subcategoria: producto.subcategorias?.nombre_subcategoria || 'Sin subcategoría',
      },
      quantity: 1,
    };

    setProductosLista(prev => [...prev, nuevoItem]);
    setShowSearchModal(false);
  };

  const handleEditProduct = (item: CartItem) => {
    setProductoEditando({
      id_producto: item.product.id_producto,
      nombre: item.product.nombre_producto,
      cantidad: item.quantity,
      precio_unitario: item.product.precio_formato_venta, // Editar precio del formato
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = (cantidad: number, precioUnitario: number) => {
    if (productoEditando) {
      setProductosLista(prev =>
        prev.map(item =>
          item.product.id_producto === productoEditando.id_producto
            ? {
                ...item,
                quantity: cantidad,
                product: {
                  ...item.product,
                  precio_formato_venta: precioUnitario, // Actualizar precio del formato
                },
              }
            : item
        )
      );
      setShowEditModal(false);
      setProductoEditando(null);
    }
  };

  const handleRemoveProduct = (idProducto: number) => {
    setProductosLista(prev => prev.filter(item => item.product.id_producto !== idProducto));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                <ShoppingBag className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">{listName}</h1>
                <p className="text-gray-600 dark:text-gray-400">Lista de compra manual</p>
              </div>
            </div>

            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <Home className="w-5 h-5" />
              <span className="hidden md:inline">Volver al inicio</span>
            </button>
          </div>
        </motion.div>

        {/* Estadísticas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid md:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Productos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalProductos}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Categorías</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{categorias.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <Euro className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Presupuesto Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{presupuestoTotal.toFixed(2)}€</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Botones de acción */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-3 mb-8"
        >
          <button
            onClick={handleSaveList}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-lg hover:shadow-xl"
          >
            {listaSaved ? <Check className="w-5 h-5" /> : <Save className="w-5 h-5" />}
            <span>{listaSaved ? 'Lista guardada' : 'Guardar lista'}</span>
          </button>

          <button
            onClick={() => setShowSearchModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            <span>Añadir producto</span>
          </button>

          <div className="export-menu-container relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors shadow-lg hover:shadow-xl"
            >
              <Download className="w-5 h-5" />
              <span>Exportar</span>
            </button>

            <AnimatePresence>
              {showExportMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full mt-2 right-0 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-10 min-w-[200px]"
                >
                  <button
                    onClick={handleExportPDF}
                    className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-3"
                  >
                    <Download className="w-4 h-4" />
                    <span>Exportar a PDF</span>
                  </button>
                  <button
                    onClick={handleExportExcel}
                    className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-3"
                  >
                    <Download className="w-4 h-4" />
                    <span>Exportar a Excel</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Lista de productos por categoría */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          {categorias.map((categoria) => {
            const productosCategoria = productosPorCategoria[categoria];
            const totalCategoria = productosCategoria.reduce(
              (sum, item) => sum + item.product.precio_formato_venta * item.quantity,
              0
            );
            const isExpanded = expandedCategories.has(categoria);

            return (
              <div key={categoria} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
                <button
                  onClick={() => toggleCategory(categoria)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{categoria}</h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      ({productosCategoria.length} {productosCategoria.length === 1 ? 'producto' : 'productos'})
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {totalCategoria.toFixed(2)}€
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-gray-200 dark:border-gray-700"
                    >
                      <div className="p-4 space-y-2">
                        {productosCategoria.map((item) => {
                          const isChecked = checkedProducts.has(item.product.id_producto);
                          return (
                            <div
                              key={item.product.id_producto}
                              className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                              <button
                                onClick={() => toggleProductCheck(item.product.id_producto)}
                                className="flex-shrink-0"
                              >
                                {isChecked ? (
                                  <CheckCircle className="w-6 h-6 text-green-600" />
                                ) : (
                                  <Circle className="w-6 h-6 text-gray-400" />
                                )}
                              </button>

                              <div className="flex-1 min-w-0">
                                <p className={`font-medium ${isChecked ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                                  {item.product.nombre_producto}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {item.quantity} × {item.product.precio_formato_venta.toFixed(2)}€ ({item.product.formato_venta}) = {(item.product.precio_formato_venta * item.quantity).toFixed(2)}€
                                </p>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleEditProduct(item)}
                                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                                >
                                  <Edit3 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                </button>
                                <button
                                  onClick={() => handleRemoveProduct(item.product.id_producto)}
                                  className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </motion.div>
      </div>

      {/* Modals */}
      <ProductSearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onAddProduct={(producto) => {
          handleAddProduct(producto);
        }}
        existingProductIds={new Set(productosLista.map(item => item.product.id_producto))}
      />

      {productoEditando && (
        <ProductEditModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setProductoEditando(null);
          }}
          producto={productoEditando}
          onSave={(producto, nuevaCantidad) => {
            handleSaveEdit(nuevaCantidad, producto.precio_unitario);
          }}
          onDelete={() => {
            handleRemoveProduct(productoEditando.id_producto);
            setShowEditModal(false);
            setProductoEditando(null);
          }}
        />
      )}
    </div>
  );
};

export default ManualListResults;
