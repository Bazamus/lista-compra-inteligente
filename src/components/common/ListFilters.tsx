import { useState } from 'react';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ListFilters as ListFiltersType, SortOption } from '../../hooks/useListHistory';
import { FILTER_PRESETS } from '../../hooks/useListHistory';

interface ListFiltersProps {
  onFiltersChange: (filters: ListFiltersType) => void;
  onSortChange: (sort: SortOption) => void;
  currentFilters: ListFiltersType;
  currentSort: SortOption;
  totalLists: number;
  filteredCount: number;
}

export const ListFilters = ({
  onFiltersChange,
  onSortChange,
  currentFilters,
  currentSort,
  totalLists,
  filteredCount
}: ListFiltersProps) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState(currentFilters.busqueda || '');

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    onFiltersChange({ ...currentFilters, busqueda: value || null });
  };

  const handleTipoChange = (tipo: 'IA' | 'Manual' | null) => {
    onFiltersChange({ ...currentFilters, tipo });
  };

  const handlePresetFilter = (preset: keyof typeof FILTER_PRESETS) => {
    if (preset === 'today' || preset === 'thisWeek' || preset === 'thisMonth') {
      onFiltersChange({
        ...currentFilters,
        ...FILTER_PRESETS[preset]
      });
    }
  };

  const handleBudgetPreset = (preset: 'low' | 'medium' | 'high' | 'veryHigh') => {
    onFiltersChange({
      ...currentFilters,
      ...FILTER_PRESETS.budget[preset]
    });
  };

  const handleProductsPreset = (preset: 'few' | 'medium' | 'many') => {
    onFiltersChange({
      ...currentFilters,
      ...FILTER_PRESETS.products[preset]
    });
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    onFiltersChange({});
    onSortChange('fecha_desc');
    setShowAdvancedFilters(false);
  };

  const hasActiveFilters = 
    currentFilters.tipo ||
    currentFilters.busqueda ||
    currentFilters.fechaInicio ||
    currentFilters.fechaFin ||
    currentFilters.presupuestoMin !== null ||
    currentFilters.presupuestoMax !== null ||
    currentFilters.productosMin !== null ||
    currentFilters.productosMax !== null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 space-y-4">
      {/* Barra principal de búsqueda y filtros rápidos */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Búsqueda */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar lista por nombre..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                     focus:ring-2 focus:ring-green-500 focus:border-transparent
                     dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Filtro por tipo */}
        <div className="flex gap-2">
          <button
            onClick={() => handleTipoChange(currentFilters.tipo === 'IA' ? null : 'IA')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              currentFilters.tipo === 'IA'
                ? 'bg-purple-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            🤖 IA
          </button>
          <button
            onClick={() => handleTipoChange(currentFilters.tipo === 'Manual' ? null : 'Manual')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              currentFilters.tipo === 'Manual'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            ✏️ Manual
          </button>
        </div>

        {/* Ordenamiento */}
        <div className="relative">
          <select
            value={currentSort}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="appearance-none pl-4 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                     focus:ring-2 focus:ring-green-500 focus:border-transparent
                     dark:bg-gray-700 dark:text-white cursor-pointer"
          >
            <option value="fecha_desc">📅 Más reciente</option>
            <option value="fecha_asc">📅 Más antigua</option>
            <option value="presupuesto_desc">💰 Mayor presupuesto</option>
            <option value="presupuesto_asc">💰 Menor presupuesto</option>
            <option value="productos_desc">📦 Más productos</option>
            <option value="productos_asc">📦 Menos productos</option>
            <option value="nombre_asc">🔤 Alfabético A-Z</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>

        {/* Botón filtros avanzados */}
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            showAdvancedFilters
              ? 'bg-green-500 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          <Filter className="w-5 h-5" />
          <span className="hidden sm:inline">Filtros</span>
          {hasActiveFilters && (
            <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              !
            </span>
          )}
        </button>
      </div>

      {/* Contador de resultados */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600 dark:text-gray-400">
          Mostrando {filteredCount} de {totalLists} listas
        </span>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-1 text-red-500 hover:text-red-700 font-medium"
          >
            <X className="w-4 h-4" />
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Filtros avanzados (expandibles) */}
      <AnimatePresence>
        {showAdvancedFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
              {/* Filtros de fecha rápidos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  📅 Rango de fechas
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handlePresetFilter('today')}
                    className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    Hoy
                  </button>
                  <button
                    onClick={() => handlePresetFilter('thisWeek')}
                    className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    Última semana
                  </button>
                  <button
                    onClick={() => handlePresetFilter('thisMonth')}
                    className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    Este mes
                  </button>
                </div>
              </div>

              {/* Filtros de presupuesto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  💰 Presupuesto
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleBudgetPreset('low')}
                    className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    Bajo (&lt; 20€)
                  </button>
                  <button
                    onClick={() => handleBudgetPreset('medium')}
                    className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    Medio (20€ - 50€)
                  </button>
                  <button
                    onClick={() => handleBudgetPreset('high')}
                    className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    Alto (50€ - 100€)
                  </button>
                  <button
                    onClick={() => handleBudgetPreset('veryHigh')}
                    className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    Muy alto (&gt; 100€)
                  </button>
                </div>
              </div>

              {/* Filtros de productos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  📦 Número de productos
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleProductsPreset('few')}
                    className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    Pocos (&lt; 10)
                  </button>
                  <button
                    onClick={() => handleProductsPreset('medium')}
                    className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    Medio (11-30)
                  </button>
                  <button
                    onClick={() => handleProductsPreset('many')}
                    className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    Muchos (&gt; 30)
                  </button>
                </div>
              </div>

              {/* Filtros personalizados de presupuesto */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Presupuesto mínimo (€)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={currentFilters.presupuestoMin || ''}
                    onChange={(e) => onFiltersChange({
                      ...currentFilters,
                      presupuestoMin: e.target.value ? Number(e.target.value) : null
                    })}
                    placeholder="Ej: 20"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                             focus:ring-2 focus:ring-green-500 focus:border-transparent
                             dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Presupuesto máximo (€)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={currentFilters.presupuestoMax || ''}
                    onChange={(e) => onFiltersChange({
                      ...currentFilters,
                      presupuestoMax: e.target.value ? Number(e.target.value) : null
                    })}
                    placeholder="Ej: 100"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                             focus:ring-2 focus:ring-green-500 focus:border-transparent
                             dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              {/* Filtros personalizados de productos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Productos mínimos
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={currentFilters.productosMin || ''}
                    onChange={(e) => onFiltersChange({
                      ...currentFilters,
                      productosMin: e.target.value ? Number(e.target.value) : null
                    })}
                    placeholder="Ej: 5"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                             focus:ring-2 focus:ring-green-500 focus:border-transparent
                             dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Productos máximos
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={currentFilters.productosMax || ''}
                    onChange={(e) => onFiltersChange({
                      ...currentFilters,
                      productosMax: e.target.value ? Number(e.target.value) : null
                    })}
                    placeholder="Ej: 20"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                             focus:ring-2 focus:ring-green-500 focus:border-transparent
                             dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

