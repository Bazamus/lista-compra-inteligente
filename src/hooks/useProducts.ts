import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import type { CartProduct, ProductFilters, Category } from '../types/cart.types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

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
      const response = await axios.get(`${API_BASE_URL}/categorias`);
      setCategories(response.data.categorias || []);
    } catch (err) {
      console.error('Error al cargar categorías:', err);
    }
  };

  const fetchProducts = useCallback(async (filters: ProductFilters = {}, page: number = 1) => {
    setLoading(true);
    setError(null);

    try {
      const params: any = {
        limit: pageSize,
        offset: (page - 1) * pageSize,
      };

      if (filters.categoriaId) {
        // Necesitamos obtener el nombre de la categoría
        const category = categories.find(c => c.id_categoria === filters.categoriaId);
        if (category) {
          params.categoria = category.nombre_categoria;
        }
      }

      if (filters.subcategoriaId) {
        // Necesitamos obtener el nombre de la subcategoría
        const category = categories.find(c =>
          c.subcategorias?.some(s => s.id_subcategoria === filters.subcategoriaId)
        );
        const subcategory = category?.subcategorias?.find(s => s.id_subcategoria === filters.subcategoriaId);
        if (subcategory) {
          params.subcategoria = subcategory.nombre_subcategoria;
        }
      }

      if (filters.searchTerm) {
        params.search = filters.searchTerm;
      }

      if (filters.precioMin !== undefined) {
        params.precio_min = filters.precioMin;
      }

      if (filters.precioMax !== undefined) {
        params.precio_max = filters.precioMax;
      }

      const response = await axios.get(`${API_BASE_URL}/productos`, { params });

      // Transformar la respuesta para incluir nombres de categoría y subcategoría
      const transformedProducts = response.data.productos.map((producto: any) => ({
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

      // Aplicar ordenamiento local si es necesario
      let sortedProducts = [...transformedProducts];
      if (filters.ordenarPor) {
        switch (filters.ordenarPor) {
          case 'precio_asc':
            sortedProducts.sort((a, b) => a.precio_por_unidad - b.precio_por_unidad);
            break;
          case 'precio_desc':
            sortedProducts.sort((a, b) => b.precio_por_unidad - a.precio_por_unidad);
            break;
          case 'nombre_asc':
            sortedProducts.sort((a, b) => a.nombre_producto.localeCompare(b.nombre_producto));
            break;
          case 'nombre_desc':
            sortedProducts.sort((a, b) => b.nombre_producto.localeCompare(a.nombre_producto));
            break;
        }
      }

      setProducts(sortedProducts);
      setTotalItems(response.data.pagination?.total || 0);
      setTotalPages(Math.ceil((response.data.pagination?.total || 0) / pageSize));
      setCurrentPage(page);
    } catch (err: any) {
      console.error('Error al cargar productos:', err);
      setError(err.message || 'Error al cargar productos');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [categories, pageSize]);

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
