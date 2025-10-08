import { useState, useEffect, useCallback } from 'react';
import { supabase, normalizeText } from '../lib/supabase';
import { fuzzySearchProducts, getSuggestions, hasTypo } from '../utils/fuzzySearch';
import type { CartProduct, ProductFilters, Category } from '../types/cart.types';

export const useProducts = () => {
  const [products, setProducts] = useState<CartProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const pageSize = 24; // 24 productos por página (grid 4x6)

  // Cargar categorías al montar
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categorias')
        .select(`
          id_categoria,
          nombre_categoria,
          subcategorias (
            id_subcategoria,
            id_categoria,
            nombre_subcategoria
          )
        `)
        .order('nombre_categoria');

      if (error) throw error;

      setCategories(data as Category[] || []);
    } catch (err: any) {
      console.error('Error al cargar categorías:', err);
      setError(err.message);
    }
  };

  const fetchProducts = useCallback(async (filters: ProductFilters = {}, page: number = 1) => {
    setLoading(true);
    setError(null);

    try {
      const offsetNum = (page - 1) * pageSize;

      // BÚSQUEDA OPTIMIZADA: Usar SQL con ILIKE para búsqueda case-insensitive
      let query = supabase
        .from('productos')
        .select(`
          id_producto,
          nombre_producto,
          formato_venta,
          precio_formato_venta,
          unidad_medida,
          precio_por_unidad,
          cantidad_unidad_medida,
          url_enlace,
          imagen_url,
          subcategorias!inner(
            id_subcategoria,
            nombre_subcategoria,
            categorias!inner(
              id_categoria,
              nombre_categoria
            )
          )
        `, { count: 'exact' })
        .eq('activo', true);

      // 1. BÚSQUEDA POR TÉRMINO (multi-palabra + coincidencia parcial)
      if (filters.searchTerm && filters.searchTerm.trim()) {
        const searchTerm = normalizeText(filters.searchTerm.trim());

        // Búsqueda multi-palabra: "Bote Garban" → buscar productos que contengan ambas palabras
        const palabras = searchTerm.split(/\s+/).filter(p => p.length > 0);

        if (palabras.length === 1) {
          // Búsqueda simple: usar ILIKE para coincidencia parcial
          query = query.ilike('nombre_producto', `%${palabras[0]}%`);
        } else {
          // Búsqueda multi-palabra: filtrar en frontend después (Supabase no soporta AND múltiple con ILIKE)
          // Por ahora buscamos con la primera palabra y refinamos después
          query = query.ilike('nombre_producto', `%${palabras[0]}%`);
        }
      }

      // 2. FILTROS DE CATEGORÍA/SUBCATEGORÍA
      if (filters.categoriaId) {
        query = query.eq('subcategorias.categorias.id_categoria', filters.categoriaId);
      }

      if (filters.subcategoriaId) {
        query = query.eq('subcategorias.id_subcategoria', filters.subcategoriaId);
      }

      // 3. FILTROS DE PRECIO
      if (filters.precioMin !== undefined) {
        query = query.gte('precio_por_unidad', filters.precioMin);
      }

      if (filters.precioMax !== undefined) {
        query = query.lte('precio_por_unidad', filters.precioMax);
      }

      // 4. ORDENAMIENTO (si no hay búsqueda, ordenar por nombre)
      if (!filters.searchTerm) {
        const orderField = filters.ordenarPor?.includes('precio') ? 'precio_por_unidad' : 'nombre_producto';
        const orderAsc = !filters.ordenarPor?.includes('desc');
        query = query.order(orderField, { ascending: orderAsc });
      }

      // Ejecutar query SIN paginación aún (para poder aplicar fuzzy search y priorización)
      const { data: productosRaw, error } = await query;

      if (error) throw error;

      let productos = productosRaw || [];

      // 5. POST-PROCESAMIENTO: Búsqueda multi-palabra y fuzzy matching
      if (filters.searchTerm && filters.searchTerm.trim()) {
        const searchTerm = normalizeText(filters.searchTerm.trim());
        const palabras = searchTerm.split(/\s+/).filter(p => p.length > 0);

        // Si hay múltiples palabras, filtrar productos que contengan TODAS las palabras
        if (palabras.length > 1) {
          productos = productos.filter((p: any) => {
            const nombreNormalizado = normalizeText(p.nombre_producto);
            return palabras.every(palabra => nombreNormalizado.includes(palabra));
          });
        }

        // 5.1. FUZZY SEARCH: Si hay pocos resultados, aplicar búsqueda tolerante a errores
        if (productos.length === 0 || (productos.length < 3 && searchTerm.length >= 3)) {
          // Verificar si probablemente hay un error de escritura
          const tieneErrorEscritura = hasTypo(productosRaw || [], filters.searchTerm);

          if (tieneErrorEscritura) {
            // Aplicar fuzzy search para encontrar productos similares
            productos = fuzzySearchProducts(productosRaw || [], filters.searchTerm, 50);

            // Generar sugerencias de corrección
            const sugerencias = getSuggestions(productosRaw || [], filters.searchTerm, 3);
            setSearchSuggestions(sugerencias);
          }
        } else {
          setSearchSuggestions([]); // Limpiar sugerencias si hay resultados
        }

        // 6. PRIORIZACIÓN DE RESULTADOS
        // Ordenar por relevancia: coincidencia exacta > comienza con > contiene
        productos.sort((a: any, b: any) => {
          const nombreA = normalizeText(a.nombre_producto);
          const nombreB = normalizeText(b.nombre_producto);

          // Coincidencia exacta (máxima prioridad)
          const exactoA = nombreA === searchTerm ? 3 : 0;
          const exactoB = nombreB === searchTerm ? 3 : 0;
          if (exactoA !== exactoB) return exactoB - exactoA;

          // Comienza con el término (segunda prioridad)
          const comienzaA = nombreA.startsWith(searchTerm) ? 2 : 0;
          const comienzaB = nombreB.startsWith(searchTerm) ? 2 : 0;
          if (comienzaA !== comienzaB) return comienzaB - comienzaA;

          // Contiene el término al principio de una palabra (tercera prioridad)
          const palabraA = palabras.some(p => nombreA.startsWith(p)) ? 1 : 0;
          const palabraB = palabras.some(p => nombreB.startsWith(p)) ? 1 : 0;
          if (palabraA !== palabraB) return palabraB - palabraA;

          // Por defecto, orden alfabético
          return nombreA.localeCompare(nombreB);
        });
      } else {
        setSearchSuggestions([]); // Limpiar sugerencias cuando no hay búsqueda
      }

      // 7. CONTEO TOTAL Y PAGINACIÓN
      const totalCount = productos.length;
      const paginatedProducts = productos.slice(offsetNum, offsetNum + pageSize);

      // 8. TRANSFORMAR PRODUCTOS
      const transformedProducts = paginatedProducts.map((producto: any) => ({
        id_producto: producto.id_producto,
        nombre_producto: producto.nombre_producto,
        precio_por_unidad: producto.precio_por_unidad,
        unidad_medida: producto.unidad_medida,
        cantidad_unidad_medida: producto.cantidad_unidad_medida,
        formato_venta: producto.formato_venta,
        precio_formato_venta: producto.precio_formato_venta,
        imagen_url: producto.imagen_url,
        url_enlace: producto.url_enlace,
        nombre_categoria: producto.subcategorias?.categorias?.nombre_categoria || 'Sin categoría',
        nombre_subcategoria: producto.subcategorias?.nombre_subcategoria || 'Sin subcategoría',
      }));

      setProducts(transformedProducts);
      setTotalItems(totalCount);
      setTotalPages(Math.ceil(totalCount / pageSize));
      setCurrentPage(page);

    } catch (err: any) {
      console.error('Error al cargar productos:', err);
      setError(err.message || 'Error al cargar productos');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  const searchProducts = useCallback((searchTerm: string, filters: ProductFilters = {}) => {
    const newFilters = { ...filters, searchTerm };
    fetchProducts(newFilters, 1);
  }, [fetchProducts]);

  const filterByCategory = useCallback((categoriaId: number | undefined, filters: ProductFilters = {}) => {
    const newFilters = { ...filters, categoriaId, subcategoriaId: undefined };
    fetchProducts(newFilters, 1);
  }, [fetchProducts]);

  const filterBySubcategory = useCallback((subcategoriaId: number | undefined, filters: ProductFilters = {}) => {
    const newFilters = { ...filters, subcategoriaId };
    fetchProducts(newFilters, 1);
  }, [fetchProducts]);

  const filterByPrice = useCallback((precioMin: number | undefined, precioMax: number | undefined, filters: ProductFilters = {}) => {
    const newFilters = { ...filters, precioMin, precioMax };
    fetchProducts(newFilters, 1);
  }, [fetchProducts]);

  const changePage = useCallback((page: number, filters: ProductFilters = {}) => {
    if (page >= 1 && page <= totalPages) {
      fetchProducts(filters, page);
    }
  }, [fetchProducts, totalPages]);

  const resetFilters = useCallback(() => {
    fetchProducts({}, 1);
  }, [fetchProducts]);

  return {
    products,
    categories,
    loading,
    error,
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    searchSuggestions,
    fetchProducts,
    searchProducts,
    filterByCategory,
    filterBySubcategory,
    filterByPrice,
    changePage,
    resetFilters,
  };
};
