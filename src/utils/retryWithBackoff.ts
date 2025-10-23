/**
 * Utilidad para reintentar operaciones asíncronas con backoff exponencial
 * 
 * @param fn - Función asíncrona a ejecutar
 * @param maxRetries - Número máximo de reintentos (default: 3)
 * @param baseDelay - Delay base en ms (default: 1000)
 * @returns Resultado de la función o lanza el último error
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: Error | unknown;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Intentar ejecutar la función
      const result = await fn();
      return result;
    } catch (error) {
      lastError = error;
      
      // Si es el último intento, lanzar el error
      if (attempt === maxRetries - 1) {
        console.error(`❌ Falló después de ${maxRetries} intentos:`, error);
        throw error;
      }

      // Calcular delay con backoff exponencial: 1s, 2s, 4s, 8s...
      const delay = baseDelay * Math.pow(2, attempt);
      
      console.warn(
        `⚠️ Intento ${attempt + 1}/${maxRetries} falló. Reintentando en ${delay}ms...`,
        error
      );

      // Esperar antes del siguiente intento
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // Esto nunca debería ejecutarse, pero TypeScript lo requiere
  throw lastError || new Error('Max retries reached');
};

/**
 * Versión de retryWithBackoff con callback de progreso
 */
export const retryWithBackoffAndProgress = async <T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    baseDelay?: number;
    onRetry?: (attempt: number, error: unknown) => void;
  } = {}
): Promise<T> => {
  const { maxRetries = 3, baseDelay = 1000, onRetry } = options;
  let lastError: Error | unknown;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await fn();
      return result;
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries - 1) {
        throw error;
      }

      const delay = baseDelay * Math.pow(2, attempt);

      // Callback de progreso
      if (onRetry) {
        onRetry(attempt + 1, error);
      }

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error('Max retries reached');
};

