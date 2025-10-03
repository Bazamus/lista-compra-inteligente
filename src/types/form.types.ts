// Tipos para el formulario interactivo
export interface FormData {
  // Información básica
  numPersonas: number;
  diasDuracion: number;
  presupuesto: number;
  presupuestoTipo: 'ajustado' | 'moderado' | 'flexible' | 'personalizado';

  // Preferencias de comidas
  tipoComidas: {
    desayuno: string[];
    comida: string[];
    cena: string[];
  };

  // Productos adicionales
  alimentosBasicos: string[];
  productosAdicionales: string[];

  // Preferencias adicionales
  restricciones: string[];
  preferencias: string[];

  // Información de contacto (opcional)
  nombreLista?: string;
  notificaciones?: boolean;
}

export interface FormStep {
  id: string;
  title: string;
  description: string;
  question: string;
  component: string;
  validation?: any;
  isOptional?: boolean;
}

export interface QuestionOption {
  id: string;
  label: string;
  value: string | number;
  icon?: string;
  description?: string;
  popular?: boolean;
}

export interface FormStepProps {
  data: Partial<FormData>;
  updateData: (data: Partial<FormData>) => void;
  nextStep: () => void;
  prevStep: () => void;
  isFirst: boolean;
  isLast: boolean;
  currentStep: number;
  totalSteps: number;
}

export interface ConversationalFormProps {
  onSubmit: (data: FormData, resultadoIA?: any) => void;
  onCancel?: () => void;
  initialData?: Partial<FormData>;
}

// Opciones predefinidas para el formulario
export const DESAYUNO_OPTIONS: QuestionOption[] = [
  { id: 'cereales', label: 'Cereales', value: 'cereales', icon: '🥣', popular: true },
  { id: 'tostadas', label: 'Tostadas', value: 'tostadas', icon: '🍞', popular: true },
  { id: 'frutas', label: 'Frutas', value: 'frutas', icon: '🍎', popular: true },
  { id: 'yogur', label: 'Yogur', value: 'yogur', icon: '🥛' },
  { id: 'cafe', label: 'Café/Té', value: 'cafe', icon: '☕', popular: true },
  { id: 'galletas', label: 'Galletas', value: 'galletas', icon: '🍪' },
  { id: 'zumo', label: 'Zumos', value: 'zumo', icon: '🧃' },
  { id: 'huevos', label: 'Huevos', value: 'huevos', icon: '🥚' }
];

export const COMIDA_OPTIONS: QuestionOption[] = [
  { id: 'pasta', label: 'Pasta', value: 'pasta', icon: '🍝', popular: true },
  { id: 'arroz', label: 'Arroz', value: 'arroz', icon: '🍚', popular: true },
  { id: 'carne', label: 'Carne', value: 'carne', icon: '🥩', popular: true },
  { id: 'pescado', label: 'Pescado', value: 'pescado', icon: '🐟' },
  { id: 'verduras', label: 'Verduras', value: 'verduras', icon: '🥬', popular: true },
  { id: 'legumbres', label: 'Legumbres', value: 'legumbres', icon: '🫘' },
  { id: 'ensaladas', label: 'Ensaladas', value: 'ensaladas', icon: '🥗' },
  { id: 'sopas', label: 'Sopas', value: 'sopas', icon: '🍲' }
];

export const CENA_OPTIONS: QuestionOption[] = [
  { id: 'ensaladas', label: 'Ensaladas', value: 'ensaladas', icon: '🥗', popular: true },
  { id: 'sopas', label: 'Sopas', value: 'sopas', icon: '🍲', popular: true },
  { id: 'pescado', label: 'Pescado', value: 'pescado', icon: '🐟' },
  { id: 'pollo', label: 'Pollo', value: 'pollo', icon: '🍗', popular: true },
  { id: 'tortillas', label: 'Tortillas', value: 'tortillas', icon: '🥞' },
  { id: 'verduras', label: 'Verduras', value: 'verduras', icon: '🥬' },
  { id: 'sandwiches', label: 'Sandwiches', value: 'sandwiches', icon: '🥪' },
  { id: 'quesos', label: 'Quesos', value: 'quesos', icon: '🧀' }
];

export const BASICOS_OPTIONS: QuestionOption[] = [
  { id: 'aceite', label: 'Aceite de oliva', value: 'aceite', icon: '🫒', popular: true },
  { id: 'sal', label: 'Sal', value: 'sal', icon: '🧂', popular: true },
  { id: 'azucar', label: 'Azúcar', value: 'azucar', icon: '🍯' },
  { id: 'leche', label: 'Leche', value: 'leche', icon: '🥛', popular: true },
  { id: 'huevos', label: 'Huevos', value: 'huevos', icon: '🥚', popular: true },
  { id: 'pan', label: 'Pan', value: 'pan', icon: '🍞', popular: true },
  { id: 'arroz', label: 'Arroz', value: 'arroz', icon: '🍚' },
  { id: 'pasta', label: 'Pasta', value: 'pasta', icon: '🍝' }
];

export const ADICIONALES_OPTIONS: QuestionOption[] = [
  { id: 'detergente', label: 'Detergente', value: 'detergente', icon: '🧴', popular: true },
  { id: 'papel', label: 'Papel higiénico', value: 'papel', icon: '🧻', popular: true },
  { id: 'limpieza', label: 'Productos limpieza', value: 'limpieza', icon: '🧽' },
  { id: 'cocina', label: 'Papel de cocina', value: 'cocina', icon: '📄' },
  { id: 'higiene', label: 'Higiene personal', value: 'higiene', icon: '🧴' },
  { id: 'mascotas', label: 'Comida mascotas', value: 'mascotas', icon: '🐕' }
];

export const RESTRICCIONES_OPTIONS: QuestionOption[] = [
  { id: 'sin_gluten', label: 'Sin gluten', value: 'sin_gluten', icon: '🌾' },
  { id: 'vegano', label: 'Vegano', value: 'vegano', icon: '🌱' },
  { id: 'vegetariano', label: 'Vegetariano', value: 'vegetariano', icon: '🥬' },
  { id: 'sin_lactosa', label: 'Sin lactosa', value: 'sin_lactosa', icon: '🥛' },
  { id: 'bajo_sal', label: 'Bajo en sal', value: 'bajo_sal', icon: '🧂' },
  { id: 'diabetico', label: 'Diabético', value: 'diabetico', icon: '🍯' }
];

export const PRESUPUESTO_OPTIONS: QuestionOption[] = [
  {
    id: 'ajustado',
    label: 'Ajustado',
    value: 'ajustado',
    description: '30-50€/semana',
    icon: '💰'
  },
  {
    id: 'moderado',
    label: 'Moderado',
    value: 'moderado',
    description: '50-80€/semana',
    icon: '💸',
    popular: true
  },
  {
    id: 'flexible',
    label: 'Flexible',
    value: 'flexible',
    description: '80€+/semana',
    icon: '💳'
  },
  {
    id: 'personalizado',
    label: 'Personalizado',
    value: 'personalizado',
    description: 'Introduce tu presupuesto',
    icon: '✏️'
  }
];