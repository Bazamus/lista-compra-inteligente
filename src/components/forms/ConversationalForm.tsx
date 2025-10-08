import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import type { ConversationalFormProps, FormStep } from '../../types/form.types';
import { useMultiStepForm } from '../../hooks/useMultiStepForm';
import ProgressIndicator from './ProgressIndicator';
import DurationStep from './steps/DurationStep';
import PeopleStep from './steps/PeopleStep';
import BudgetStep from './steps/BudgetStep';
import MealsStep from './steps/MealsStep';
import BasicsStep from './steps/BasicsStep';
import AdditionalStep from './steps/AdditionalStep';
import RestrictionsStep from './steps/RestrictionsStep';
import SummaryStep from './steps/SummaryStep';

// Definición de los pasos del formulario
const FORM_STEPS: FormStep[] = [
  {
    id: 'duration',
    title: 'Duración',
    description: 'Tiempo de planificación',
    question: '¡Hola! 👋 ¿Para cuántos días quieres planificar tus menús?',
    component: 'DurationStep'
  },
  {
    id: 'people',
    title: 'Personas',
    description: 'Número de comensales',
    question: 'Perfecto. ¿Cuántas personas sois en casa?',
    component: 'PeopleStep'
  },
  {
    id: 'budget',
    title: 'Presupuesto',
    description: 'Rango de gastos',
    question: '¿Con qué presupuesto contamos? 💰',
    component: 'BudgetStep'
  },
  {
    id: 'meals',
    title: 'Comidas',
    description: 'Preferencias alimentarias',
    question: '¿Qué tipo de alimentos soléis tomar en cada comida?',
    component: 'MealsStep'
  },
  {
    id: 'basics',
    title: 'Básicos',
    description: 'Productos esenciales',
    question: '¿Qué alimentos básicos debemos incluir siempre en la lista?',
    component: 'BasicsStep',
    isOptional: true
  },
  {
    id: 'additional',
    title: 'Adicionales',
    description: 'Productos no alimentarios',
    question: 'Aparte de alimentos, ¿necesitamos comprar algo más?',
    component: 'AdditionalStep',
    isOptional: true
  },
  {
    id: 'restrictions',
    title: 'Restricciones',
    description: 'Alergias y preferencias',
    question: '¿Tenéis alguna restricción alimentaria o preferencia especial?',
    component: 'RestrictionsStep',
    isOptional: true
  },
  {
    id: 'summary',
    title: 'Resumen',
    description: 'Revisar y confirmar',
    question: '¡Genial! Vamos a revisar tu lista personalizada',
    component: 'SummaryStep'
  }
];

const ConversationalForm: React.FC<ConversationalFormProps> = ({
  onSubmit,
  onCancel,
  initialData
}) => {
  const {
    currentStep,
    formData,
    currentStepData,
    isFirst,
    isLast,
    totalSteps,
    nextStep,
    prevStep,
    updateData,
    canProceed,
    getProgress
  } = useMultiStepForm(FORM_STEPS, initialData);

  const renderStepComponent = () => {
    const commonProps = {
      data: formData,
      updateData,
      nextStep,
      prevStep,
      isFirst,
      isLast,
      currentStep,
      totalSteps
    };

    switch (currentStepData.component) {
      case 'DurationStep':
        return <DurationStep {...commonProps} />;
      case 'PeopleStep':
        return <PeopleStep {...commonProps} />;
      case 'BudgetStep':
        return <BudgetStep {...commonProps} />;
      case 'MealsStep':
        return <MealsStep {...commonProps} />;
      case 'BasicsStep':
        return <BasicsStep {...commonProps} />;
      case 'AdditionalStep':
        return <AdditionalStep {...commonProps} />;
      case 'RestrictionsStep':
        return <RestrictionsStep {...commonProps} />;
      case 'SummaryStep':
        return <SummaryStep {...commonProps} onSubmit={(resultadoIA?: any) => onSubmit(formData as any, resultadoIA)} />;
      default:
        return <div>Paso no encontrado</div>;
    }
  };

  const handleNextStep = () => {
    if (isLast) {
      onSubmit(formData as any);
    } else {
      nextStep();
      // Scroll suave al inicio de la página
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    prevStep();
    // Scroll suave al inicio de la página
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
      {/* Header con progreso */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <ProgressIndicator
            currentStep={currentStep}
            totalSteps={totalSteps}
            progress={getProgress()}
            steps={FORM_STEPS}
          />
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30
            }}
            className="min-h-[600px] flex flex-col"
          >
            {/* Pregunta principal */}
            <div className="mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-center mb-6"
              >
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  Paso {currentStep + 1} de {totalSteps}
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
                  {currentStepData.question}
                </h1>
              </motion.div>
            </div>

            {/* Componente del paso actual */}
            <div className="flex-1">
              {renderStepComponent()}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Botones de navegación */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200 dark:border-gray-700"
        >
          {/* Botón Anterior */}
          <button
            onClick={handlePrevStep}
            disabled={isFirst}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200
              ${isFirst
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
              }
            `}
          >
            <ChevronLeft size={20} />
            Anterior
          </button>

          {/* Botón Siguiente/Finalizar */}
          <button
            onClick={handleNextStep}
            disabled={!canProceed()}
            className={`
              flex items-center gap-2 px-8 py-3 rounded-xl font-medium transition-all duration-200
              ${canProceed()
                ? 'bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              }
            `}
          >
            {isLast ? (
              <>
                <Check size={20} />
                Generar Lista
              </>
            ) : (
              <>
                Siguiente
                <ChevronRight size={20} />
              </>
            )}
          </button>
        </motion.div>

        {/* Botón cancelar (opcional) */}
        {onCancel && (
          <div className="text-center mt-4">
            <button
              onClick={onCancel}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              Cancelar y volver al inicio
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationalForm;