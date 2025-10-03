// Tipos principales de la aplicación

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  subcategory: string;
  price: number;
  unit: string;
  pricePerUnit: number;
  quantity: number;
  packaging: string;
  image: string;
  url: string;
  limit?: number;
}

export interface ShoppingListItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  notes?: string;
}

export interface ShoppingList {
  id: string;
  name: string;
  items: ShoppingListItem[];
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
  isRecurrent?: boolean;
}

export interface FormData {
  days: number;
  people: number;
  budget: number;
  breakfast: string[];
  lunch: string[];
  dinner: string[];
  basicFoods: string[];
  otherProducts: string[];
  dietaryRestrictions: string[];
  brandPreference: 'generic' | 'brand' | 'mixed';
  mealsOutside: number;
  excludedProducts: string[];
}

export interface MenuItem {
  id: string;
  name: string;
  type: 'breakfast' | 'lunch' | 'dinner';
  ingredients: string[];
  servings: number;
  day: number;
}

export interface Menu {
  id: string;
  name: string;
  days: number;
  people: number;
  items: MenuItem[];
  totalCost: number;
  createdAt: Date;
}

export interface AIRecommendation {
  products: Product[];
  menu: Menu;
  reasoning: string;
  alternatives: Product[];
}

export interface Category {
  id: number;
  name: string;
  level: number;
  order: number;
  categories?: Category[];
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  status: 'success' | 'error';
}