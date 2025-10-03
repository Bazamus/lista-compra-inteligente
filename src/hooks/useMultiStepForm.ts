import { useState, useCallback } from 'react';
import type { FormData, FormStep } from '../types/form.types';

export const useMultiStepForm = (steps: FormStep[], initialData?: Partial<FormData>) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<FormData>>(
    initialData || {
      numPersonas: 2,
      diasDuracion: 7,
      presupuesto: 50,
      presupuestoTipo: 'moderado',
      tipoComidas: {
        desayuno: [],
        comida: [],
        cena: []
      },
      alimentosBasicos: [],
      productosAdicionales: [],
      restricciones: [],
      preferencias: []
    }
  );

  const [completedSteps, setCompletedSteps] = useState<boolean[]>(
    new Array(steps.length).fill(false)
  );

  const nextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      // Marcar el paso actual como completado
      setCompletedSteps(prev => {
        const updated = [...prev];
        updated[currentStep] = true;
        return updated;
      });

      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, steps.length]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const goToStep = useCallback((stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setCurrentStep(stepIndex);
    }
  }, [steps.length]);

  const updateData = useCallback((data: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  }, []);

  const resetForm = useCallback(() => {
    setCurrentStep(0);
    setFormData(initialData || {
      numPersonas: 2,
      diasDuracion: 7,
      presupuesto: 50,
      presupuestoTipo: 'moderado',
      tipoComidas: {
        desayuno: [],
        comida: [],
        cena: []
      },
      alimentosBasicos: [],
      productosAdicionales: [],
      restricciones: [],
      preferencias: []
    });
    setCompletedSteps(new Array(steps.length).fill(false));
  }, [initialData, steps.length]);

  const isStepValid = useCallback((stepIndex: number): boolean => {
    const step = steps[stepIndex];
    if (!step) return false;

    // Si el paso es opcional, siempre es válido
    if (step.isOptional) return true;

    // Validaciones específicas por paso
    switch (step.id) {
      case 'duration':
        return formData.diasDuracion !== undefined && formData.diasDuracion > 0;

      case 'people':
        return formData.numPersonas !== undefined && formData.numPersonas > 0;

      case 'budget':
        return formData.presupuestoTipo !== undefined &&
               (formData.presupuestoTipo !== 'personalizado' ||
                (formData.presupuesto !== undefined && formData.presupuesto > 0));

      case 'meals':
        return (formData.tipoComidas?.desayuno?.length || 0) > 0 ||
               (formData.tipoComidas?.comida?.length || 0) > 0 ||
               (formData.tipoComidas?.cena?.length || 0) > 0;

      case 'basics':
        return true; // Los básicos son opcionales

      case 'additional':
        return true; // Los adicionales son opcionales

      case 'restrictions':
        return true; // Las restricciones son opcionales

      default:
        return true;
    }
  }, [formData, steps]);

  const canProceed = useCallback((): boolean => {
    return isStepValid(currentStep);
  }, [currentStep, isStepValid]);

  const getProgress = useCallback((): number => {
    const completedCount = completedSteps.filter(Boolean).length;
    return (completedCount / steps.length) * 100;
  }, [completedSteps, steps.length]);

  return {
    // Estado
    currentStep,
    formData,
    completedSteps,

    // Información del paso actual
    currentStepData: steps[currentStep],
    isFirst: currentStep === 0,
    isLast: currentStep === steps.length - 1,
    totalSteps: steps.length,

    // Navegación
    nextStep,
    prevStep,
    goToStep,

    // Datos
    updateData,
    resetForm,

    // Validación
    canProceed,
    isStepValid,
    getProgress
  };
};