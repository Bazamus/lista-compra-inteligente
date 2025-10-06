import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hnnjfqokgbhnydkfuhxy.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseAnonKey) {
  console.error('VITE_SUPABASE_ANON_KEY no está configurada en las variables de entorno');
}

// Cliente de Supabase para uso en el frontend
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Función para normalizar texto: eliminar acentos y convertir a minúsculas
export function normalizeText(text: string): string {
  return text
    .normalize('NFD') // Descomponer caracteres con acentos
    .replace(/[\u0300-\u036f]/g, '') // Eliminar diacríticos
    .toLowerCase() // Convertir a minúsculas
    .trim();
}
