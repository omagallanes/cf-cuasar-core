/**
 * Hook para debouncing de valores
 * Útil para retrasar la ejecución de búsquedas y filtrados
 */

import { useState, useEffect } from 'react';

/**
 * Hook de debouncing
 * @param value - Valor a debouncear
 * @param delay - Retraso en milisegundos (por defecto 300ms)
 * @returns Valor debouncado
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Configurar un timer para actualizar el valor debouncado
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Limpiar el timer si el valor cambia antes de que termine el delay
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
