import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import type { FormStep } from '../../types/form.types';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  progress: number;
  steps: FormStep[];
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  progress,
  steps
}) => {
  return (
    <div className="w-full">
      {/* Barra de progreso principal */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
          <span>Progreso</span>
          <span>{Math.round(progress)}% completado</span>
        </div>

        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
          <motion.div
            className="bg-gradient-to-r from-blue-500 to-green-500 h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 15
            }}
          />
        </div>
      </div>

      {/* Indicador de pasos en desktop */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              {/* Círculo del paso */}
              <div className="flex flex-col items-center">
                <motion.div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                    transition-all duration-300 relative
                    ${index < currentStep
                      ? 'bg-green-500 text-white'
                      : index === currentStep
                        ? 'bg-blue-500 text-white ring-4 ring-blue-200 dark:ring-blue-800'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                    }
                  `}
                  whileHover={{ scale: 1.1 }}
                  animate={{
                    scale: index === currentStep ? 1.1 : 1,
                  }}
                >
                  {index < currentStep ? (
                    <Check size={16} />
                  ) : (
                    <span>{index + 1}</span>
                  )}

                  {/* Pulso animado para paso actual */}
                  {index === currentStep && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-blue-500"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 0, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  )}
                </motion.div>

                {/* Etiqueta del paso */}
                <div className="mt-2 text-center">
                  <div className={`
                    text-xs font-medium
                    ${index <= currentStep
                      ? 'text-gray-900 dark:text-white'
                      : 'text-gray-500 dark:text-gray-400'
                    }
                  `}>
                    {step.title}
                  </div>
                  {step.isOptional && (
                    <div className="text-xs text-gray-400 dark:text-gray-500">
                      Opcional
                    </div>
                  )}
                </div>
              </div>

              {/* Línea conectora */}
              {index < steps.length - 1 && (
                <div className="flex-1 h-px mx-4 relative">
                  <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700" />
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-blue-500 to-green-500"
                    initial={{ width: 0 }}
                    animate={{
                      width: index < currentStep ? '100%' : '0%'
                    }}
                    transition={{
                      duration: 0.5,
                      delay: index < currentStep ? 0.2 : 0
                    }}
                  />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Indicador simplificado para mobile */}
      <div className="md:hidden">
        <div className="flex justify-center space-x-2">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              className={`
                w-3 h-3 rounded-full
                ${index < currentStep
                  ? 'bg-green-500'
                  : index === currentStep
                    ? 'bg-blue-500'
                    : 'bg-gray-300 dark:bg-gray-600'
                }
              `}
              animate={{
                scale: index === currentStep ? 1.2 : 1,
              }}
              transition={{ duration: 0.2 }}
            />
          ))}
        </div>

        {/* Información del paso actual en mobile */}
        <div className="text-center mt-3">
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {steps[currentStep].title}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {steps[currentStep].description}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressIndicator;