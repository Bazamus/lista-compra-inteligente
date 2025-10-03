import React from 'react';
import { motion } from 'framer-motion';
import { Heart, AlertTriangle, Check } from 'lucide-react';
import type { FormStepProps } from '../../../types/form.types';
import { RESTRICCIONES_OPTIONS } from '../../../types/form.types';

const RestrictionsStep: React.FC<FormStepProps> = ({ data, updateData }) => {
  const handleRestrictionToggle = (restriction: string) => {
    const currentRestrictions = data.restricciones || [];
    const updatedRestrictions = currentRestrictions.includes(restriction)
      ? currentRestrictions.filter(r => r !== restriction)
      : [...currentRestrictions, restriction];
    
    updateData({ restricciones: updatedRestrictions });
  };

  const handlePreferenceToggle = (preference: string) => {
    const currentPreferences = data.preferencias || [];
    const updatedPreferences = currentPreferences.includes(preference)
      ? currentPreferences.filter(p => p !== preference)
      : [...currentPreferences, preference];
    
    updateData({ preferencias: updatedPreferences });
  };

  const restrictionCount = data.restricciones?.length || 0;
  const preferenceCount = data.preferencias?.length || 0;
  const totalCount = restrictionCount + preferenceCount;

  const commonPreferences = [
    { id: 'ecologico', label: 'Productos ecológicos', icon: '🌱' },
    { id: 'marca_blanca', label: 'Marca blanca/genéricos', icon: '🏷️' },
    { id: 'local', label: 'Productos locales', icon: '🏘️' },
    { id: 'barato', label: 'Opciones más baratas', icon: '💰' },
    { id: 'calidad', label: 'Máxima calidad', icon: '⭐' },
    { id: 'fresco', label: 'Solo productos frescos', icon: '🥬' }
  ];

  return (
    <div className="space-y-8">
      {/* Información general */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-2xl p-6 border border-pink-200 dark:border-pink-800"
      >
        <div className="flex items-start gap-4">
          <div className="p-2 bg-pink-100 dark:bg-pink-800 rounded-xl">
            <Heart className="w-6 h-6 text-pink-600 dark:text-pink-300" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Restricciones alimentarias y preferencias
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Cuéntanos sobre alergias, dietas especiales o preferencias que debemos tener en cuenta
              para generar una lista personalizada.
            </p>
            {totalCount > 0 && (
              <div className="mt-3 text-sm font-medium text-pink-600 dark:text-pink-400">
                ❤️ {totalCount} preferencia{totalCount !== 1 ? 's' : ''} seleccionada{totalCount !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Restricciones alimentarias */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
              Restricciones alimentarias
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Alergias, intolerancias o dietas especiales
            </p>
          </div>
          {restrictionCount > 0 && (
            <div className="ml-auto px-3 py-1 rounded-full text-sm font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
              {restrictionCount} activa{restrictionCount !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3">
          {RESTRICCIONES_OPTIONS.map((option, index) => {
            const isSelected = data.restricciones?.includes(String(option.value)) || false;
            
            return (
              <motion.button
                key={option.id}
                onClick={() => handleRestrictionToggle(String(option.value))}
                className={`
                  relative p-4 rounded-xl border-2 text-center transition-all duration-300 group
                  ${isSelected
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/30'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                  }
                `}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <div className="space-y-2">
                  <div className="text-2xl">{option.icon}</div>
                  <div className={`text-sm font-medium ${
                    isSelected
                      ? 'text-red-700 dark:text-red-300'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {option.label}
                  </div>
                </div>

                {isSelected && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute top-2 right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                  >
                    <Check size={12} className="text-white" />
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Preferencias generales */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl">
            <Heart className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
              Preferencias de compra
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Tipo de productos que prefieres
            </p>
          </div>
          {preferenceCount > 0 && (
            <div className="ml-auto px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
              {preferenceCount} seleccionada{preferenceCount !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3">
          {commonPreferences.map((option, index) => {
            const isSelected = data.preferencias?.includes(option.id) || false;
            
            return (
              <motion.button
                key={option.id}
                onClick={() => handlePreferenceToggle(option.id)}
                className={`
                  relative p-4 rounded-xl border-2 text-center transition-all duration-300 group
                  ${isSelected
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/30'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                  }
                `}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + (index * 0.05) }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <div className="space-y-2">
                  <div className="text-2xl">{option.icon}</div>
                  <div className={`text-sm font-medium ${
                    isSelected
                      ? 'text-green-700 dark:text-green-300'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {option.label}
                  </div>
                </div>

                {isSelected && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute top-2 right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"
                  >
                    <Check size={12} className="text-white" />
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Sección de personalizados */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 p-6"
      >
        <div className="text-center space-y-4">
          <div className="text-2xl">📝</div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              ¿Alguna preferencia específica?
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Añade cualquier otra restricción o preferencia que debamos considerar
            </p>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Ej: sin azúcar añadido, productos de temporada..."
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 
                           focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent
                           bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    const value = e.currentTarget.value.trim();
                    if (!data.preferencias?.includes(value)) {
                      handlePreferenceToggle(value);
                    }
                    e.currentTarget.value = '';
                  }
                }}
              />
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Presiona Enter para añadir
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Preferencias personalizadas */}
      {data.preferencias?.some(pref => !commonPreferences.find(opt => opt.id === pref)) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 border border-blue-200 dark:border-blue-800"
        >
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
            Preferencias personalizadas:
          </h4>
          <div className="flex flex-wrap gap-2">
            {data.preferencias
              ?.filter(pref => !commonPreferences.find(opt => opt.id === pref))
              .map((pref, index) => (
                <motion.span
                  key={pref}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-800 
                           text-blue-700 dark:text-blue-300 rounded-full text-sm"
                >
                  <span>💙 {pref}</span>
                  <button
                    onClick={() => handlePreferenceToggle(pref)}
                    className="hover:bg-blue-200 dark:hover:bg-blue-700 rounded-full p-0.5"
                  >
                    ×
                  </button>
                </motion.span>
              ))}
          </div>
        </motion.div>
      )}

      {/* Resumen */}
      {totalCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-800"
        >
          <div className="text-center space-y-3">
            <div className="text-purple-600 dark:text-purple-400 font-semibold">
              ¡Perfecto! Hemos registrado tus preferencias
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium text-red-600 dark:text-red-400">Restricciones</div>
                <div className="text-gray-600 dark:text-gray-300">
                  {restrictionCount === 0 ? 'Ninguna' : `${restrictionCount} restricción${restrictionCount !== 1 ? 'es' : ''}`}
                </div>
              </div>
              <div>
                <div className="font-medium text-green-600 dark:text-green-400">Preferencias</div>
                <div className="text-gray-600 dark:text-gray-300">
                  {preferenceCount === 0 ? 'Ninguna' : `${preferenceCount} preferencia${preferenceCount !== 1 ? 's' : ''}`}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Consejos */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center text-sm text-gray-500 dark:text-gray-400 space-y-2"
      >
        <div>
          💡 <strong>Consejo:</strong> Este paso es opcional pero nos ayuda a generar recomendaciones más precisas.
        </div>
        {totalCount === 0 ? (
          <div className="text-gray-400 dark:text-gray-500">
            ⏭️ Sin restricciones? ¡Perfecto! Tendrás más opciones para elegir
          </div>
        ) : (
          <div className="text-purple-600 dark:text-purple-400">
            ✨ La IA tendrá en cuenta todas tus preferencias al generar la lista
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default RestrictionsStep;
