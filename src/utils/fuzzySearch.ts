import Fuse from 'fuse.js';
import { normalizeText } from '../lib/supabase';

/**
 * Configuración para búsqueda fuzzy con Fuse.js
 * - threshold: 0.4 = tolerancia a errores (0 = exacto, 1 = cualquier cosa)
 * - distance: 100 = máxima distancia de caracteres para considerar coincidencia
 * - minMatchCharLength: 2 = mínimo de caracteres para empezar a buscar
 */
const FUSE_OPTIONS = {
  threshold: 0.4,
  distance: 100,
  minMatchCharLength: 2,
  keys: ['nombre_normalizado'],
};

/**
 * Interfaz para productos con nombre normalizado
 */
interface ProductoConNormalizado {
  id_producto: number;
  nombre_producto: string;
  nombre_normalizado: string;
  [key: string]: any;
}

/**
 * Calcula la distancia de Levenshtein entre dos strings (número de cambios necesarios)
 * Usado para detectar errores de escritura y sugerir correcciones
 */
export function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix: number[][] = [];

  // Inicializar matriz
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  // Calcular distancias
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // Sustitución
          matrix[i][j - 1] + 1,     // Inserción
          matrix[i - 1][j] + 1      // Eliminación
        );
      }
    }
  }

  return matrix[len1][len2];
}

/**
 * Encuentra productos usando búsqueda fuzzy (tolerante a errores)
 * Ejemplos: "Garbano" → "Garbanzo", "Azukar" → "Azúcar"
 *
 * @param productos - Array de productos a buscar
 * @param searchTerm - Término de búsqueda (puede tener errores)
 * @param maxResults - Número máximo de resultados (default: 50)
 * @returns Array de productos ordenados por relevancia
 */
export function fuzzySearchProducts(
  productos: any[],
  searchTerm: string,
  maxResults: number = 50
): any[] {
  if (!searchTerm || searchTerm.trim().length < 2) {
    return productos;
  }

  // Normalizar término de búsqueda
  const searchNormalized = normalizeText(searchTerm.trim());

  // Añadir campo normalizado a productos para búsqueda
  const productosConNormalizado: ProductoConNormalizado[] = productos.map(p => ({
    ...p,
    nombre_normalizado: normalizeText(p.nombre_producto),
  }));

  // Crear instancia de Fuse.js
  const fuse = new Fuse(productosConNormalizado, FUSE_OPTIONS);

  // Realizar búsqueda fuzzy
  const resultados = fuse.search(searchNormalized);

  // Extraer productos y limitar resultados
  return resultados
    .slice(0, maxResults)
    .map(result => {
      const { nombre_normalizado, ...producto } = result.item;
      return producto;
    });
}

/**
 * Sugiere correcciones para términos de búsqueda con posibles errores
 * Busca productos similares y devuelve los nombres más cercanos
 *
 * @param productos - Array de productos disponibles
 * @param searchTerm - Término de búsqueda posiblemente incorrecto
 * @param maxSuggestions - Número máximo de sugerencias (default: 3)
 * @returns Array de sugerencias ordenadas por similitud
 */
export function getSuggestions(
  productos: any[],
  searchTerm: string,
  maxSuggestions: number = 3
): string[] {
  if (!searchTerm || searchTerm.trim().length < 3) {
    return [];
  }

  const searchNormalized = normalizeText(searchTerm.trim());

  // Obtener nombres únicos de productos normalizados
  const nombresUnicos = Array.from(
    new Set(productos.map(p => normalizeText(p.nombre_producto)))
  );

  // Calcular distancia de Levenshtein para cada nombre
  const distancias = nombresUnicos.map(nombre => ({
    nombre,
    distancia: levenshteinDistance(searchNormalized, nombre),
  }));

  // Ordenar por distancia (menor = más similar) y filtrar similitudes razonables
  const sugerencias = distancias
    .filter(({ distancia }) => distancia <= 3) // Máximo 3 cambios
    .sort((a, b) => a.distancia - b.distancia)
    .slice(0, maxSuggestions)
    .map(({ nombre }) => nombre);

  return sugerencias;
}

/**
 * Verifica si un término de búsqueda probablemente tiene errores de escritura
 * comparándolo con los productos existentes
 *
 * @param productos - Array de productos disponibles
 * @param searchTerm - Término de búsqueda a verificar
 * @returns true si probablemente hay un error de escritura
 */
export function hasTypo(productos: any[], searchTerm: string): boolean {
  if (!searchTerm || searchTerm.trim().length < 3) {
    return false;
  }

  const searchNormalized = normalizeText(searchTerm.trim());

  // Buscar coincidencia exacta
  const tieneCoincidenciaExacta = productos.some(p =>
    normalizeText(p.nombre_producto).includes(searchNormalized)
  );

  if (tieneCoincidenciaExacta) {
    return false; // No hay error si hay coincidencia exacta
  }

  // Buscar coincidencias similares (distancia Levenshtein <= 2)
  const tieneSimilar = productos.some(p => {
    const nombreNormalizado = normalizeText(p.nombre_producto);
    const distancia = levenshteinDistance(searchNormalized, nombreNormalizado);
    return distancia <= 2;
  });

  return tieneSimilar; // Hay error si existe algo similar pero no exacto
}
