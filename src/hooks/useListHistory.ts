import { useState, useEffect } from 'react';
import { useAuth } from '../features/auth/hooks/useAuth';
import { supabase } from '../lib/supabase';

const STORAGE_KEY = 'shoppingListHistory';
const MAX_LISTS = 10;
const MAX_DEMO_LISTS = 3;

export interface SavedList {
  id: string;
  nombre: string;
  fecha: string;
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
  dias: number;
  personas: number;
  tipo?: 'IA' | 'Manual'; // Tipo de lista: generada con IA o creada manualmente
  resultado?: any; // Datos completos del resultado para migración
}

export const useListHistory = () => {
  const [savedLists, setSavedLists] = useState<SavedList[]>([]);
  const { user, isAuthenticated } = useAuth();

  // Cargar listas al montar y cuando cambie el estado de autenticación
  useEffect(() => {
    loadLists();
  }, [isAuthenticated, user]);

  const loadLists = async () => {
    try {
      if (isAuthenticated && user) {
        // Usuario autenticado: cargar desde BD
        await loadListsFromDB();
      } else {
        // Usuario Demo: cargar desde localStorage
        loadListsFromLocalStorage();
      }
    } catch (error) {
      console.error('Error al cargar listas:', error);
    }
  };

  const loadListsFromDB = async () => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from('listas_compra')
        .select(`
          id_lista,
          nombre_lista,
          created_at,
          presupuesto_total,
          num_personas,
          dias_duracion,
          tipo_comidas,
          productos_basicos,
          productos_adicionales
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(MAX_LISTS);

      if (error) throw error;

      // Transformar datos de BD a formato SavedList
      const lists: SavedList[] = (data || []).map(lista => ({
        id: lista.id_lista,
        nombre: lista.nombre_lista,
        fecha: lista.created_at,
        productos: [], // Se cargarían desde items_lista si es necesario
        menus: {},
        presupuesto_estimado: lista.presupuesto_total || 0,
        recomendaciones: [],
        dias: lista.dias_duracion || 7,
        personas: lista.num_personas || 1,
        tipo: 'IA' as const,
      }));

      setSavedLists(lists);
    } catch (error) {
      console.error('Error loading lists from DB:', error);
      // Fallback a localStorage si falla BD
      loadListsFromLocalStorage();
    }
  };

  const loadListsFromLocalStorage = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const lists = JSON.parse(stored);
        // Limitar a MAX_DEMO_LISTS en modo demo
        const limitedLists = lists.slice(0, MAX_DEMO_LISTS);
        setSavedLists(limitedLists);
      } else {
        setSavedLists([]);
      }
    } catch (error) {
      console.error('Error al cargar listas desde localStorage:', error);
      setSavedLists([]);
    }
  };

  const saveList = async (resultado: any, nombre?: string): Promise<string> => {
    try {
      if (isAuthenticated && user) {
        // Usuario autenticado: guardar en BD
        return await saveListToDB(resultado, nombre);
      } else {
        // Usuario Demo: guardar en localStorage (máximo 3)
        return saveListToLocalStorage(resultado, nombre);
      }
    } catch (error) {
      console.error('Error al guardar lista:', error);
      throw new Error('No se pudo guardar la lista');
    }
  };

  const saveListToDB = async (resultado: any, nombre?: string): Promise<string> => {
    try {
      if (!user) throw new Error('Usuario no autenticado');

      const defaultName = `Lista del ${new Date().toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`;

      const listaData = {
        nombre_lista: nombre || resultado.lista?.nombre || defaultName,
        descripcion: resultado.lista?.descripcion || null,
        num_personas: resultado.lista?.num_personas || 1,
        dias_duracion: resultado.lista?.dias_duracion || Object.keys(resultado.menus || {}).length || 7,
        presupuesto_total: resultado.presupuesto_estimado || 0,
        presupuesto_usado: resultado.presupuesto_estimado || 0,
        tipo_comidas: resultado.lista?.tipo_comidas || null,
        productos_basicos: resultado.lista?.productos_basicos || null,
        productos_adicionales: resultado.lista?.productos_adicionales || null,
        completada: false,
        fecha_compra: null,
        notas: null,
        user_id: user.id,
      };

      const { data: listaInsertada, error: listaError } = await supabase
        .from('listas_compra')
        .insert(listaData)
        .select()
        .single();

      if (listaError) throw listaError;

      // Insertar productos si existen
      if (resultado.productos && resultado.productos.length > 0) {
        const itemsData = resultado.productos.map((producto: any) => ({
          id_lista: listaInsertada.id_lista,
          id_producto: producto.id_producto,
          cantidad: producto.cantidad,
          precio_unitario: producto.precio_unitario,
          comprado: false,
          notas: null,
        }));

        const { error: itemsError } = await supabase
          .from('items_lista')
          .insert(itemsData);

        if (itemsError) console.error('Error inserting items:', itemsError);
      }

      // Recargar listas
      await loadListsFromDB();

      return listaInsertada.id_lista;
    } catch (error) {
      console.error('Error saving list to DB:', error);
      throw error;
    }
  };

  const saveListToLocalStorage = (resultado: any, nombre?: string): string => {
    try {
      // Verificar límite de 3 listas en modo Demo
      const stored = localStorage.getItem(STORAGE_KEY);
      let lists: SavedList[] = stored ? JSON.parse(stored) : [];

      if (lists.length >= MAX_DEMO_LISTS) {
        throw new Error(`DEMO_LIMIT:Alcanzaste el límite de ${MAX_DEMO_LISTS} listas en modo Demo. Regístrate para listas ilimitadas.`);
      }

      const defaultName = `Lista del ${new Date().toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`;

      const newList: SavedList = {
        id: `list_${Date.now()}`,
        nombre: nombre || resultado.lista?.nombre || defaultName,
        fecha: new Date().toISOString(),
        productos: resultado.productos,
        menus: resultado.menus,
        presupuesto_estimado: resultado.presupuesto_estimado,
        recomendaciones: resultado.recomendaciones,
        dias: resultado.lista?.dias_duracion || Object.keys(resultado.menus || {}).length || 7,
        personas: resultado.lista?.num_personas || resultado.lista?.personas || 1,
        tipo: resultado.tipo || (Object.keys(resultado.menus || {}).length > 0 ? 'IA' : 'Manual'),
        resultado: resultado, // Guardar resultado completo para migración
      };

      lists.unshift(newList);
      lists = lists.slice(0, MAX_DEMO_LISTS);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
      setSavedLists(lists);

      return newList.id;
    } catch (error) {
      console.error('Error saving list to localStorage:', error);
      throw error;
    }
  };

  const deleteList = async (listId: string) => {
    try {
      if (isAuthenticated && user) {
        // Usuario autenticado: eliminar de BD
        await deleteListFromDB(listId);
      } else {
        // Usuario Demo: eliminar de localStorage
        deleteListFromLocalStorage(listId);
      }
    } catch (error) {
      console.error('Error al eliminar lista:', error);
      throw new Error('No se pudo eliminar la lista');
    }
  };

  const deleteListFromDB = async (listId: string) => {
    try {
      const { error } = await supabase
        .from('listas_compra')
        .delete()
        .eq('id_lista', listId)
        .eq('user_id', user?.id);

      if (error) throw error;

      // Recargar listas
      await loadListsFromDB();
    } catch (error) {
      console.error('Error deleting list from DB:', error);
      throw error;
    }
  };

  const deleteListFromLocalStorage = (listId: string) => {
    try {
      const lists = savedLists.filter(list => list.id !== listId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
      setSavedLists(lists);
    } catch (error) {
      console.error('Error deleting list from localStorage:', error);
      throw error;
    }
  };

  const getList = (listId: string): SavedList | undefined => {
    return savedLists.find(list => list.id === listId);
  };

  const updateListName = async (listId: string, newName: string) => {
    try {
      if (isAuthenticated && user) {
        // Usuario autenticado: actualizar en BD
        await updateListNameInDB(listId, newName);
      } else {
        // Usuario Demo: actualizar en localStorage
        updateListNameInLocalStorage(listId, newName);
      }
    } catch (error) {
      console.error('Error al actualizar nombre:', error);
      throw new Error('No se pudo actualizar el nombre');
    }
  };

  const updateListNameInDB = async (listId: string, newName: string) => {
    try {
      const { error } = await supabase
        .from('listas_compra')
        .update({ nombre_lista: newName })
        .eq('id_lista', listId)
        .eq('user_id', user?.id);

      if (error) throw error;

      // Recargar listas
      await loadListsFromDB();
    } catch (error) {
      console.error('Error updating list name in DB:', error);
      throw error;
    }
  };

  const updateListNameInLocalStorage = (listId: string, newName: string) => {
    try {
      const lists = savedLists.map(list =>
        list.id === listId ? { ...list, nombre: newName } : list
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
      setSavedLists(lists);
    } catch (error) {
      console.error('Error updating list name in localStorage:', error);
      throw error;
    }
  };

  const clearAllLists = async () => {
    try {
      if (isAuthenticated && user) {
        // Usuario autenticado: eliminar todas sus listas de BD
        const { error } = await supabase
          .from('listas_compra')
          .delete()
          .eq('user_id', user.id);

        if (error) throw error;
        
        setSavedLists([]);
      } else {
        // Usuario Demo: limpiar localStorage
        localStorage.removeItem(STORAGE_KEY);
        setSavedLists([]);
      }
    } catch (error) {
      console.error('Error al limpiar listas:', error);
      throw new Error('No se pudieron limpiar las listas');
    }
  };

  return {
    savedLists,
    saveList,
    deleteList,
    getList,
    updateListName,
    clearAllLists,
    loadLists,
  };
};
