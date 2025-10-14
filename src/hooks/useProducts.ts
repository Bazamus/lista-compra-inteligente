import { useState, useEffect, useCallback } from 'react';
import { categoriasApi, productosApi, type Categoria } from '../lib/api';
import type { CartProduct, ProductFilters, Category } from '../types/cart.types';

export const useProducts = () => {
  const [products, setProducts] = useState<CartProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchSuggestions] = useState<string[]>([]);
  const pageSize = 24; // 24 productos por página (grid 4x6)

  // Cargar categorías al montar
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      console.log('🔄 loadCategories: Cargando categorías...');
      const response = await categoriasApi.obtenerTodas();
      console.log('✅ Categorías cargadas:', response.categorias?.length || 0);
      // Convertir Categoria[] a Category[] para compatibilidad
      const categoriesFormatted: Category[] = (response.categorias || []).map((cat: Categoria) => ({
        id_categoria: cat.id_categoria,
        nombre_categoria: cat.nombre_categoria,
        subcategorias: cat.subcategorias?.map((sub: any) => ({
          id_subcategoria: sub.id_subcategoria,
          id_categoria: sub.categorias?.id_categoria || cat.id_categoria,
          nombre_subcategoria: sub.nombre_subcategoria,
        })),
      }));
      setCategories(categoriesFormatted);
    } catch (err: any) {
      console.error('❌ Error al cargar categorías:', err);
      setError(err.message);
    }
  };

  const fetchProducts = useCallback(async (filters: ProductFilters = {}, page: number = 1) => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 fetchProducts: Cargando productos...', { filters, page });
      
      const offsetNum = (page - 1) * pageSize;
      const hasSearchTerm = filters.searchTerm && filters.searchTerm.trim().length > 0;

      // Usar la API de productos con autenticación
      const apiFilters = {
        search: hasSearchTerm ? filters.searchTerm : undefined,
        categoria: filters.categoriaId ? categories.find(c => c.id_categoria === filters.categoriaId)?.nombre_categoria : undefined,
        precio_min: filters.precioMin,
        precio_max: filters.precioMax,
        limit: pageSize,
        offset: offsetNum,
      };

      console.log('📡 Llamando a productosApi.obtener con filtros:', apiFilters);
      const response = await productosApi.obtener(apiFilters);
      
      console.log('✅ Productos obtenidos:', response.productos?.length || 0);
      console.log('📊 Paginación:', response.pagination);

      // Procesar productos para el formato esperado
      const productos = response.productos.map((producto: any) => ({
        id_producto: producto.id_producto,
        nombre_producto: producto.nombre_producto,
        formato_venta: producto.formato_venta,
        precio_formato_venta: producto.precio_formato_venta,
        unidad_medida: producto.unidad_medida,
        precio_por_unidad: producto.precio_por_unidad,
        cantidad_unidad_medida: producto.cantidad_unidad_medida,
        url_enlace: producto.url_enlace,
        imagen_url: producto.imagen_url,
        nombre_categoria: producto.subcategorias?.categorias?.nombre_categoria || 'Sin categoría',
        nombre_subcategoria: producto.subcategorias?.nombre_subcategoria || 'Sin subcategoría',
      }));

      setProducts(productos);
      setCurrentPage(page);
      setTotalPages(Math.ceil(response.pagination.total / pageSize));
      setTotalItems(response.pagination.total);
      setLoading(false);

    } catch (err: any) {
      console.error('❌ Error al cargar productos:', err);
      setError(err.message || 'Error al cargar productos');
      setLoading(false);
    }
  }, [categories]);

  const changePage = useCallback((page: number, filters: ProductFilters) => {
    fetchProducts(filters, page);
  }, [fetchProducts]);

  return {
    products,
    categories,
    loading,
    error,
    currentPage,
    totalPages,
    totalItems,
    searchSuggestions,
    fetchProducts,
    changePage,
  };
};