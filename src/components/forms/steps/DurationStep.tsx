import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Users } from 'lucide-react';
import type { FormStepProps } from '../../../types/form.types';

const DurationStep: React.FC<FormStepProps> = ({ data, updateData }) => {
  const durationOptions = [
    { days: 3, label: '3 días', description: 'Fin de semana', icon: '🏖️', popular: false },
    { days: 7, label: '1 semana', description: 'Lo más común', icon: '📅', popular: true },
    { days: 14, label: '2 semanas', description: 'Quincena completa', icon: '📋', popular: false },
    { days: 21, label: '3 semanas', description: 'Planificación extendida', icon: '📊', popular: false },
    { days: 30, label: '1 mes', description: 'Compra mensual', icon: '🗓️', popular: false }
  ];

  const handleDurationSelect = (days: number) => {
    updateData({ diasDuracion: days });
  };

  const customDays = data.diasDuracion && !durationOptions.some(opt => opt.days === data.diasDuracion);

  return (
    <div className="space-y-8">
      {/* Opciones predefinidas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {durationOptions.map((option, index) => (
          <motion.button
            key={option.days}
            onClick={() => handleDurationSelect(option.days)}
            className={`
              relative p-6 rounded-2xl border-2 text-left transition-all duration-300 group
              ${data.diasDuracion === option.days
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
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
              <div className="text-2xl">{option.icon}</div>
              <div>
                <div className={`font-semibold text-lg ${
                  data.diasDuracion === option.days
                    ? 'text-blue-700 dark:text-blue-300'
                    : 'text-gray-900 dark:text-white'
                }`}>
                  {option.label}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {option.description}
                </div>
              </div>
            </div>

            {/* Indicador de selección */}
            <div className={`w-full h-2 rounded-full transition-all duration-300 ${
              data.diasDuracion === option.days
                ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                : 'bg-gray-200 dark:bg-gray-700 group-hover:bg-gray-300 dark:group-hover:bg-gray-600'
            }`} />

            {/* Checkmark animado */}
            {data.diasDuracion === option.days && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute top-4 right-4 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
            )}
          </motion.button>
        ))}

        {/* Opción personalizada */}
        <motion.div
          className={`
            relative p-6 rounded-2xl border-2 transition-all duration-300
            ${customDays
              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
            }
          `}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="text-2xl">✏️</div>
            <div>
              <div className="font-semibold text-lg text-gray-900 dark:text-white">
                Personalizado
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Introduce tus días
              </div>
            </div>
          </div>

          <div className="relative">
            <input
              type="number"
              min="1"
              max="90"
              value={data.diasDuracion || ''}
              onChange={(e) => handleDurationSelect(parseInt(e.target.value) || 0)}
              className={`
                w-full px-4 py-3 rounded-xl border text-center text-lg font-semibold
                transition-all duration-300 focus:outline-none focus:ring-2
                ${customDays
                  ? 'border-purple-300 dark:border-purple-600 focus:ring-purple-500 bg-white dark:bg-gray-900'
                  : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700'
                }
                text-gray-900 dark:text-white
              `}
              placeholder="0"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
              días
            </div>
          </div>

          {customDays && (
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
      {data.diasDuracion && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800"
        >
          <div className="flex items-start gap-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-xl">
              <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-300" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Planificaremos para {data.diasDuracion} día{data.diasDuracion !== 1 ? 's' : ''}
              </h3>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>
                    Aproximadamente {Math.ceil(data.diasDuracion / 7)} semana
                    {Math.ceil(data.diasDuracion / 7) !== 1 ? 's' : ''} de comidas
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>
                    Esto incluirá desayunos, comidas y cenas
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
        transition={{ delay: 0.6 }}
        className="text-center text-sm text-gray-500 dark:text-gray-400"
      >
        💡 <strong>Consejo:</strong> Una semana es ideal para empezar. Podrás generar más listas después.
      </motion.div>
    </div>
  );
};

export default DurationStep;