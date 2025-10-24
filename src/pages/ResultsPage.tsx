import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart, Calendar, Users, Euro, TrendingDown, Sparkles,
  CheckCircle, Circle, Download, Share2, Home, ChevronDown,
  ChevronUp, Package, Utensils, Plus, Save, Check, GripVertical,
  List, RotateCcw
} from 'lucide-react';
import ProductSearchModal from '../components/products/ProductSearchModal';
import ProductEditModal from '../components/products/ProductEditModal';
import { ShareModal } from '../components/common/ShareModal';
import { QuantityControls } from '../components/common/QuantityControls';
import { DraggableProductList } from '../components/common/DraggableProductList';
import { WeeklyMenuCalendar } from '../components/common/WeeklyMenuCalendar';
import { ExportOptionsModal, type ExportOptions } from '../components/common/ExportOptionsModal';
import { PrintableList } from '../components/common/PrintableList';
import { useListHistory } from '../hooks/useListHistory';
import { useDragAndDrop } from '../hooks/useDragAndDrop';
import { exportToPDF } from '../utils/exportPDF';
import { exportToExcel } from '../utils/exportExcel';
import { generatePDF } from '../utils/generatePDF';
import { useReactToPrint } from 'react-to-print';
import { useAuth } from '../features/auth/hooks/useAuth';
import { PremiumGate } from '../features/auth/components/PremiumGate';
import { toast } from 'sonner';

interface ResultsPageProps {
  resultado: {
    lista: any;
    productos: Array<{
      id_producto: number;
      nombre: string;
      cantidad: number;
      precio_unitario: number;
      categoria: string;
      esencial: boolean;
    }>;
    menus: Record<string, {
      desayuno: string;
      comida: string;
      cena: string;
    }>;
    presupuesto_estimado: number;
    recomendaciones: string[];
    tipo?: 'IA' | 'Manual'; // Tipo de lista: generada con IA o creada manualmente
  };
  onBackToHome: () => void;
}

