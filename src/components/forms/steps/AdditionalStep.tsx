import React from 'react';
import { motion } from 'framer-motion';
import { Package, Check, Sparkles } from 'lucide-react';
import type { FormStepProps } from '../../../types/form.types';
import { ADICIONALES_OPTIONS } from '../../../types/form.types';

const AdditionalStep: React.FC<FormStepProps> = ({ data, updateData }) => {
  const handleAdditionalToggle = (item: string) => {
    const currentAdditionals = data.productosAdicionales || [];
    const updatedAdditionals = currentAdditionals.includes(item)
      ? currentAdditionals.filter(i => i !== item)
      : [...currentAdditionals, item];
    
    updateData({ productosAdicionales: updatedAdditionals });
  };

  const selectedCount = data.productosAdicionales?.length || 0;

  return (
    <div className="space-y-8">
      {/* Información general */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-indigo-200 dark:border-indigo-800"
      >
        <div className="flex items-start gap-4">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-800 rounded-xl">
            <Package className="w-6 h-6 text-indigo-600 dark:text-indigo-300" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Productos adicionales para el hogar
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Aparte de alimentos, ¿necesitas comprar productos de limpieza, higiene u otros artículos para el hogar?
            </p>
            {selectedCount > 0 && (
              <div className="mt-3 text-sm font-medium text-indigo-600 dark:text-indigo-400">
                🏠 {selectedCount} producto{selectedCount !== 1 ? 's' : ''} adicional{selectedCount !== 1 ? 'es' : ''} seleccionado{selectedCount !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Grid de opciones */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
        {ADICIONALES_OPTIONS.map((option, index) => {
          const isSelected = data.productosAdicionales?.includes(String(option.value)) || false;
          
          return (
            <motion.button
              key={option.id}
              onClick={() => handleAdditionalToggle(String(option.value))}
              className={`
                relative p-6 rounded-2xl border-2 text-center transition-all duration-300 group
                ${isSelected
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                }
              `}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Badge popular */}
              {option.popular && (
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-400 to-pink-500 text-white text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
                  <Sparkles size={10} />
                  Esencial
                </div>
              )}

              {/* Contenido */}
              <div className="space-y-3">
                <div className="text-3xl">{option.icon}</div>
                <div className={`text-sm font-medium ${
                  isSelected
                    ? 'text-indigo-700 dark:text-indigo-300'
                    : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {option.label}
                </div>
              </div>

              {/* Indicador de selección */}
              <div className={`mt-3 w-full h-2 rounded-full transition-all duration-300 ${
                isSelected
                  ? 'bg-gradient-to-r from-indigo-400 to-purple-500'
                  : 'bg-gray-200 dark:bg-gray-700 group-hover:bg-gray-300 dark:group-hover:bg-gray-600'
              }`} />

              {/* Checkmark animado */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute top-3 right-3 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center"
                >
                  <Check size={14} className="text-white" />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Sección de personalizados */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 p-6"
      >
        <div className="text-center space-y-4">
          <div className="text-2xl">🛒</div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              ¿Necesitas algo más específico?
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Añade otros productos que necesites para el hogar
            </p>
            <input
              type="text"
              placeholder="Ej: pilas, bombillas, ambientador..."
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 
                         focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                         bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                  const value = e.currentTarget.value.trim();
                  if (!data.productosAdicionales?.includes(value)) {
                    handleAdditionalToggle(value);
                  }
                  e.currentTarget.value = '';
                }
              }}
            />
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              Presiona Enter para añadir
            </p>
          </div>
        </div>
      </motion.div>

      {/* Productos personalizados añadidos */}
      {data.productosAdicionales?.some(item => !ADICIONALES_OPTIONS.find(opt => opt.value === item)) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-4 border border-purple-200 dark:border-purple-800"
        >
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
            Productos personalizados añadidos:
          </h4>
          <div className="flex flex-wrap gap-2">
            {data.productosAdicionales
              ?.filter(item => !ADICIONALES_OPTIONS.find(opt => opt.value === item))
              .map((item, index) => (
                <motion.span
                  key={item}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 dark:bg-purple-800 
                           text-purple-700 dark:text-purple-300 rounded-full text-sm"
                >
                  <span>🏠 {item}</span>
                  <button
                    onClick={() => handleAdditionalToggle(item)}
                    className="hover:bg-purple-200 dark:hover:bg-purple-700 rounded-full p-0.5"
                  >
                    ×
                  </button>
                </motion.span>
              ))}
          </div>
        </motion.div>
      )}

      {/* Categorías sugeridas */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
          <div className="text-center">
            <div className="text-2xl mb-2">🧽</div>
            <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">Limpieza</h4>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              Detergentes, limpiacristales, bayetas
            </p>
          </div>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
          <div className="text-center">
            <div className="text-2xl mb-2">🚿</div>
            <h4 className="font-semibold text-green-700 dark:text-green-300 mb-2">Higiene</h4>
            <p className="text-xs text-green-600 dark:text-green-400">
              Champú, gel, pasta de dientes
            </p>
          </div>
        </div>
        
        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 border border-orange-200 dark:border-orange-800">
          <div className="text-center">
            <div className="text-2xl mb-2">🏠</div>
            <h4 className="font-semibold text-orange-700 dark:text-orange-300 mb-2">Hogar</h4>
            <p className="text-xs text-orange-600 dark:text-orange-400">
              Pilas, bombillas, artículos varios
            </p>
          </div>
        </div>
      </motion.div>

      {/* Resumen y consejos */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center text-sm text-gray-500 dark:text-gray-400 space-y-2"
      >
        <div>
          💡 <strong>Consejo:</strong> Este paso es opcional. Solo añade productos que realmente necesites.
        </div>
        {selectedCount === 0 ? (
          <div className="text-gray-400 dark:text-gray-500">
            ⏭️ Solo alimentos? Perfecto, puedes continuar
          </div>
        ) : (
          <div className="text-indigo-600 dark:text-indigo-400">
            🛒 {selectedCount} producto{selectedCount !== 1 ? 's' : ''} adicional{selectedCount !== 1 ? 'es' : ''} para el hogar
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AdditionalStep;
