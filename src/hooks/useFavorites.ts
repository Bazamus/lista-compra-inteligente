import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../features/auth/hooks/useAuth';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

const STORAGE_KEY = 'favorite_products';

/**
 * Hook para gestionar productos favoritos del usuario
 * 
 * Características:
 * - Persistencia en BD para usuarios autenticados
 * - Persistencia en localStorage para usuarios demo
 * - Sincronización automática
 * - Toast notifications para feedback
 */
export const useFavorites = () => {
  const [favorites, setFavorites] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();

  // Cargar favoritos al montar o cuando cambie el usuario
  useEffect(() => {
    loadFavorites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, isAuthenticated]);

  /**
   * Cargar favoritos desde BD o localStorage
   */
  const loadFavorites = async () => {
    try {
      setIsLoading(true);

      if (isAuthenticated && user) {
        // Usuario autenticado: cargar desde BD
        const { data, error } = await supabase
          .from('user_favorites')
          .select('product_id')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error loading favorites from DB:', error);
          // Fallback a localStorage
          loadFavoritesFromLocalStorage();
        } else {
          const favoriteIds = data?.map(item => item.product_id) || [];
          setFavorites(favoriteIds);
          console.log('✅ Favoritos cargados desde BD:', favoriteIds.length);
        }
      } else {
        // Usuario demo: cargar desde localStorage
        loadFavoritesFromLocalStorage();
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
      loadFavoritesFromLocalStorage();
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Cargar favoritos desde localStorage
   */
  const loadFavoritesFromLocalStorage = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const favoriteIds = JSON.parse(stored);
        setFavorites(favoriteIds);
        console.log('✅ Favoritos cargados desde localStorage:', favoriteIds.length);
      } else {
        setFavorites([]);
      }
    } catch (error) {
      console.error('Error parsing favorites from localStorage:', error);
      setFavorites([]);
    }
  };

  /**
   * Guardar favoritos en localStorage
   */
  const saveFavoritesToLocalStorage = (favoriteIds: number[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favoriteIds));
    } catch (error) {
      console.error('Error saving favorites to localStorage:', error);
    }
  };

  /**
   * Añadir producto a favoritos
   */
  const addFavorite = async (productId: number): Promise<boolean> => {
    try {
      if (favorites.includes(productId)) {
        return false; // Ya está en favoritos
      }

      const newFavorites = [...favorites, productId];
      setFavorites(newFavorites);

      if (isAuthenticated && user) {
        // Guardar en BD
        const { error } = await supabase
          .from('user_favorites')
          .insert({
            user_id: user.id,
            product_id: productId,
            created_at: new Date().toISOString()
          });

        if (error) {
          console.error('Error adding favorite to DB:', error);
          // Revertir cambio
          setFavorites(favorites);
          toast.error('Error al añadir a favoritos');
          return false;
        }

        console.log('✅ Favorito añadido a BD:', productId);
      }

      // Guardar en localStorage (backup o modo demo)
      saveFavoritesToLocalStorage(newFavorites);
      
      return true;
    } catch (error) {
      console.error('Error adding favorite:', error);
      toast.error('Error al añadir a favoritos');
      return false;
    }
  };

  /**
   * Quitar producto de favoritos
   */
  const removeFavorite = async (productId: number): Promise<boolean> => {
    try {
      if (!favorites.includes(productId)) {
        return false; // No está en favoritos
      }

      const newFavorites = favorites.filter(id => id !== productId);
      setFavorites(newFavorites);

      if (isAuthenticated && user) {
        // Eliminar de BD
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);

        if (error) {
          console.error('Error removing favorite from DB:', error);
          // Revertir cambio
          setFavorites(favorites);
          toast.error('Error al quitar de favoritos');
          return false;
        }

        console.log('✅ Favorito eliminado de BD:', productId);
      }

      // Guardar en localStorage (backup o modo demo)
      saveFavoritesToLocalStorage(newFavorites);
      
      return true;
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast.error('Error al quitar de favoritos');
      return false;
    }
  };

  /**
   * Toggle favorito (añadir si no existe, quitar si existe)
   */
  const toggleFavorite = useCallback(async (productId: number, productName?: string) => {
    const isFav = favorites.includes(productId);
    
    if (isFav) {
      const success = await removeFavorite(productId);
      if (success) {
        toast.success(productName ? `${productName} quitado de favoritos` : 'Quitado de favoritos');
      }
    } else {
      const success = await addFavorite(productId);
      if (success) {
        toast.success(productName ? `${productName} añadido a favoritos` : 'Añadido a favoritos', {
          icon: '⭐'
        });
      }
    }
  }, [favorites]);

  /**
   * Verificar si un producto es favorito
   */
  const isFavorite = useCallback((productId: number): boolean => {
    return favorites.includes(productId);
  }, [favorites]);

  /**
   * Obtener todos los IDs de favoritos
   */
  const getFavoriteIds = useCallback((): number[] => {
    return [...favorites];
  }, [favorites]);

  /**
   * Obtener contador de favoritos
   */
  const getFavoriteCount = useCallback((): number => {
    return favorites.length;
  }, [favorites]);

  /**
   * Limpiar todos los favoritos
   */
  const clearFavorites = async (): Promise<boolean> => {
    try {
      if (isAuthenticated && user) {
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', user.id);

        if (error) {
          console.error('Error clearing favorites from DB:', error);
          toast.error('Error al limpiar favoritos');
          return false;
        }
      }

      setFavorites([]);
      saveFavoritesToLocalStorage([]);
      toast.success('Favoritos limpiados');
      return true;
    } catch (error) {
      console.error('Error clearing favorites:', error);
      toast.error('Error al limpiar favoritos');
      return false;
    }
  };

  return {
    favorites,
    isLoading,
    toggleFavorite,
    isFavorite,
    getFavoriteIds,
    getFavoriteCount,
    clearFavorites,
    addFavorite,
    removeFavorite
  };
};

