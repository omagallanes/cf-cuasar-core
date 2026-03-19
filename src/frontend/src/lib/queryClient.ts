/**
 * Configuración de QueryClient de TanStack Query
 * Optimizada para rendimiento y experiencia de usuario
 */

import { QueryClient } from '@tanstack/react-query';

/**
 * Constantes de configuración de caché
 * Centralizadas para facilitar ajustes
 */
export const CACHE_CONFIG = {
  // Tiempos de staleTime (tiempo antes de considerar datos obsoletos)
  staleTime: {
    // Datos estáticos que cambian raramente
    static: 30 * 60 * 1000, // 30 minutos
    // Datos de proyectos que cambian ocasionalmente
    projects: 5 * 60 * 1000, // 5 minutos
    // Datos de reportes que cambian poco
    reports: 10 * 60 * 1000, // 10 minutos
    // Datos de workflows que cambian durante ejecución
    workflow: 30 * 1000, // 30 segundos
    // Datos de estadísticas que cambian frecuentemente
    stats: 60 * 1000, // 1 minuto
    // Por defecto
    default: 5 * 60 * 1000, // 5 minutos
  },
  // Tiempos de gcTime (tiempo antes de eliminar de caché)
  gcTime: {
    // Datos estáticos
    static: 60 * 60 * 1000, // 1 hora
    // Datos de proyectos
    projects: 15 * 60 * 1000, // 15 minutos
    // Datos de reportes
    reports: 30 * 60 * 1000, // 30 minutos
    // Datos de workflows
    workflow: 5 * 60 * 1000, // 5 minutos
    // Datos de estadísticas
    stats: 5 * 60 * 1000, // 5 minutos
    // Por defecto
    default: 10 * 60 * 1000, // 10 minutos
  },
} as const;

/**
 * Crear instancia de QueryClient con configuración optimizada
 */
export const createQueryClient = (): QueryClient => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Tiempo de refresco en milisegundos (5 minutos por defecto)
        staleTime: CACHE_CONFIG.staleTime.default,
        // Tiempo de caché en milisegundos (10 minutos por defecto)
        gcTime: CACHE_CONFIG.gcTime.default,
        // Número de reintentos en caso de error
        retry: (failureCount, error) => {
          // No reintentar en errores 4xx (errores del cliente)
          if (error && typeof error === 'object' && 'statusCode' in error) {
            const statusCode = (error as any).statusCode;
            if (statusCode && statusCode >= 400 && statusCode < 500) {
              return false;
            }
          }
          // Reintentar hasta 2 veces en otros errores
          return failureCount < 2;
        },
        // Retraso entre reintentos (exponencial)
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        // No refrescar datos cuando la ventana obtiene foco (mejor rendimiento)
        refetchOnWindowFocus: false,
        // Refrescar datos al reconectar
        refetchOnReconnect: true,
        // No refrescar datos al montar el componente (usar caché)
        refetchOnMount: false,
      },
      mutations: {
        // Número de reintentos en caso de error
        retry: (failureCount, error) => {
          // No reintentar en errores 4xx
          if (error && typeof error === 'object' && 'statusCode' in error) {
            const statusCode = (error as any).statusCode;
            if (statusCode && statusCode >= 400 && statusCode < 500) {
              return false;
            }
          }
          // Reintentar una vez en otros errores
          return failureCount < 1;
        },
        // Retraso entre reintentos
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
    },
  });
};

/**
 * Instancia única de QueryClient
 */
export const queryClient = createQueryClient();
