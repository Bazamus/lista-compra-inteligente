import React, { useState, useEffect } from 'react';
import { Search, X, RefreshCw } from 'lucide-react';
import type { Category, ProductFilters as Filters } from '../../types/cart.types';

// Función para obtener emoji por categoría
const getCategoryEmoji = (categoria: string): string => {
  const emojis: Record<string, string> = {
    'Aceite, especias y salsas': '🫒',
    'Agua y refrescos': '💧',
    'Aperitivos': '🍿',
    'Arroz, legumbres y pasta': '🍚',
    'Azúcar, caramelos y chocolate': '🍫',
    'Bebé': '👶',
    'Bodega': '🍷',
    'Cacao, café e infusiones': '☕',
    'Carne': '🥩',
    'Cereales y galletas': '🍪',
    'Charcutería y quesos': '🧀',
    'Congelados': '🧊',
    'Conservas, caldos y cremas': '🥫',
    'Cuidado del cabello': '💆',
    'Cuidado facial y corporal': '🧴',
    'Droguería y parafarmacia': '💊',
    'Frescos': '🥗',
    'Huevos, leche y mantequilla': '🥛',
    'Limpieza': '🧽',
    'Panadería y pastelería': '🍞',
    'Pescado': '🐟',
    'Platos preparados': '🍱',
    'Yogures y postres': '🍮',
  };
  return emojis[categoria] || '📦';
};

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
        // Cuando el usuario escribe una búsqueda, NO limpiamos los filtros
        // La nueva lógica del backend los aplicará como refinamiento
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
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
      {/* Título del sidebar - Solo en desktop */}
      <div className="hidden lg:block mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Search className="w-5 h-5 text-blue-600" />
          Filtrar Productos
        </h2>
      </div>

      {/* Layout: Vertical en Desktop, Stack en Mobile */}
      <div className="space-y-4">
        {/* Búsqueda */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Buscar
          </label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nombre del producto..."
              className="w-full pl-12 pr-12 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all text-sm"
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
          {searchTerm && (filters.categoriaId || filters.subcategoriaId) && (
            <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-xs text-blue-700 dark:text-blue-400">
                💡 Buscando en todos los productos. Los filtros de categoría refinarán los resultados.
              </p>
            </div>
          )}
        </div>

        {/* Categoría */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Categoría
          </label>
          <select
            value={selectedCategory || ''}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all cursor-pointer text-sm"
          >
            <option value="">📂 Todas las categorías</option>
            {categories.map((cat) => (
              <option key={cat.id_categoria} value={cat.id_categoria}>
                {getCategoryEmoji(cat.nombre_categoria)} {cat.nombre_categoria}
              </option>
            ))}
          </select>
        </div>

        {/* Subcategoría */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Subcategoría
          </label>
          <select
            value={filters.subcategoriaId || ''}
            onChange={(e) => handleSubcategoryChange(e.target.value)}
            disabled={!selectedCategory}
            className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            <option value="">🏷️ Todas las subcategorías</option>
            {subcategories.map((subcat) => (
              <option key={subcat.id_subcategoria} value={subcat.id_subcategoria}>
                {subcat.nombre_subcategoria}
              </option>
            ))}
          </select>
        </div>

        {/* Rango de Precio */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Rango de Precio
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <input
                type="number"
                value={precioMin}
                onChange={(e) => setPrecioMin(e.target.value)}
                onBlur={handlePriceChange}
                placeholder="Mín €"
                className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all text-sm"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <input
                type="number"
                value={precioMax}
                onChange={(e) => setPrecioMax(e.target.value)}
                onBlur={handlePriceChange}
                placeholder="Máx €"
                className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all text-sm"
                min="0"
                step="0.01"
              />
            </div>
          </div>
        </div>

        {/* Botón Reset - Full Width */}
        {hasActiveFilters && (
          <button
            onClick={handleResetFilters}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500 rounded-xl transition-all duration-200 text-gray-700 dark:text-gray-300 font-semibold shadow-sm hover:shadow-md text-sm"
            title="Limpiar todos los filtros"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Limpiar Filtros</span>
          </button>
        )}

        {/* Indicador de filtros activos */}
        {hasActiveFilters && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">
              Filtros Activos
            </p>
            <div className="flex flex-col gap-2">
              {filters.categoriaId && (
                <div className="px-3 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 rounded-lg text-sm">
                  <span className="font-medium">Categoría:</span>{' '}
                  {categories.find(c => c.id_categoria === filters.categoriaId)?.nombre_categoria}
                </div>
              )}
              {filters.subcategoriaId && (
                <div className="px-3 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 rounded-lg text-sm">
                  <span className="font-medium">Subcategoría:</span>{' '}
                  {subcategories.find(s => s.id_subcategoria === filters.subcategoriaId)?.nombre_subcategoria}
                </div>
              )}
              {(filters.precioMin || filters.precioMax) && (
                <div className="px-3 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 rounded-lg text-sm">
                  <span className="font-medium">Precio:</span>{' '}
                  {filters.precioMin && `${filters.precioMin}€`}
                  {filters.precioMin && filters.precioMax && ' - '}
                  {filters.precioMax && `${filters.precioMax}€`}
                </div>
              )}
              {filters.searchTerm && (
                <div className="px-3 py-2 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-400 rounded-lg text-sm">
                  <span className="font-medium">Búsqueda:</span> "{filters.searchTerm}"
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductFilters;
