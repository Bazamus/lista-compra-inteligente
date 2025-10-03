import React, { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';
import type { FormData, ShoppingList, Menu, Product } from '../types';

interface AppState {
  formData: Partial<FormData>;
  currentList: ShoppingList | null;
  currentMenu: Menu | null;
  products: Product[];
  loading: boolean;
  error: string | null;
}

type AppAction =
  | { type: 'SET_FORM_DATA'; payload: Partial<FormData> }
  | { type: 'SET_CURRENT_LIST'; payload: ShoppingList | null }
  | { type: 'SET_CURRENT_MENU'; payload: Menu | null }
  | { type: 'SET_PRODUCTS'; payload: Product[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_STATE' };

const initialState: AppState = {
  formData: {},
  currentList: null,
  currentMenu: null,
  products: [],
  loading: false,
  error: null,
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_FORM_DATA':
      return {
        ...state,
        formData: { ...state.formData, ...action.payload },
      };
    case 'SET_CURRENT_LIST':
      return {
        ...state,
        currentList: action.payload,
      };
    case 'SET_CURRENT_MENU':
      return {
        ...state,
        currentMenu: action.payload,
      };
    case 'SET_PRODUCTS':
      return {
        ...state,
        products: action.payload,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };
    case 'CLEAR_STATE':
      return initialState;
    default:
      return state;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}