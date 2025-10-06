import { useState, useEffect, useCallback } from 'react';
import { supabase, normalizeText } from '../lib/supabase';
import type { CartProduct, ProductFilters, Category } from '../types/cart.types';

export const useProducts = () => {
  const [products, setProducts] = useState<CartProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
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

      // LÓGICA NUEVA: Priorizar búsqueda sobre filtros de categoría
      if (filters.searchTerm) {
        // MODO BÚSQUEDA: Buscar en TODOS los productos
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
          .eq('activo', true)
          .order('nombre_producto', { ascending: true })
          .limit(1000); // Traer hasta 1000 productos para búsqueda

        const { data: productosRaw, error } = await query;

        if (error) throw error;

        let productos = productosRaw || [];

        // 1. Filtrar por búsqueda con normalización
        const searchNormalized = normalizeText(filters.searchTerm);
        productos = productos.filter((p: any) =>
          normalizeText(p.nombre_producto).includes(searchNormalized)
        );

        // 2. Aplicar filtros adicionales (refinamiento opcional)
        if (filters.categoriaId) {
          productos = productos.filter((p: any) =>
            p.subcategorias?.categorias?.id_categoria === filters.categoriaId
          );
        }

        if (filters.subcategoriaId) {
          productos = productos.filter((p: any) =>
            p.subcategorias?.id_subcategoria === filters.subcategoriaId
          );
        }

        if (filters.precioMin !== undefined) {
          productos = productos.filter((p: any) => p.precio_por_unidad >= filters.precioMin!);
        }

        if (filters.precioMax !== undefined) {
          productos = productos.filter((p: any) => p.precio_por_unidad <= filters.precioMax!);
        }

        // 3. Aplicar ordenamiento
        if (filters.ordenarPor) {
          switch (filters.ordenarPor) {
            case 'precio_asc':
              productos.sort((a: any, b: any) => a.precio_por_unidad - b.precio_por_unidad);
              break;
            case 'precio_desc':
              productos.sort((a: any, b: any) => b.precio_por_unidad - a.precio_por_unidad);
              break;
            case 'nombre_asc':
              productos.sort((a: any, b: any) => a.nombre_producto.localeCompare(b.nombre_producto));
              break;
            case 'nombre_desc':
              productos.sort((a: any, b: any) => b.nombre_producto.localeCompare(a.nombre_producto));
              break;
          }
        }

        const totalCount = productos.length;

        // 4. Paginación
        const paginatedProducts = productos.slice(offsetNum, offsetNum + pageSize);

        // 5. Transformar productos
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

      } else {
        // MODO SIN BÚSQUEDA: Aplicar filtros tradicionales en BD
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

        // Aplicar filtros de categoría/subcategoría
        if (filters.categoriaId) {
          query = query.eq('subcategorias.categorias.id_categoria', filters.categoriaId);
        }

        if (filters.subcategoriaId) {
          query = query.eq('subcategorias.id_subcategoria', filters.subcategoriaId);
        }

        if (filters.precioMin !== undefined) {
          query = query.gte('precio_por_unidad', filters.precioMin);
        }

        if (filters.precioMax !== undefined) {
          query = query.lte('precio_por_unidad', filters.precioMax);
        }

        // Ordenamiento
        const orderField = filters.ordenarPor?.includes('precio') ? 'precio_por_unidad' : 'nombre_producto';
        const orderAsc = !filters.ordenarPor?.includes('desc');

        query = query
          .order(orderField, { ascending: orderAsc })
          .range(offsetNum, offsetNum + pageSize - 1);

        const { data: productosRaw, error, count } = await query;

        if (error) throw error;

        // Transformar productos
        const transformedProducts = (productosRaw || []).map((producto: any) => ({
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
        setTotalItems(count || 0);
        setTotalPages(Math.ceil((count || 0) / pageSize));
        setCurrentPage(page);
      }
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
    fetchProducts,
    searchProducts,
    filterByCategory,
    filterBySubcategory,
    filterByPrice,
    changePage,
    resetFilters,
  };
};
