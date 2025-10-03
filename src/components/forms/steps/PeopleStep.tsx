import React from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Minus, Home } from 'lucide-react';
import type { FormStepProps } from '../../../types/form.types';

const PeopleStep: React.FC<FormStepProps> = ({ data, updateData }) => {
  const quickOptions = [
    { people: 1, label: 'Solo yo', icon: '👤', description: 'Persona sola' },
    { people: 2, label: 'Pareja', icon: '👫', description: 'Dos personas', popular: true },
    { people: 3, label: 'Pequeña familia', icon: '👨‍👩‍👧', description: 'Tres personas' },
    { people: 4, label: 'Familia', icon: '👨‍👩‍👧‍👦', description: 'Cuatro personas', popular: true },
    { people: 5, label: 'Familia grande', icon: '👨‍👩‍👧‍👦‍👶', description: 'Cinco personas' },
  ];

  const handlePeopleSelect = (count: number) => {
    updateData({ numPersonas: Math.max(1, Math.min(20, count)) });
  };

  const incrementPeople = () => {
    const current = data.numPersonas || 1;
    handlePeopleSelect(current + 1);
  };

  const decrementPeople = () => {
    const current = data.numPersonas || 1;
    handlePeopleSelect(current - 1);
  };

  const isCustomValue = data.numPersonas && !quickOptions.some(opt => opt.people === data.numPersonas);

  return (
    <div className="space-y-8">
      {/* Opciones rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickOptions.map((option, index) => (
          <motion.button
            key={option.people}
            onClick={() => handlePeopleSelect(option.people)}
            className={`
              relative p-6 rounded-2xl border-2 text-left transition-all duration-300 group
              ${data.numPersonas === option.people
                ? 'border-green-500 bg-green-50 dark:bg-green-900/30'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
              }
            `}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Badge popular */}
            {option.popular && (
              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-400 to-pink-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                Popular
              </div>
            )}

            <div className="flex items-center gap-3 mb-3">
              <div className="text-3xl">{option.icon}</div>
              <div>
                <div className={`font-semibold text-lg ${
                  data.numPersonas === option.people
                    ? 'text-green-700 dark:text-green-300'
                    : 'text-gray-900 dark:text-white'
                }`}>
                  {option.label}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {option.description}
                </div>
              </div>
            </div>

            {/* Número de personas */}
            <div className={`text-2xl font-bold text-center py-2 rounded-xl transition-all duration-300 ${
              data.numPersonas === option.people
                ? 'bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}>
              {option.people}
            </div>

            {/* Checkmark animado */}
            {data.numPersonas === option.people && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute top-4 right-4 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
            )}
          </motion.button>
        ))}

        {/* Contador personalizado */}
        <motion.div
          className={`
            relative p-6 rounded-2xl border-2 transition-all duration-300 text-center
            ${isCustomValue
              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
            }
          `}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="text-3xl">🏠</div>
            <div>
              <div className="font-semibold text-lg text-gray-900 dark:text-white">
                Personalizado
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Ajusta el número
              </div>
            </div>
          </div>

          {/* Control de contador */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={decrementPeople}
              disabled={(data.numPersonas || 1) <= 1}
              className={`
                w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-200
                ${(data.numPersonas || 1) <= 1
                  ? 'border-gray-200 dark:border-gray-700 text-gray-400 cursor-not-allowed'
                  : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                }
              `}
            >
              <Minus size={16} />
            </button>

            <div className={`
              text-3xl font-bold px-4 py-2 rounded-xl min-w-[60px] transition-all duration-300
              ${isCustomValue
                ? 'bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
              }
            `}>
              {data.numPersonas || 1}
            </div>

            <button
              onClick={incrementPeople}
              disabled={(data.numPersonas || 1) >= 20}
              className={`
                w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-200
                ${(data.numPersonas || 1) >= 20
                  ? 'border-gray-200 dark:border-gray-700 text-gray-400 cursor-not-allowed'
                  : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                }
              `}
            >
              <Plus size={16} />
            </button>
          </div>

          {isCustomValue && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute top-4 right-4 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Información contextual */}
      {data.numPersonas && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-2xl p-6 border border-green-200 dark:border-green-800"
        >
          <div className="flex items-start gap-4">
            <div className="p-2 bg-green-100 dark:bg-green-800 rounded-xl">
              <Home className="w-6 h-6 text-green-600 dark:text-green-300" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Lista para {data.numPersonas} persona{data.numPersonas !== 1 ? 's' : ''}
              </h3>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>
                    Las cantidades se ajustarán automáticamente
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🍽️</span>
                  <span>
                    Raciones calculadas para {data.numPersonas * (data.diasDuracion || 7)} comidas totales
                  </span>
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
        transition={{ delay: 0.7 }}
        className="text-center text-sm text-gray-500 dark:text-gray-400 space-y-2"
      >
        <div>
          💡 <strong>Consejo:</strong> Incluye también a las visitas frecuentes o personas que comen habitualmente contigo.
        </div>
        {(data.numPersonas || 1) > 6 && (
          <div className="text-blue-600 dark:text-blue-400">
            🎉 ¡Familia numerosa! Las raciones se optimizarán para grupos grandes.
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default PeopleStep;