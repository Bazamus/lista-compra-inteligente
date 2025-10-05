import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
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
  const [showFilters, setShowFilters] = useState(false);

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
      subcategoriaId: undefined, // Resetear subcategoría
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
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-6">
      {/* Barra de búsqueda y toggle filtros */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        {/* Búsqueda */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar productos..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Botón mostrar/ocultar filtros */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
        >
          <SlidersHorizontal className="w-5 h-5" />
          <span className="font-medium">Filtros</span>
          {hasActiveFilters && (
            <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
              {[filters.categoriaId, filters.subcategoriaId, filters.precioMin, filters.precioMax].filter(Boolean).length}
            </span>
          )}
        </button>
      </div>

      {/* Panel de filtros */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Categoría
            </label>
            <select
              value={selectedCategory || ''}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Todas</option>
              {categories.map((cat) => (
                <option key={cat.id_categoria} value={cat.id_categoria}>
                  {cat.nombre_categoria}
                </option>
              ))}
            </select>
          </div>

          {/* Subcategoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Subcategoría
            </label>
            <select
              value={filters.subcategoriaId || ''}
              onChange={(e) => handleSubcategoryChange(e.target.value)}
              disabled={!selectedCategory}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Todas</option>
              {subcategories.map((subcat) => (
                <option key={subcat.id_subcategoria} value={subcat.id_subcategoria}>
                  {subcat.nombre_subcategoria}
                </option>
              ))}
            </select>
          </div>

          {/* Precio mínimo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Precio Mín. (€)
            </label>
            <input
              type="number"
              value={precioMin}
              onChange={(e) => setPrecioMin(e.target.value)}
              onBlur={handlePriceChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Precio máximo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Precio Máx. (€)
            </label>
            <input
              type="number"
              value={precioMax}
              onChange={(e) => setPrecioMax(e.target.value)}
              onBlur={handlePriceChange}
              placeholder="100.00"
              step="0.01"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Botón limpiar filtros */}
          {hasActiveFilters && (
            <div className="md:col-span-4 flex justify-end">
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
                <span>Limpiar filtros</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductFilters;
