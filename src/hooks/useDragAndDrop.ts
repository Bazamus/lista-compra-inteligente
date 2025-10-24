import { useState, useCallback, useEffect } from 'react';

/**
 * Hook para gestionar el estado de drag and drop de productos
 * 
 * Características:
 * - Persistencia del orden en localStorage
 * - Orden por defecto: agrupado por categorías
 * - Reordenamiento manual del usuario
 */

interface ProductOrder {
  id_producto: number;
  order_index: number;
}

export const useDragAndDrop = (userId: string | null) => {
  const storageKey = `product_order_${userId || 'anon'}`;
  
  const [productOrder, setProductOrder] = useState<Map<number, number>>(() => {
    // Cargar orden guardado de localStorage
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed: ProductOrder[] = JSON.parse(saved);
        return new Map(parsed.map(item => [item.id_producto, item.order_index]));
      }
    } catch (error) {
      console.error('Error loading product order:', error);
    }
    return new Map();
  });

  /**
   * Guardar orden en localStorage
   */
  const saveOrder = useCallback((order: Map<number, number>) => {
    try {
      const orderArray: ProductOrder[] = Array.from(order.entries()).map(([id_producto, order_index]) => ({
        id_producto,
        order_index
      }));
      localStorage.setItem(storageKey, JSON.stringify(orderArray));
      console.log('💾 Order saved:', orderArray.length, 'products');
    } catch (error) {
      console.error('Error saving product order:', error);
    }
  }, [storageKey]);

  /**
   * Actualizar orden después de un drag & drop
   */
  const updateOrder = useCallback((productId: number, newIndex: number) => {
    setProductOrder(prev => {
      const newOrder = new Map(prev);
      newOrder.set(productId, newIndex);
      saveOrder(newOrder);
      return newOrder;
    });
  }, [saveOrder]);

  /**
   * Reordenar múltiples productos (para cuando se mueve uno, hay que ajustar los demás)
   */
  const reorderProducts = useCallback((products: Array<{ id_producto: number }>) => {
    setProductOrder(prev => {
      const newOrder = new Map();
      products.forEach((product, index) => {
        newOrder.set(product.id_producto, index);
      });
      saveOrder(newOrder);
      return newOrder;
    });
  }, [saveOrder]);

  /**
   * Resetear orden (volver a orden por categorías)
   */
  const resetOrder = useCallback(() => {
    setProductOrder(new Map());
    try {
      localStorage.removeItem(storageKey);
      console.log('🔄 Order reset');
    } catch (error) {
      console.error('Error resetting order:', error);
    }
  }, [storageKey]);

  /**
   * Obtener índice de orden de un producto
   */
  const getProductIndex = useCallback((productId: number): number | undefined => {
    return productOrder.get(productId);
  }, [productOrder]);

  /**
   * Ordenar productos según el orden guardado o por categoría por defecto
   */
  const sortProducts = useCallback(<T extends { id_producto: number; categoria: string }>(
    products: T[]
  ): T[] => {
    // Si no hay orden personalizado, ordenar por categoría
    if (productOrder.size === 0) {
      return [...products].sort((a, b) => a.categoria.localeCompare(b.categoria));
    }

    // Ordenar según índices guardados
    return [...products].sort((a, b) => {
      const indexA = productOrder.get(a.id_producto) ?? Infinity;
      const indexB = productOrder.get(b.id_producto) ?? Infinity;
      
      if (indexA === Infinity && indexB === Infinity) {
        // Si ninguno tiene índice, mantener orden original o por categoría
        return a.categoria.localeCompare(b.categoria);
      }
      
      return indexA - indexB;
    });
  }, [productOrder]);

  /**
   * Verificar si hay un orden personalizado
   */
  const hasCustomOrder = productOrder.size > 0;

  return {
    productOrder,
    updateOrder,
    reorderProducts,
    resetOrder,
    getProductIndex,
    sortProducts,
    hasCustomOrder
  };
};

