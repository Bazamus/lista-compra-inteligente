import React from 'react';
import { motion } from 'framer-motion';
import { Coffee, Sun, Moon, Check } from 'lucide-react';
import type { FormStepProps } from '../../../types/form.types';
import { DESAYUNO_OPTIONS, COMIDA_OPTIONS, CENA_OPTIONS } from '../../../types/form.types';

const MealsStep: React.FC<FormStepProps> = ({ data, updateData }) => {
  const handleMealToggle = (mealType: 'desayuno' | 'comida' | 'cena', item: string) => {
    const currentMeals = data.tipoComidas || { desayuno: [], comida: [], cena: [] };
    const currentItems = currentMeals[mealType] || [];
    
    const updatedItems = currentItems.includes(item)
      ? currentItems.filter(i => i !== item)
      : [...currentItems, item];
    
    updateData({
      tipoComidas: {
        ...currentMeals,
        [mealType]: updatedItems
      }
    });
  };

  const getMealIcon = (mealType: 'desayuno' | 'comida' | 'cena') => {
    switch (mealType) {
      case 'desayuno': return <Coffee className="w-6 h-6" />;
      case 'comida': return <Sun className="w-6 h-6" />;
      case 'cena': return <Moon className="w-6 h-6" />;
    }
  };

  const getMealColor = (mealType: 'desayuno' | 'comida' | 'cena') => {
    switch (mealType) {
      case 'desayuno': return 'orange';
      case 'comida': return 'yellow';
      case 'cena': return 'purple';
    }
  };

  const renderMealSection = (
    mealType: 'desayuno' | 'comida' | 'cena',
    title: string,
    options: any[],
    delay: number
  ) => {
    const color = getMealColor(mealType);
    const selectedItems = data.tipoComidas?.[mealType] || [];

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="space-y-4"
      >
        {/* Header de la sección */}
        <div className="flex items-center gap-3 mb-6">
          <div className={`p-3 rounded-xl ${
            color === 'orange' ? 'bg-orange-100 dark:bg-orange-900/30' :
            color === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
            'bg-purple-100 dark:bg-purple-900/30'
          }`}>
            {getMealIcon(mealType)}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Selecciona los tipos de alimentos que sueles tomar
            </p>
          </div>
          {selectedItems.length > 0 && (
            <div className={`ml-auto px-3 py-1 rounded-full text-sm font-medium ${
              color === 'orange' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' :
              color === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
              'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
            }`}>
              {selectedItems.length} seleccionado{selectedItems.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* Grid de opciones */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {options.map((option, index) => {
            const isSelected = selectedItems.includes(option.value);
            
            return (
              <motion.button
                key={option.id}
                onClick={() => handleMealToggle(mealType, option.value)}
                className={`
                  relative p-4 rounded-xl border-2 text-center transition-all duration-300 group
                  ${isSelected
                    ? color === 'orange' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/30' :
                      color === 'yellow' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/30' :
                      'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                  }
                `}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: delay + (index * 0.05) }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Badge popular */}
                {option.popular && (
                  <div className="absolute -top-1 -right-1 bg-gradient-to-r from-orange-400 to-pink-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">
                    ⭐
                  </div>
                )}

                {/* Icono y texto */}
                <div className="space-y-2">
                  <div className="text-2xl">{option.icon}</div>
                  <div className={`text-sm font-medium ${
                    isSelected
                      ? color === 'orange' ? 'text-orange-700 dark:text-orange-300' :
                        color === 'yellow' ? 'text-yellow-700 dark:text-yellow-300' :
                        'text-purple-700 dark:text-purple-300'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {option.label}
                  </div>
                </div>

                {/* Checkmark animado */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center ${
                      color === 'orange' ? 'bg-orange-500' :
                      color === 'yellow' ? 'bg-yellow-500' :
                      'bg-purple-500'
                    }`}
                  >
                    <Check size={12} className="text-white" />
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    );
  };

  const totalSelected = 
    (data.tipoComidas?.desayuno?.length || 0) +
    (data.tipoComidas?.comida?.length || 0) +
    (data.tipoComidas?.cena?.length || 0);

  return (
    <div className="space-y-8">
      {/* Información general */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800"
      >
        <div className="text-center">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            ¿Qué tipo de alimentos sueles tomar en cada comida?
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Selecciona las opciones que más se ajusten a tus hábitos alimentarios. 
            La IA usará esto para generar menús personalizados.
          </p>
          {totalSelected > 0 && (
            <div className="mt-3 text-sm font-medium text-blue-600 dark:text-blue-400">
              ✨ {totalSelected} tipo{totalSelected !== 1 ? 's' : ''} de alimentos seleccionado{totalSelected !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </motion.div>

      {/* Secciones de comidas */}
      <div className="space-y-12">
        {renderMealSection('desayuno', '🌅 Desayuno', DESAYUNO_OPTIONS, 0.1)}
        {renderMealSection('comida', '☀️ Comida', COMIDA_OPTIONS, 0.2)}
        {renderMealSection('cena', '🌙 Cena', CENA_OPTIONS, 0.3)}
      </div>

      {/* Resumen y consejos */}
      {totalSelected > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-6 border border-green-200 dark:border-green-800"
        >
          <div className="text-center space-y-3">
            <div className="text-green-600 dark:text-green-400 font-semibold">
              ¡Perfecto! Ya tenemos tus preferencias alimentarias
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="font-medium text-orange-600 dark:text-orange-400">Desayuno</div>
                <div className="text-gray-600 dark:text-gray-300">
                  {data.tipoComidas?.desayuno?.length || 0} tipos
                </div>
              </div>
              <div>
                <div className="font-medium text-yellow-600 dark:text-yellow-400">Comida</div>
                <div className="text-gray-600 dark:text-gray-300">
                  {data.tipoComidas?.comida?.length || 0} tipos
                </div>
              </div>
              <div>
                <div className="font-medium text-purple-600 dark:text-purple-400">Cena</div>
                <div className="text-gray-600 dark:text-gray-300">
                  {data.tipoComidas?.cena?.length || 0} tipos
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
          💡 <strong>Consejo:</strong> No te preocupes si no seleccionas todo. La IA puede sugerir alternativas basadas en tus elecciones.
        </div>
        {totalSelected === 0 && (
          <div className="text-amber-600 dark:text-amber-400">
            ⚠️ Selecciona al menos algunos tipos de alimentos para generar mejores recomendaciones
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default MealsStep;
