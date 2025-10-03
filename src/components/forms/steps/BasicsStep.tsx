import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBasket, Check, Star } from 'lucide-react';
import type { FormStepProps } from '../../../types/form.types';
import { BASICOS_OPTIONS } from '../../../types/form.types';

const BasicsStep: React.FC<FormStepProps> = ({ data, updateData }) => {
  const handleBasicToggle = (item: string) => {
    const currentBasics = data.alimentosBasicos || [];
    const updatedBasics = currentBasics.includes(item)
      ? currentBasics.filter(i => i !== item)
      : [...currentBasics, item];
    
    updateData({ alimentosBasicos: updatedBasics });
  };

  const selectedCount = data.alimentosBasicos?.length || 0;

  return (
    <div className="space-y-8">
      {/* Información general */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-6 border border-amber-200 dark:border-amber-800"
      >
        <div className="flex items-start gap-4">
          <div className="p-2 bg-amber-100 dark:bg-amber-800 rounded-xl">
            <ShoppingBasket className="w-6 h-6 text-amber-600 dark:text-amber-300" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Alimentos básicos para tu despensa
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Estos son productos esenciales que solemos tener siempre en casa. 
              Selecciona los que necesitas incluir en tu lista.
            </p>
            {selectedCount > 0 && (
              <div className="mt-3 text-sm font-medium text-amber-600 dark:text-amber-400">
                ✨ {selectedCount} básico{selectedCount !== 1 ? 's' : ''} seleccionado{selectedCount !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Grid de opciones */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {BASICOS_OPTIONS.map((option, index) => {
          const isSelected = data.alimentosBasicos?.includes(String(option.value)) || false;
          
          return (
            <motion.button
              key={option.id}
              onClick={() => handleBasicToggle(String(option.value))}
              className={`
                relative p-6 rounded-2xl border-2 text-center transition-all duration-300 group
                ${isSelected
                  ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/30'
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
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-400 to-pink-500 text-white text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
                  <Star size={10} />
                  Básico
                </div>
              )}

              {/* Contenido */}
              <div className="space-y-3">
                <div className="text-3xl">{option.icon}</div>
                <div className={`text-sm font-medium ${
                  isSelected
                    ? 'text-amber-700 dark:text-amber-300'
                    : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {option.label}
                </div>
              </div>

              {/* Indicador de selección */}
              <div className={`mt-3 w-full h-2 rounded-full transition-all duration-300 ${
                isSelected
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                  : 'bg-gray-200 dark:bg-gray-700 group-hover:bg-gray-300 dark:group-hover:bg-gray-600'
              }`} />

              {/* Checkmark animado */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute top-3 right-3 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center"
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
          <div className="text-2xl">✏️</div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              ¿Necesitas algún básico específico?
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Escribe otros productos básicos que no están en la lista
            </p>
            <input
              type="text"
              placeholder="Ej: vinagre, especias, ajo..."
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 
                         focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent
                         bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                  const value = e.currentTarget.value.trim();
                  if (!data.alimentosBasicos?.includes(value)) {
                    handleBasicToggle(value);
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
      {data.alimentosBasicos?.some(item => !BASICOS_OPTIONS.find(opt => opt.value === item)) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 border border-blue-200 dark:border-blue-800"
        >
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
            Básicos personalizados añadidos:
          </h4>
          <div className="flex flex-wrap gap-2">
            {data.alimentosBasicos
              ?.filter(item => !BASICOS_OPTIONS.find(opt => opt.value === item))
              .map((item, index) => (
                <motion.span
                  key={item}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-800 
                           text-blue-700 dark:text-blue-300 rounded-full text-sm"
                >
                  <span>✨ {item}</span>
                  <button
                    onClick={() => handleBasicToggle(item)}
                    className="hover:bg-blue-200 dark:hover:bg-blue-700 rounded-full p-0.5"
                  >
                    ×
                  </button>
                </motion.span>
              ))}
          </div>
        </motion.div>
      )}

      {/* Resumen y consejos */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-center text-sm text-gray-500 dark:text-gray-400 space-y-2"
      >
        <div>
          💡 <strong>Consejo:</strong> Los básicos son opcionales. Si ya tienes algunos en casa, no los incluyas en la lista.
        </div>
        {selectedCount === 0 ? (
          <div className="text-gray-400 dark:text-gray-500">
            ⏭️ Puedes saltar este paso si no necesitas reponar básicos
          </div>
        ) : (
          <div className="text-green-600 dark:text-green-400">
            ✅ {selectedCount} producto{selectedCount !== 1 ? 's' : ''} básico{selectedCount !== 1 ? 's' : ''} añadido{selectedCount !== 1 ? 's' : ''} a tu lista
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default BasicsStep;
