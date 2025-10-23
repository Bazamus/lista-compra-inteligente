import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ShoppingCart, Users, Calendar, Euro, Package, Home, Clock, 
  Eye, ExternalLink, ChevronDown, ChevronUp 
} from 'lucide-react';
import { toast } from 'sonner';

interface SharedListData {
  lista: {
    nombre: string;
    personas: number;
    dias: number;
    presupuesto: number;
    productos: Array<{
      id_producto: number;
      nombre: string;
      cantidad: number;
      precio_unitario: number;
      categoria: string;
      esencial: boolean;
    }>;
    menus: Record<string, any>;
    recomendaciones: string[];
    tipo: 'IA' | 'Manual';
    fecha_creacion: string;
  };
  share_info: {
    visit_count: number;
    expires_at: string | null;
    created_at: string;
  };
}

export const SharedListPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [lista, setLista] = useState<SharedListData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadSharedList();
  }, [token]);

  const loadSharedList = async () => {
    try {
      console.log('🔍 Cargando lista compartida con token:', token);
      
      const response = await fetch(`/api/shared/${token}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Error al cargar lista');
      }

      console.log('✅ Lista compartida cargada:', data);
      setLista(data);
    } catch (err: any) {
      console.error('❌ Error cargando lista compartida:', err);
      setError(err.message);
      toast.error('No se pudo cargar la lista');
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Cargando lista compartida...</p>
        </div>
      </div>
    );
  }

  if (error || !lista) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl">
            <Package className="w-20 h-20 text-red-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              Lista no disponible
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error || 'La lista que buscas no existe o ha expirado'}
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition flex items-center gap-2 mx-auto"
            >
              <Home className="w-5 h-5" />
              Ir a ListaGPT
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Agrupar productos por categoría
  const productosPorCategoria = lista.lista.productos.reduce((acc, producto) => {
    const categoria = producto.categoria || 'Otros';
    if (!acc[categoria]) {
      acc[categoria] = [];
    }
    acc[categoria].push(producto);
    return acc;
  }, {} as Record<string, any[]>);

  const categorias = Object.keys(productosPorCategoria).sort();
  const totalProductos = lista.lista.productos.length;
  const presupuestoTotal = lista.lista.presupuesto;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
      {/* Header fijo */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-xl">
                <ShoppingCart className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {lista.lista.nombre}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  {lista.share_info.visit_count} visitas
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition flex items-center gap-2 font-medium"
            >
              Crear mi lista
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Info cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <ShoppingCart className="w-7 h-7 text-blue-500 mb-2" />
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalProductos}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Productos</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <Users className="w-7 h-7 text-green-500 mb-2" />
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{lista.lista.personas}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Personas</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <Calendar className="w-7 h-7 text-purple-500 mb-2" />
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{lista.lista.dias}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Días</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <Euro className="w-7 h-7 text-orange-500 mb-2" />
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {presupuestoTotal.toFixed(2)}€
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Presupuesto</p>
          </motion.div>
        </div>

        {/* Lista de productos por categoría */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Package className="w-6 h-6 text-blue-500" />
              Lista de Compra
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {categorias.length} categorías • {totalProductos} productos
            </p>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {categorias.map((categoria, idx) => {
              const productos = productosPorCategoria[categoria];
              const subtotal = productos.reduce((sum, p) => sum + p.cantidad * p.precio_unitario, 0);
              const isExpanded = expandedCategories.has(categoria);

              return (
                <div key={categoria} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  {/* Header de categoría */}
                  <button
                    onClick={() => toggleCategory(categoria)}
                    className="w-full p-5 flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getCategoryIcon(categoria)}</span>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {categoria}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {productos.length} productos • {subtotal.toFixed(2)}€
                        </p>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </button>

                  {/* Productos de la categoría */}
                  {isExpanded && (
                    <div className="px-5 pb-5 space-y-2">
                      {productos.map((producto, pIdx) => (
                        <div
                          key={pIdx}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white">
                              {producto.nombre}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Cantidad: {producto.cantidad}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900 dark:text-white text-lg">
                              {(producto.cantidad * producto.precio_unitario).toFixed(2)}€
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {producto.cantidad} × {producto.precio_unitario.toFixed(2)}€
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Info adicional */}
        {lista.share_info.expires_at && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800"
          >
            <p className="text-sm text-amber-800 dark:text-amber-300 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Este enlace expira el {new Date(lista.share_info.expires_at).toLocaleString('es-ES', {
                dateStyle: 'long',
                timeStyle: 'short'
              })}
            </p>
          </motion.div>
        )}

        {/* CTA final */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl p-8 text-white text-center shadow-xl"
        >
          <h3 className="text-3xl font-bold mb-3">¿Te gustó esta lista?</h3>
          <p className="text-lg mb-6 opacity-90">
            Crea tus propias listas personalizadas con IA en segundos
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/')}
              className="px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:shadow-2xl transition-all transform hover:scale-105"
            >
              🚀 Empezar Gratis
            </button>
            <button
              onClick={() => navigate('/catalog')}
              className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white text-white font-bold rounded-xl hover:bg-white/20 transition-all"
            >
              🛒 Ver Catálogo
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Helper para iconos de categorías
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
    'Pescado y marisco': '🐟',
    'Otros': '📦'
  };
  return icons[categoria] || '📦';
}

