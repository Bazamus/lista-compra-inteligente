import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY_PREFIX = 'shopping_mode_';

/**
 * Hook para gestionar el modo compra de una lista
 * 
 * Características:
 * - Marcar productos como comprados con checkbox
 * - Progreso visual (X de Y comprados)
 * - Persistencia en localStorage (temporal)
 * - Reset de progreso
 * - Celebración al completar todos
 */
export const useShoppingMode = (listId?: string) => {
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());
  const [totalItems, setTotalItems] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // Cargar estado al montar si hay listId
  useEffect(() => {
    if (listId) {
      loadState(listId);
    }
  }, [listId]);

  // Verificar si está completo
  useEffect(() => {
    if (totalItems > 0 && checkedItems.size === totalItems) {
      setIsComplete(true);
    } else {
      setIsComplete(false);
    }
  }, [checkedItems.size, totalItems]);

  /**
   * Cargar estado guardado desde localStorage
   */
  const loadState = (id: string) => {
    try {
      const key = `${STORAGE_KEY_PREFIX}${id}`;
      const stored = localStorage.getItem(key);
      
      if (stored) {
        const data = JSON.parse(stored);
        setCheckedItems(new Set(data.checkedItems || []));
        setTotalItems(data.totalItems || 0);
        console.log('📦 Shopping mode state loaded:', data);
      }
    } catch (error) {
      console.error('Error loading shopping mode state:', error);
    }
  };

  /**
   * Guardar estado en localStorage
   */
  const saveState = useCallback((id: string, checked: Set<number>, total: number) => {
    try {
      const key = `${STORAGE_KEY_PREFIX}${id}`;
      const data = {
        checkedItems: Array.from(checked),
        totalItems: total,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(key, JSON.stringify(data));
      console.log('💾 Shopping mode state saved');
    } catch (error) {
      console.error('Error saving shopping mode state:', error);
    }
  }, []);

  /**
   * Inicializar modo compra con productos
   */
  const initialize = useCallback((productIds: number[], id?: string) => {
    setTotalItems(productIds.length);
    
    // Si hay un ID de lista, intentar cargar estado previo
    if (id) {
      const key = `${STORAGE_KEY_PREFIX}${id}`;
      const stored = localStorage.getItem(key);
      
      if (stored) {
        try {
          const data = JSON.parse(stored);
          // Verificar que los productos coincidan
          if (data.totalItems === productIds.length) {
            setCheckedItems(new Set(data.checkedItems || []));
            console.log('✅ Restored previous shopping progress');
            return;
          }
        } catch (error) {
          console.error('Error restoring shopping progress:', error);
        }
      }
    }
    
    // Si no hay estado previo o no coincide, empezar de cero
    setCheckedItems(new Set());
  }, []);

  /**
   * Toggle item comprado/no comprado
   */
  const toggleCheck = useCallback((productId: number) => {
    setCheckedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      
      // Guardar en localStorage si hay listId
      if (listId) {
        saveState(listId, newSet, totalItems);
      }
      
      return newSet;
    });
  }, [listId, totalItems, saveState]);

  /**
   * Verificar si un item está marcado
   */
  const isChecked = useCallback((productId: number): boolean => {
    return checkedItems.has(productId);
  }, [checkedItems]);

  /**
   * Obtener progreso
   */
  const getProgress = useCallback(() => {
    const completed = checkedItems.size;
    const total = totalItems;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return {
      completed,
      total,
      percentage,
      remaining: total - completed
    };
  }, [checkedItems.size, totalItems]);

  /**
   * Marcar todos como comprados
   */
  const checkAll = useCallback((productIds: number[]) => {
    const newSet = new Set(productIds);
    setCheckedItems(newSet);
    
    if (listId) {
      saveState(listId, newSet, totalItems);
    }
  }, [listId, totalItems, saveState]);

  /**
   * Desmarcar todos
   */
  const uncheckAll = useCallback(() => {
    setCheckedItems(new Set());
    
    if (listId) {
      saveState(listId, new Set(), totalItems);
    }
  }, [listId, totalItems, saveState]);

  /**
   * Reset completo (limpiar todo el estado)
   */
  const reset = useCallback(() => {
    setCheckedItems(new Set());
    setTotalItems(0);
    setIsComplete(false);
    
    if (listId) {
      const key = `${STORAGE_KEY_PREFIX}${listId}`;
      localStorage.removeItem(key);
      console.log('🔄 Shopping mode reset');
    }
  }, [listId]);

  /**
   * Finalizar compra (limpiar estado)
   */
  const finish = useCallback(() => {
    if (listId) {
      const key = `${STORAGE_KEY_PREFIX}${listId}`;
      localStorage.removeItem(key);
    }
    
    // Mantener el estado para mostrar confetti, pero limpiar localStorage
    console.log('🎉 Shopping completed!');
  }, [listId]);

  /**
   * Obtener items comprados y no comprados separados
   */
  const getSortedItems = useCallback(<T extends { id_producto: number }>(items: T[]): {
    unchecked: T[];
    checked: T[];
  } => {
    const unchecked = items.filter(item => !checkedItems.has(item.id_producto));
    const checked = items.filter(item => checkedItems.has(item.id_producto));
    
    return { unchecked, checked };
  }, [checkedItems]);

  return {
    checkedItems,
    totalItems,
    isComplete,
    initialize,
    toggleCheck,
    isChecked,
    getProgress,
    checkAll,
    uncheckAll,
    reset,
    finish,
    getSortedItems
  };
};

