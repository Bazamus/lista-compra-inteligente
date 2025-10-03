// Constantes de la aplicación

export const APP_CONFIG = {
  name: import.meta.env.VITE_APP_NAME || 'Lista Inteligente de Compra',
  version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5173/api',
};

export const SUPABASE_CONFIG = {
  url: import.meta.env.VITE_SUPABASE_URL || '',
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
};

export const FORM_OPTIONS = {
  DAYS: [3, 7, 14, 21, 30],
  PEOPLE_RANGE: [1, 10],
  BREAKFAST_OPTIONS: [
    'cereales',
    'tostadas',
    'frutas',
    'lácteos',
    'bollería',
    'zumos',
    'café',
    'té',
    'yogur',
    'avena'
  ],
  LUNCH_OPTIONS: [
    'pasta',
    'arroz',
    'carne',
    'pescado',
    'pollo',
    'verduras',
    'legumbres',
    'ensaladas',
    'sopas',
    'pizza'
  ],
  DINNER_OPTIONS: [
    'ensaladas',
    'sopas',
    'pescado',
    'pollo',
    'verduras',
    'tortillas',
    'sándwiches',
    'cenas ligeras',
    'cremas',
    'platos fríos'
  ],
  BASIC_FOODS: [
    'aceite',
    'sal',
    'azúcar',
    'harina',
    'leche',
    'huevos',
    'pan',
    'ajo',
    'cebolla',
    'tomate'
  ],
  OTHER_PRODUCTS: [
    'detergente',
    'papel higiénico',
    'papel de cocina',
    'productos de limpieza',
    'champú',
    'gel de ducha',
    'pasta de dientes',
    'desodorante'
  ],
  DIETARY_RESTRICTIONS: [
    'vegetariano',
    'vegano',
    'sin gluten',
    'sin lactosa',
    'bajo en sal',
    'diabético',
    'sin frutos secos',
    'sin marisco'
  ],
  BRAND_PREFERENCES: [
    { value: 'generic', label: 'Productos genéricos (más económico)' },
    { value: 'brand', label: 'Marcas conocidas' },
    { value: 'mixed', label: 'Combinación de ambos' }
  ]
};

export const PRODUCT_CATEGORIES = {
  FRESH: 'Productos frescos',
  DAIRY: 'Lácteos',
  MEAT: 'Carnes y pescados',
  PANTRY: 'Despensa',
  FROZEN: 'Congelados',
  CLEANING: 'Limpieza',
  HYGIENE: 'Higiene personal',
  OTHER: 'Otros'
};

export const MESSAGES = {
  LOADING: {
    GENERATING_LIST: 'Generando tu lista personalizada...',
    CREATING_MENU: 'Creando menús optimizados...',
    ANALYZING_PREFERENCES: 'Analizando tus preferencias...',
    CALCULATING_BUDGET: 'Calculando presupuesto óptimo...'
  },
  SUCCESS: {
    LIST_GENERATED: '¡Lista de compra generada exitosamente!',
    MENU_CREATED: '¡Menú personalizado creado!',
    EXPORTED_PDF: 'Lista exportada a PDF correctamente',
    EXPORTED_EXCEL: 'Lista exportada a Excel correctamente'
  },
  ERROR: {
    GENERAL: 'Ha ocurrido un error. Por favor, inténtalo de nuevo.',
    NETWORK: 'Error de conexión. Verifica tu conexión a internet.',
    INVALID_BUDGET: 'El presupuesto introducido no es válido.',
    NO_PRODUCTS: 'No se encontraron productos para tus criterios.'
  }
};