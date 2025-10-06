import React, { useState, useEffect } from 'react';
import { Search, X, RefreshCw } from 'lucide-react';
import type { Category, ProductFilters as Filters } from '../../types/cart.types';

interface ProductFiltersProps {
  categories: Category[];
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  onSearch: (searchTerm: string) => void;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
  categories,
  filters,
  onFiltersChange,
  onSearch,
}) => {
  const [searchTerm, setSearchTerm] = useState(filters.searchTerm || '');
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(filters.categoriaId);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [precioMin, setPrecioMin] = useState<string>(filters.precioMin?.toString() || '');
  const [precioMax, setPrecioMax] = useState<string>(filters.precioMax?.toString() || '');

  // Actualizar subcategorías cuando cambia la categoría
  useEffect(() => {
    if (selectedCategory) {
      const category = categories.find((c) => c.id_categoria === selectedCategory);
      setSubcategories(category?.subcategorias || []);
    } else {
      setSubcategories([]);
    }
  }, [selectedCategory, categories]);

  // Debounce para búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== filters.searchTerm) {
        onSearch(searchTerm);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleCategoryChange = (catId: string) => {
    const categoryId = catId ? parseInt(catId) : undefined;
    setSelectedCategory(categoryId);
    onFiltersChange({
      ...filters,
      categoriaId: categoryId,
      subcategoriaId: undefined,
    });
  };

  const handleSubcategoryChange = (subId: string) => {
    const subcategoryId = subId ? parseInt(subId) : undefined;
    onFiltersChange({
      ...filters,
      subcategoriaId: subcategoryId,
    });
  };

  const handlePriceChange = () => {
    onFiltersChange({
      ...filters,
      precioMin: precioMin ? parseFloat(precioMin) : undefined,
      precioMax: precioMax ? parseFloat(precioMax) : undefined,
    });
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory(undefined);
    setPrecioMin('');
    setPrecioMax('');
    onFiltersChange({});
    onSearch('');
  };

  const hasActiveFilters = filters.categoriaId || filters.subcategoriaId || filters.precioMin || filters.precioMax || filters.searchTerm;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
      {/* Layout Horizontal Desktop */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Búsqueda - Más ancha */}
        <div className="flex-1 lg:flex-[2] relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar productos por nombre..."
            className="w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-base transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('');
                onSearch('');
              }}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Categoría */}
        <div className="flex-1">
          <select
            value={selectedCategory || ''}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full px-4 py-3.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-base transition-all cursor-pointer"
          >
            <option value="">📂 Todas las categorías</option>
            {categories.map((cat) => (
              <option key={cat.id_categoria} value={cat.id_categoria}>
                {cat.nombre_categoria}
              </option>
            ))}
          </select>
        </div>

        {/* Subcategoría */}
        <div className="flex-1">
          <select
            value={filters.subcategoriaId || ''}
            onChange={(e) => handleSubcategoryChange(e.target.value)}
            disabled={!selectedCategory}
            className="w-full px-4 py-3.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-base transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">🏷️ Todas las subcategorías</option>
            {subcategories.map((subcat) => (
              <option key={subcat.id_subcategoria} value={subcat.id_subcategoria}>
                {subcat.nombre_subcategoria}
              </option>
            ))}
          </select>
        </div>

        {/* Precio Mínimo */}
        <div className="w-full lg:w-32">
          <input
            type="number"
            value={precioMin}
            onChange={(e) => {
              setPrecioMin(e.target.value);
            }}
            onBlur={handlePriceChange}
            placeholder="Mín €"
            className="w-full px-4 py-3.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-base transition-all"
            min="0"
            step="0.01"
          />
        </div>

        {/* Precio Máximo */}
        <div className="w-full lg:w-32">
          <input
            type="number"
            value={precioMax}
            onChange={(e) => {
              setPrecioMax(e.target.value);
            }}
            onBlur={handlePriceChange}
            placeholder="Máx €"
            className="w-full px-4 py-3.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-base transition-all"
            min="0"
            step="0.01"
          />
        </div>

        {/* Botón Reset */}
        {hasActiveFilters && (
          <button
            onClick={handleResetFilters}
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-all duration-200 text-gray-700 dark:text-gray-300 font-medium"
            title="Limpiar filtros"
          >
            <RefreshCw className="w-5 h-5" />
            <span className="hidden xl:inline">Limpiar</span>
          </button>
        )}
      </div>

      {/* Indicador de filtros activos */}
      {hasActiveFilters && (
        <div className="mt-4 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium">Filtros activos:</span>
          {filters.categoriaId && (
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full">
              {categories.find(c => c.id_categoria === filters.categoriaId)?.nombre_categoria}
            </span>
          )}
          {filters.subcategoriaId && (
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full">
              {subcategories.find(s => s.id_subcategoria === filters.subcategoriaId)?.nombre_subcategoria}
            </span>
          )}
          {(filters.precioMin || filters.precioMax) && (
            <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
              {filters.precioMin && `Desde ${filters.precioMin}€`}
              {filters.precioMin && filters.precioMax && ' - '}
              {filters.precioMax && `Hasta ${filters.precioMax}€`}
            </span>
          )}
          {filters.searchTerm && (
            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full">
              "{filters.searchTerm}"
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductFilters;
