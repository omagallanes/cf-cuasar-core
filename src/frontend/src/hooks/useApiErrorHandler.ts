/**
 * Hook genérico para manejo de errores en la aplicación
 * Proporciona funciones para manejar diferentes tipos de errores
 */

import { useCallback, useState } from 'react';
import { getErrorInfo, logError } from '../config/errors';
import {
  NetworkError,
  ValidationError,
  NotFoundError,
  ConflictError,
  WorkflowError,
  ApiError,
  UnauthorizedError,
  ForbiddenError,
  TimeoutError
} from '../types/errors';

export interface ErrorHandlerState {
  error: Error | null;
  showError: boolean;
  errorInfo: ReturnType<typeof getErrorInfo>;
}

export interface ErrorHandlerActions {
  handleError: (error: unknown, context?: string) => void;
  clearError: () => void;
  dismissError: () => void;
}

/**
 * Hook para manejar errores de API de forma consistente
 */
export function useApiErrorHandler() {
  const [state, setState] = useState<ErrorHandlerState>({
    error: null,
    showError: false,
    errorInfo: getErrorInfo(new Error(''))
  });

  const handleError = useCallback((error: unknown, context?: string) => {
    // Loggear el error
    logError(error, context || 'useApiErrorHandler');

    // Obtener información del error
    let errorToUse: Error;
    
    if (error instanceof Error) {
      errorToUse = error;
    } else {
      errorToUse = new Error(String(error));
    }

    const errorInfo = getErrorInfo(errorToUse);

    // Actualizar el estado
    setState({
      error: errorToUse,
      showError: true,
      errorInfo
    });
  }, []);

  const clearError = useCallback(() => {
    setState({
      error: null,
      showError: false,
      errorInfo: getErrorInfo(new Error(''))
    });
  }, []);

  const dismissError = useCallback(() => {
    setState(prev => ({
      ...prev,
      showError: false
    }));
  }, []);

  return {
    state,
    actions: {
      handleError,
      clearError,
      dismissError
    }
  };
}

/**
 * Función para verificar si un error es recuperable
 */
export function isRecoverableError(error: unknown): boolean {
  if (error instanceof NetworkError) return true;
  if (error instanceof TimeoutError) return true;
  if (error instanceof ValidationError) return true;
  if (error instanceof ConflictError) return true;
  if (error instanceof WorkflowError) return true;
  if (error instanceof ApiError && error.statusCode && error.statusCode >= 400 && error.statusCode < 500) return true;
  
  return false;
}

/**
 * Función para obtener el mensaje de error amigable
 */
export function getFriendlyErrorMessage(error: unknown): string {
  const errorInfo = getErrorInfo(error instanceof Error ? error : new Error(String(error)));
  return errorInfo.message;
}

/**
 * Función para obtener la acción sugerida para el usuario
 */
export function getSuggestedAction(error: unknown): {
  action: string;
  label: string;
} {
  const errorInfo = getErrorInfo(error instanceof Error ? error : new Error(String(error)));
  return {
    action: errorInfo.suggestedAction,
    label: errorInfo.actionLabel
  };
}

/**
 * Función para verificar si el usuario debería ser redirigido
 */
export function shouldRedirect(error: unknown): boolean {
  if (error instanceof UnauthorizedError) return true;
  if (error instanceof ForbiddenError) return true;
  if (error instanceof NotFoundError) return true;
  
  return false;
}

/**
 * Función para obtener la ruta de redirección basada en el error
 */
export function getRedirectPath(error: unknown): string {
  if (error instanceof UnauthorizedError) return '/login';
  if (error instanceof ForbiddenError) return '/';
  if (error instanceof NotFoundError) return '/404';
  
  return '/';
}