const ResultsPage: React.FC<ResultsPageProps> = ({ resultado, onBackToHome }) => {
  const [expandedDay, setExpandedDay] = useState<string | null>('dia_1');
  const [checkedProducts, setCheckedProducts] = useState<Set<number>>(new Set());
  const [productosLista, setProductosLista] = useState(resultado.productos);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [productoEditando, setProductoEditando] = useState<any>(null);
  const [listaSaved, setListaSaved] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [useDraggableView, setUseDraggableView] = useState(false); // Vista drag & drop
  const [showExportModal, setShowExportModal] = useState(false);
  const printableRef = React.useRef<HTMLDivElement>(null);

  const { lista, menus, recomendaciones } = resultado;
  const { saveList } = useListHistory();
  const { isAuthenticated, user } = useAuth();
  const { sortProducts, reorderProducts, hasCustomOrder, resetOrder } = useDragAndDrop(user?.id || null);

  // Cerrar menú de exportación al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showExportMenu && !target.closest('.relative')) {
        setShowExportMenu(false);
      }
    };

    if (showExportMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showExportMenu]);

  const handleSaveList = async () => {
    try {
      console.log('🎯 ResultsPage handleSaveList: Iniciando guardado...');
      console.log('📦 resultado original:', resultado);
      console.log('🔍 resultado.lista:', resultado.lista);
      console.log('🔍 lista.id_lista:', resultado.lista?.id_lista);

      // Actualizar resultado con productos actuales
      const resultadoActualizado = {
        lista: {
          ...resultado.lista,
          // ✅ CRÍTICO: Preservar id_lista si existe para actualizar en lugar de duplicar
          id_lista: resultado.lista?.id_lista,
          nombre_lista: resultado.lista?.nombre_lista || lista.nombre_lista || 'Lista generada con IA',
          num_personas: resultado.lista?.num_personas || lista.num_personas,
          dias_duracion: resultado.lista?.dias_duracion || lista.dias_duracion,
          presupuesto_total: presupuestoActual,
        },
        productos: productosLista,
        menus: resultado.menus || {},
        presupuesto_estimado: presupuestoActual,
        recomendaciones: resultado.recomendaciones || [],
        // ✅ CRÍTICO: Preservar tipo original (Manual o IA) - NO hardcodear a 'IA'
        tipo: (resultado.tipo || (Object.keys(resultado.menus || {}).length > 0 ? 'IA' : 'Manual')) as 'IA' | 'Manual',
      };

      console.log('📝 resultadoActualizado:', resultadoActualizado);
      console.log('📝 resultadoActualizado.lista.id_lista:', resultadoActualizado.lista.id_lista);

      // Si la lista ya tiene id_lista, se actualizará; si no, se creará nueva
      await saveList(resultadoActualizado);

      console.log('✅ ResultsPage: Lista guardada exitosamente');
      setListaSaved(true);

      // Mostrar mensaje diferenciado según modo
      const mensaje = isAuthenticated
        ? (resultado.lista?.id_lista ? 'Lista actualizada correctamente' : 'Lista guardada en tu cuenta')
        : 'Lista guardada temporalmente (modo Demo)';

      console.log(mensaje);
      setTimeout(() => setListaSaved(false), 3000);
    } catch (error: any) {
      console.error('❌ ResultsPage Error al guardar lista:', error);

      // Manejar límite Demo específicamente
      if (error.message?.includes('DEMO_LIMIT')) {
        const mensajeError = error.message.split(':')[1] || 'Límite alcanzado';
        alert(mensajeError + '\n\n¿Deseas registrarte ahora?');
        // Podría redirigir a /register aquí
      } else {
        alert('No se pudo guardar la lista: ' + error.message);
      }
    }
  };

  // ================================================================
  // FUNCIONES SPRINT 4: Impresión y Exportación
  // ================================================================

  /**
   * Generar PDF con jsPDF (nueva implementación)
   */
  const handleGeneratePDF = (options: ExportOptions) => {
    try {
      generatePDF({
        lista: {
          nombre_lista: lista.nombre_lista || 'Lista de Compra',
          num_personas: lista.num_personas,
          dias_duracion: lista.dias_duracion,
          presupuesto_total: presupuestoActual,
        },
        productos: productosLista,
        menus,
        includePrices: options.includePrices,
        includeMenus: options.includeMenus,
      });
      toast.success('PDF descargado correctamente', { icon: '📄' });
    } catch (error) {
      console.error('Error al generar PDF:', error);
      toast.error('Error al generar PDF');
    }
  };

  /**
   * Imprimir con react-to-print
   */
  const handlePrint = useReactToPrint({
    content: () => printableRef.current,
    documentTitle: lista.nombre_lista || 'Lista de Compra',
    onAfterPrint: () => toast.success('Lista lista para imprimir', { icon: '🖨️' }),
  });

  const handlePrintWithOptions = (options: ExportOptions) => {
    // Las opciones se aplican al componente PrintableList via props
    handlePrint();
  };

  /**
   * Exportar a Excel (mantener funcionalidad existente)
   */
  const handleExportExcel = () => {
    try {
      const datosExportar = {
        ...resultado,
        productos: productosLista,
      };
      exportToExcel(datosExportar);
      setShowExportMenu(false);
      toast.success('Excel descargado correctamente', { icon: '📊' });
    } catch (error) {
      console.error('Error al exportar Excel:', error);
      toast.error('Error al exportar Excel');
    }
  };

  /**
   * Exportar PDF legacy (mantener para compatibilidad)
   */
  const handleExportPDFLegacy = () => {
    try {
      const datosExportar = {
        ...resultado,
        productos: productosLista,
      };
      exportToPDF(datosExportar);
      setShowExportMenu(false);
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      alert('No se pudo exportar a PDF');
    }
  };

  const toggleProduct = (productId: number) => {
    const newChecked = new Set(checkedProducts);
    if (newChecked.has(productId)) {
      newChecked.delete(productId);
    } else {
      newChecked.add(productId);
    }
    setCheckedProducts(newChecked);
  };

  // ================================================================
  // NUEVAS FUNCIONES SPRINT 4: Edición Inline de Cantidades
  // ================================================================

  /**
   * Incrementar cantidad de un producto
   */
  const handleIncrementQuantity = (productId: number) => {
    setProductosLista(prev => prev.map(p => 
      p.id_producto === productId 
        ? { ...p, cantidad: Math.min(p.cantidad + 1, 99) }
        : p
    ));
    toast.success('Cantidad actualizada', { duration: 1000 });
  };

  /**
   * Decrementar cantidad de un producto (mínimo 1)
   */
  const handleDecrementQuantity = (productId: number) => {
    setProductosLista(prev => prev.map(p => 
      p.id_producto === productId 
        ? { ...p, cantidad: Math.max(p.cantidad - 1, 1) }
        : p
    ));
    toast.success('Cantidad actualizada', { duration: 1000 });
  };

  /**
   * Eliminar producto de la lista (confirmación rápida)
   */
  const handleRemoveProduct = (productId: number, productName: string) => {
    setProductosLista(prev => prev.filter(p => p.id_producto !== productId));
    // Remover del checklist también
    setCheckedProducts(prev => {
      const newSet = new Set(prev);
      newSet.delete(productId);
      return newSet;
    });
    toast.info(`${productName} eliminado de la lista`, {
      duration: 2000,
      icon: '🗑️'
    });
  };

  /**
   * Manejar reorden de productos (Drag & Drop)
   */
  const handleReorderProducts = (reorderedProducts: typeof productosLista) => {
    setProductosLista(reorderedProducts);
    reorderProducts(reorderedProducts);
    toast.success('Orden actualizado', { duration: 1000 });
  };

  /**
   * Resetear orden a categorías por defecto
   */
  const handleResetOrder = () => {
    resetOrder();
    // Re-agrupar por categorías
    const sortedByCategory = [...productosLista].sort((a, b) => 
      a.categoria.localeCompare(b.categoria)
    );
    setProductosLista(sortedByCategory);
    toast.info('Orden restaurado a categorías', { duration: 2000 });
  };

  // Funciones para edición de productos
  const handleAddProduct = (producto: any, cantidad: number) => {
    const nuevoProducto = {
      id_producto: producto.id_producto,
      nombre: producto.nombre_producto,
      cantidad: cantidad,
      precio_unitario: producto.precio_formato_venta, // Usar precio del formato
      categoria: producto.subcategorias.categorias.nombre_categoria,
      esencial: false
    };

    setProductosLista(prev => [...prev, nuevoProducto]);
  };

  // ✅ DEPRECADO: Reemplazado por QuantityControls inline
  // const handleEditProduct = (producto: any) => {
  //   setProductoEditando(producto);
  //   setShowEditModal(true);
  // };

  const handleSaveProduct = (producto: any, nuevaCantidad: number) => {
    setProductosLista(prev => 
      prev.map(p => 
        p.id_producto === producto.id_producto 
          ? { ...p, cantidad: nuevaCantidad }
          : p
      )
    );
  };

  const handleDeleteProduct = (productId: number) => {
    setProductosLista(prev => prev.filter(p => p.id_producto !== productId));
    setCheckedProducts(prev => {
      const newSet = new Set(prev);
      newSet.delete(productId);
      return newSet;
    });
  };

  const getExistingProductIds = () => {
    return new Set(productosLista.map(p => p.id_producto));
  };

  const groupedProducts = productosLista.reduce((acc: any, producto) => {
    const categoria = producto.categoria || 'Otros';
    if (!acc[categoria]) acc[categoria] = [];
    acc[categoria].push(producto);
    return acc;
  }, {});

  const totalProductos = productosLista.length;
  const productosComprados = checkedProducts.size;
  const progreso = totalProductos > 0 ? (productosComprados / totalProductos) * 100 : 0;

  // Recalcular presupuesto basado en productos actuales (usando precio_formato_venta)
  const presupuestoActual = productosLista.reduce((total, producto) => {
    return total + (producto.precio_unitario * producto.cantidad); // precio_unitario viene como precio_formato_venta
  }, 0);

  const presupuestoDisponible = lista.presupuesto_total || 0;
  const ahorroEstimado = presupuestoDisponible - presupuestoActual;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header con animación */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            ¡Tu lista está lista!
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            {lista.nombre_lista || `Lista para ${lista.num_personas} personas - ${lista.dias_duracion} días`}
          </p>
        </motion.div>

        {/* Resumen estadístico */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Productos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalProductos}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Calendar className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Duración</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{lista.dias_duracion} días</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Personas</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{lista.num_personas}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <Euro className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Presupuesto</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{presupuestoActual.toFixed(2)}€</p>
                <p className="text-xs text-gray-400">
                  Disponible: {presupuestoDisponible.toFixed(2)}€
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Ahorro estimado */}
        {ahorroEstimado > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20
                       rounded-2xl p-6 mb-8 border border-green-200 dark:border-green-800"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                  <TrendingDown className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-lg">
                    ¡Ahorro estimado!
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Has ahorrado {ahorroEstimado.toFixed(2)}€ respecto a tu presupuesto
                  </p>
                </div>
              </div>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {ahorroEstimado.toFixed(2)}€
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista de productos */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              {/* Header con título y botones adaptado a móvil */}
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                  <Package className="w-6 h-6" />
                  Lista de compra
                </h2>

                {/* Botones en grid responsive */}
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                  <button
                    onClick={() => setShowSearchModal(true)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm font-medium">Añadir</span>
                  </button>

                  <button
                    onClick={handleSaveList}
                    className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      listaSaved
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                    title="Guardar lista"
                  >
                    {listaSaved ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span className="text-sm font-medium">Guardada</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Guardar</span>
                      </>
                    )}
                  </button>

                  {/* Botón Compartir - Solo si está autenticado y lista guardada */}
                  {isAuthenticated && resultado.lista?.id_lista && (
                    <button
                      onClick={() => setShowShareModal(true)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all"
                      title="Compartir lista"
                    >
                      <Share2 className="w-4 h-4" />
                      <span className="text-sm font-medium">Compartir</span>
                    </button>
                  )}

                  {/* Menú de exportación - Premium Feature */}
                  <PremiumGate feature="Exportación PDF/Excel">
                    <div className="relative col-span-1">
                      <button
                        onClick={() => setShowExportMenu(!showExportMenu)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                        title="Exportar lista"
                      >
                        <Download className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Exportar</span>
                      </button>

                      {showExportMenu && (
                        <div className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-20">
                          <button
                            onClick={() => {
                              setShowExportModal(true);
                              setShowExportMenu(false);
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 rounded-t-lg"
                          >
                            <Download className="w-4 h-4 text-red-500" />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white text-sm">Imprimir / PDF</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Configura opciones de exportación</p>
                            </div>
                          </button>
                          <button
                            onClick={handleExportExcel}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 rounded-b-lg border-t border-gray-200 dark:border-gray-700"
                          >
                            <Download className="w-4 h-4 text-green-500" />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white text-sm">Exportar Excel</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Hoja de cálculo editable</p>
                            </div>
                          </button>
                        </div>
                      )}
                    </div>
                  </PremiumGate>

                  <button
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                    title="Compartir lista"
                  >
                    <Share2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400 sm:hidden">Compartir</span>
                  </button>
                </div>
              </div>

              {/* Menú Semanal */}
              {menus && Object.keys(menus).length > 0 && (
                <WeeklyMenuCalendar menus={menus} className="mb-6" />
              )}

              {/* Barra de progreso */}
              <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl p-4 shadow border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Progreso de compra
                  </span>
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                    {productosComprados}/{totalProductos} ({progreso.toFixed(0)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progreso}%` }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full"
                  />
                </div>
              </div>

              {/* Toggle vista y botón reset orden */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setUseDraggableView(!useDraggableView)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      useDraggableView
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                    title={useDraggableView ? 'Vista por categorías' : 'Activar reordenamiento'}
                  >
                    {useDraggableView ? (
                      <>
                        <GripVertical className="w-4 h-4" />
                        <span className="text-sm font-medium">Modo Reordenar</span>
                      </>
                    ) : (
                      <>
                        <List className="w-4 h-4" />
                        <span className="text-sm font-medium">Vista Categorías</span>
                      </>
                    )}
                  </button>

                  {hasCustomOrder && useDraggableView && (
                    <button
                      onClick={handleResetOrder}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-all"
                      title="Restaurar orden por categorías"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span className="text-sm font-medium hidden sm:inline">Restaurar Orden</span>
                    </button>
                  )}
                </div>

                {useDraggableView && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    💡 Arrastra los productos para organizarlos a tu gusto
                  </p>
                )}
              </div>

              {/* Productos: Vista por categorías o lista draggable */}
              {useDraggableView ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                  <DraggableProductList
                    productos={sortProducts(productosLista)}
                    checkedProducts={checkedProducts}
                    onToggleProduct={toggleProduct}
                    onReorder={handleReorderProducts}
                    onIncrement={handleIncrementQuantity}
                    onDecrement={handleDecrementQuantity}
                    onRemove={handleRemoveProduct}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                {Object.entries(groupedProducts).map(([categoria, items]: [string, any], index) => (
                  <motion.div
                    key={categoria}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
                  >
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <span className="text-2xl">{getCategoryIcon(categoria)}</span>
                      {categoria}
                      <span className="text-sm text-gray-500 dark:text-gray-400 ml-auto">
                        {items.length} producto{items.length !== 1 ? 's' : ''}
                      </span>
                    </h3>

                    <div className="space-y-2">
                      {items.map((producto: any) => (
                        <div
                          key={producto.id_producto}
                          className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-colors group"
                        >
                          {/* Layout responsive: columna en móvil, fila en desktop */}
                          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                            {/* Fila superior: Checkbox + Info */}
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div 
                                className="flex-shrink-0 cursor-pointer"
                                onClick={() => toggleProduct(producto.id_producto)}
                              >
                                {checkedProducts.has(producto.id_producto) ? (
                                  <CheckCircle className="w-6 h-6 text-green-500" />
                                ) : (
                                  <Circle className="w-6 h-6 text-gray-300 dark:text-gray-600 group-hover:text-gray-400" />
                                )}
                              </div>

                              <div 
                                className="flex-1 min-w-0 cursor-pointer"
                                onClick={() => toggleProduct(producto.id_producto)}
                              >
                                <p className={`font-medium text-sm sm:text-base ${
                                  checkedProducts.has(producto.id_producto)
                                    ? 'line-through text-gray-400 dark:text-gray-500'
                                    : 'text-gray-900 dark:text-white'
                                }`}>
                                  {producto.nombre}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                    {producto.precio_unitario.toFixed(2)}€/ud
                                  </p>
                                  {producto.esencial && (
                                    <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs rounded-full">
                                      Esencial
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Fila inferior/derecha: Controles + Precio */}
                            <div className="flex items-center justify-between sm:justify-end gap-3 pl-10 sm:pl-0" onClick={(e) => e.stopPropagation()}>
                              <QuantityControls
                                quantity={producto.cantidad}
                                onIncrement={() => handleIncrementQuantity(producto.id_producto)}
                                onDecrement={() => handleDecrementQuantity(producto.id_producto)}
                                onRemove={() => handleRemoveProduct(producto.id_producto, producto.nombre)}
                                size="sm"
                              />
                              <div className="text-right min-w-[4rem]">
                                <p className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                                  {(producto.cantidad * producto.precio_unitario).toFixed(2)}€
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Menús y recomendaciones */}
          <div className="space-y-6">
            {/* Menús semanales */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Utensils className="w-6 h-6" />
                Menús planificados
              </h2>

              <div className="space-y-3">
                {Object.entries(menus).map(([dia, menu]: [string, any]) => (
                  <div key={dia}>
                    <button
                      onClick={() => setExpandedDay(expandedDay === dia ? null : dia)}
                      className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50
                               rounded-xl transition-colors"
                    >
                      <span className="font-medium text-gray-900 dark:text-white">
                        Día {dia.split('_')[1]}
                      </span>
                      {expandedDay === dia ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      )}
                    </button>

                    <AnimatePresence>
                      {expandedDay === dia && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="pl-4 pr-3 py-2 space-y-2">
                            <div>
                              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Desayuno</p>
                              <p className="text-sm text-gray-700 dark:text-gray-300">{menu.desayuno}</p>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Comida</p>
                              <p className="text-sm text-gray-700 dark:text-gray-300">{menu.comida}</p>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Cena</p>
                              <p className="text-sm text-gray-700 dark:text-gray-300">{menu.cena}</p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Recomendaciones */}
            {recomendaciones && recomendaciones.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20
                         rounded-2xl p-6 shadow-lg border border-purple-200 dark:border-purple-800"
              >
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  Recomendaciones IA
                </h3>
                <ul className="space-y-2">
                  {recomendaciones.map((rec, index) => (
                    <li key={index} className="flex gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <span className="text-purple-500">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </div>
        </div>

        {/* Botón volver */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-center"
        >
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500
                     hover:from-blue-600 hover:to-purple-600 text-white rounded-xl font-medium
                     transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <Home className="w-5 h-5" />
            Volver al inicio
          </button>
        </motion.div>
      </div>

      {/* Modales */}
      <ProductSearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onAddProduct={handleAddProduct}
        existingProductIds={getExistingProductIds()}
      />

      <ProductEditModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setProductoEditando(null);
        }}
        producto={productoEditando}
        onSave={handleSaveProduct}
        onDelete={handleDeleteProduct}
      />

      {/* Modal de compartir */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        listaId={resultado.lista?.id_lista || ''}
        listaNombre={lista.nombre_lista || 'Mi lista'}
      />

      {/* Modal de opciones de exportación/impresión */}
      <ExportOptionsModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExportPDF={handleGeneratePDF}
        onPrint={handlePrintWithOptions}
      />

      {/* Componente oculto para impresión */}
      <div className="hidden">
        <PrintableList
          ref={printableRef}
          lista={{
            nombre_lista: lista.nombre_lista || 'Lista de Compra',
            num_personas: lista.num_personas,
            dias_duracion: lista.dias_duracion,
            presupuesto_total: presupuestoActual,
          }}
          productos={productosLista}
          menus={menus}
          includePrices={true}
          includeMenus={true}
        />
      </div>
    </div>
  );
};

// Helper function para iconos de categorías
function getCategoryIcon(categoria: string): string {
  const icons: Record<string, string> = {
    'Aceite, especias y salsas': '🫒',
    'Arroz, legumbres y pasta': '🍚',
    'Bebidas y refrescos': '🥤',
    'Carne': '🥩',
    'Charcutería y quesos': '🧀',
    'Congelados': '🧊',
    'Conservas, caldos y cremas': '🥫',
    'Dulces y snacks': '🍪',
    'Frutas y verduras': '🥬',
    'Lácteos y huevos': '🥛',
    'Limpieza y hogar': '🧽',
    'Pan y bollería': '🍞',
    'Pescado y marisco': '🐟'
  };
  return icons[categoria] || '📦';
}

export default ResultsPage;
