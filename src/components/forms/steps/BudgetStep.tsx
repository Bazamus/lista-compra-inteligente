import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, PiggyBank } from 'lucide-react';
import type { FormStepProps } from '../../../types/form.types';
import { PRESUPUESTO_OPTIONS } from '../../../types/form.types';

const BudgetStep: React.FC<FormStepProps> = ({ data, updateData }) => {
  const [customAmount, setCustomAmount] = useState(data.presupuesto || 50);

  const handleBudgetTypeSelect = (tipo: 'ajustado' | 'moderado' | 'flexible' | 'personalizado') => {
    const budgetRanges = {
      ajustado: 40,
      moderado: 65,
      flexible: 100,
      personalizado: customAmount
    };

    updateData({
      presupuestoTipo: tipo,
      presupuesto: budgetRanges[tipo]
    });
  };

  const handleCustomAmountChange = (amount: number) => {
    setCustomAmount(amount);
    if (data.presupuestoTipo === 'personalizado') {
      updateData({ presupuesto: amount });
    }
  };

  const getBudgetAdvice = (budget: number, people: number, days: number) => {
    const perPersonPerDay = budget / (people * days);

    if (perPersonPerDay < 2) {
      return { level: 'tight', message: 'Presupuesto ajustado. Priorizaremos productos básicos y ofertas.', icon: '🎯' };
    } else if (perPersonPerDay < 4) {
      return { level: 'moderate', message: 'Presupuesto equilibrado. Buena variedad de productos.', icon: '⚖️' };
    } else {
      return { level: 'flexible', message: 'Presupuesto holgado. Incluiremos productos premium y variedad.', icon: '🌟' };
    }
  };

  const advice = data.presupuesto && data.numPersonas && data.diasDuracion
    ? getBudgetAdvice(data.presupuesto, data.numPersonas, data.diasDuracion)
    : null;

  return (
    <div className="space-y-8">
      {/* Opciones de presupuesto */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {PRESUPUESTO_OPTIONS.map((option, index) => (
          <motion.button
            key={option.id}
            onClick={() => handleBudgetTypeSelect(option.value as any)}
            className={`
              relative p-6 rounded-2xl border-2 text-left transition-all duration-300 group
              ${data.presupuestoTipo === option.value
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

            <div className="flex items-start gap-4 mb-4">
              <div className="text-3xl">{option.icon}</div>
              <div className="flex-1">
                <div className={`font-semibold text-xl mb-1 ${
                  data.presupuestoTipo === option.value
                    ? 'text-blue-700 dark:text-blue-300'
                    : 'text-gray-900 dark:text-white'
                }`}>
                  {option.label}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  {option.description}
                </div>

                {/* Mostrar rango de precio para opciones predefinidas */}
                {option.value !== 'personalizado' && (
                  <div className={`text-lg font-bold ${
                    data.presupuestoTipo === option.value
                      ? 'text-blue-600 dark:text-blue-300'
                      : 'text-gray-600 dark:text-gray-300'
                  }`}>
                    ~{option.value === 'ajustado' ? '40' : option.value === 'moderado' ? '65' : '100'}€
                  </div>
                )}
              </div>
            </div>

            {/* Input personalizado */}
            {option.value === 'personalizado' && (
              <div className="space-y-3">
                <div className="relative">
                  <input
                    type="range"
                    min="20"
                    max="200"
                    step="5"
                    value={customAmount}
                    onChange={(e) => handleCustomAmountChange(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((customAmount - 20) / 180) * 100}%, #e5e7eb ${((customAmount - 20) / 180) * 100}%, #e5e7eb 100%)`
                    }}
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>20€</span>
                    <span>200€</span>
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-300">
                    {customAmount}€
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    por {data.diasDuracion || 7} día{(data.diasDuracion || 7) !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            )}

            {/* Checkmark animado */}
            {data.presupuestoTipo === option.value && (
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
      </div>

      {/* Calculadora de presupuesto */}
      {data.presupuesto && data.numPersonas && data.diasDuracion && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-2xl p-6 border border-green-200 dark:border-green-800"
        >
          <div className="flex items-start gap-4 mb-4">
            <div className="p-2 bg-green-100 dark:bg-green-800 rounded-xl">
              <Calculator className="w-6 h-6 text-green-600 dark:text-green-300" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Análisis de tu presupuesto
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-xl">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-300">
                {data.presupuesto}€
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Total</div>
            </div>

            <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-xl">
              <div className="text-2xl font-bold text-green-600 dark:text-green-300">
                {(data.presupuesto / data.numPersonas).toFixed(1)}€
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Por persona</div>
            </div>

            <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-xl">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-300">
                {(data.presupuesto / (data.numPersonas * data.diasDuracion)).toFixed(2)}€
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Por persona/día</div>
            </div>
          </div>

          {/* Consejo personalizado */}
          {advice && (
            <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl">
              <div className="text-2xl">{advice.icon}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                <strong>{advice.message}</strong>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Desglose estimado */}
      {data.presupuesto && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center gap-3 mb-4">
            <PiggyBank className="w-6 h-6 text-blue-600 dark:text-blue-300" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Desglose estimado del gasto
            </h3>
          </div>

          <div className="space-y-3">
            {[
              { category: 'Frutas y verduras', percentage: 25, color: 'bg-green-500' },
              { category: 'Carne y pescado', percentage: 30, color: 'bg-red-500' },
              { category: 'Lácteos y huevos', percentage: 15, color: 'bg-yellow-500' },
              { category: 'Cereales y legumbres', percentage: 20, color: 'bg-orange-500' },
              { category: 'Otros productos', percentage: 10, color: 'bg-gray-500' },
            ].map((item, index) => (
              <motion.div
                key={item.category}
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                className="flex items-center gap-3"
              >
                <div className="w-24 text-sm text-gray-600 dark:text-gray-300">
                  {item.category}
                </div>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <motion.div
                    className={`${item.color} h-full rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percentage}%` }}
                    transition={{ delay: index * 0.1 + 0.4, duration: 0.8 }}
                  />
                </div>
                <div className="w-16 text-sm text-gray-500 dark:text-gray-400 text-right">
                  ~{((data.presupuesto! * item.percentage) / 100).toFixed(0)}€
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Consejos */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center text-sm text-gray-500 dark:text-gray-400"
      >
        💡 <strong>Consejo:</strong> Puedes ajustar el presupuesto más adelante si necesitas cambios.
      </motion.div>
    </div>
  );
};

export default BudgetStep;