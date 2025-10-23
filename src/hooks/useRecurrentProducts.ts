import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../features/auth/hooks/useAuth';
import { useListHistory } from './useListHistory';

/**
 * Hook para detectar y gestionar productos recurrentes del usuario
 * 
 * Un producto es recurrente si aparece en 3+ de las últimas 5 listas
 * 
 * Características:
 * - Detección automática basada en historial
 * - Sugerencias al crear nueva lista
 * - Badge "Compras seguido" en productos
 * - Sección "Tus Básicos" en catálogo
 */
export const useRecurrentProducts = () => {
  const [recurrentProductIds, setRecurrentProductIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { savedLists } = useListHistory();
  const { user } = useAuth();

  // Detectar productos recurrentes cuando cambie el historial
  useEffect(() => {
    detectRecurrentProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedLists, user?.id]);

  /**
   * Detectar productos recurrentes
   * Lógica: Producto aparece en 3+ de las últimas 5 listas
   */
  const detectRecurrentProducts = useCallback(() => {
    try {
      setIsLoading(true);

      if (savedLists.length < 2) {
        // Necesitamos al menos 2 listas para detectar recurrencia
        setRecurrentProductIds([]);
        setIsLoading(false);
        return;
      }

      // Tomar las últimas 5 listas (o todas si hay menos)
      const recentLists = savedLists.slice(0, Math.min(5, savedLists.length));
      
      console.log('🔄 Detectando productos recurrentes en', recentLists.length, 'listas recientes');

      // Contar apariciones de cada producto
      const productCounts = new Map<number, number>();

      recentLists.forEach(lista => {
        const productIds = lista.productos.map(p => p.id_producto);
        
        // Contar cada producto una sola vez por lista (evitar duplicados si hay cantidad > 1)
        const uniqueProductIds = [...new Set(productIds)];
        
        uniqueProductIds.forEach(productId => {
          productCounts.set(productId, (productCounts.get(productId) || 0) + 1);
        });
      });

      // Filtrar productos que aparecen en 3+ listas
      const threshold = Math.min(3, Math.ceil(recentLists.length * 0.6)); // Al menos 60% de las listas
      
      const recurrent = Array.from(productCounts.entries())
        .filter(([_, count]) => count >= threshold)
        .map(([productId, _]) => productId)
        .sort((a, b) => (productCounts.get(b) || 0) - (productCounts.get(a) || 0)); // Ordenar por frecuencia

      console.log('✅ Productos recurrentes detectados:', recurrent.length);
      console.log('📊 Threshold usado:', threshold, 'de', recentLists.length, 'listas');
      
      setRecurrentProductIds(recurrent);
    } catch (error) {
      console.error('Error detecting recurrent products:', error);
      setRecurrentProductIds([]);
    } finally {
      setIsLoading(false);
    }
  }, [savedLists]);

  /**
   * Verificar si un producto es recurrente
   */
  const isRecurrent = useCallback((productId: number): boolean => {
    return recurrentProductIds.includes(productId);
  }, [recurrentProductIds]);

  /**
   * Obtener IDs de productos recurrentes
   */
  const getRecurrentIds = useCallback((): number[] => {
    return [...recurrentProductIds];
  }, [recurrentProductIds]);

  /**
   * Obtener contador de productos recurrentes
   */
  const getRecurrentCount = useCallback((): number => {
    return recurrentProductIds.length;
  }, [recurrentProductIds]);

  /**
   * Obtener productos recurrentes con sus detalles
   * (requiere cargar los productos desde el catálogo)
   */
  const getRecurrentProductsDetails = useCallback(() => {
    // Esta función retorna los IDs y nombres de productos recurrentes
    // basándose en el historial de listas
    const productDetails = new Map<number, { name: string; count: number }>();

    const recentLists = savedLists.slice(0, Math.min(5, savedLists.length));
    
    recentLists.forEach(lista => {
      lista.productos.forEach(producto => {
        if (recurrentProductIds.includes(producto.id_producto)) {
          const existing = productDetails.get(producto.id_producto);
          productDetails.set(producto.id_producto, {
            name: producto.nombre,
            count: (existing?.count || 0) + 1
          });
        }
      });
    });

    return Array.from(productDetails.entries()).map(([id, details]) => ({
      id,
      name: details.name,
      frequency: details.count
    })).sort((a, b) => b.frequency - a.frequency);
  }, [recurrentProductIds, savedLists]);

  /**
   * Obtener sugerencia de productos básicos para nueva lista
   */
  const getSuggestion = useCallback((): {
    productIds: number[];
    message: string;
  } => {
    if (recurrentProductIds.length === 0) {
      return {
        productIds: [],
        message: ''
      };
    }

    // Tomar los top 5-10 productos más recurrentes
    const topRecurrent = recurrentProductIds.slice(0, Math.min(10, recurrentProductIds.length));
    
    return {
      productIds: topRecurrent,
      message: `¿Añadir tus ${topRecurrent.length} productos básicos?`
    };
  }, [recurrentProductIds]);

  /**
   * Obtener estadísticas de recurrencia
   */
  const getStats = useCallback(() => {
    const recentLists = savedLists.slice(0, Math.min(5, savedLists.length));
    
    return {
      totalRecurrent: recurrentProductIds.length,
      listsAnalyzed: recentLists.length,
      avgRecurrentPerList: recentLists.length > 0 
        ? Math.round(recurrentProductIds.length / recentLists.length * 10) / 10
        : 0
    };
  }, [recurrentProductIds, savedLists]);

  return {
    recurrentProductIds,
    isLoading,
    isRecurrent,
    getRecurrentIds,
    getRecurrentCount,
    getRecurrentProductsDetails,
    getSuggestion,
    getStats,
    detectRecurrentProducts // Exponer para forzar re-detección si es necesario
  };
};

