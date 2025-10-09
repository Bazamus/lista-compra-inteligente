import { useState, useEffect } from 'react';

const STORAGE_KEY = 'shoppingListHistory';
const MAX_LISTS = 10;

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
}

export const useListHistory = () => {
  const [savedLists, setSavedLists] = useState<SavedList[]>([]);

  // Cargar listas del localStorage al montar
  useEffect(() => {
    loadLists();
  }, []);

  const loadLists = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const lists = JSON.parse(stored);
        setSavedLists(lists);
      }
    } catch (error) {
      console.error('Error al cargar listas:', error);
    }
  };

  const saveList = (resultado: any, nombre?: string): string => {
    try {
      // Generar nombre único con timestamp
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
        dias: resultado.lista?.dias || Object.keys(resultado.menus || {}).length || 7,
        personas: resultado.lista?.num_personas || resultado.lista?.personas || 1,
        tipo: resultado.tipo || (Object.keys(resultado.menus || {}).length > 0 ? 'IA' : 'Manual'),
      };

      let lists = [...savedLists];

      // Siempre añadir como nueva lista (sin verificar duplicados)
      lists.unshift(newList);

      // Limitar a MAX_LISTS listas
      if (lists.length > MAX_LISTS) {
        lists = lists.slice(0, MAX_LISTS);
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
      setSavedLists(lists);

      return newList.id;
    } catch (error) {
      console.error('Error al guardar lista:', error);
      throw new Error('No se pudo guardar la lista');
    }
  };

  const deleteList = (listId: string) => {
    try {
      const lists = savedLists.filter(list => list.id !== listId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
      setSavedLists(lists);
    } catch (error) {
      console.error('Error al eliminar lista:', error);
      throw new Error('No se pudo eliminar la lista');
    }
  };

  const getList = (listId: string): SavedList | undefined => {
    return savedLists.find(list => list.id === listId);
  };

  const updateListName = (listId: string, newName: string) => {
    try {
      const lists = savedLists.map(list =>
        list.id === listId ? { ...list, nombre: newName } : list
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
      setSavedLists(lists);
    } catch (error) {
      console.error('Error al actualizar nombre:', error);
      throw new Error('No se pudo actualizar el nombre');
    }
  };

  const clearAllLists = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setSavedLists([]);
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
