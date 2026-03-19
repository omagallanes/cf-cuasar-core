/**
 * Cliente HTTP configurado con axios para comunicación con la API
 */

import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiErrorResponse, ApiSuccessResponse } from '../types/api';
import {
  NetworkError,
  ValidationError as ValidationErrorException,
  NotFoundError,
  ConflictError,
  WorkflowError,
  UnauthorizedError,
  ForbiddenError,
  TimeoutError,
  ServerError
} from '../types/errors';

/**
 * Error personalizado para respuestas de la API
 * @deprecated Usar los tipos de error específicos (NetworkError, ValidationError, etc.)
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string,
    public details?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
import { errorMessages, logError } from '../config/errors';

/**
 * Mapear códigos de estado HTTP a tipos de error personalizados
 */
function mapHttpErrorToCustomError(
  error: AxiosError<ApiErrorResponse>
): Error {
  const { response, request, message } = error;
  const status = response?.status;
  const data = response?.data;
  const errorMessage = data?.error || data?.details || errorMessages.general.unknown.message;

  // Error de timeout
  if (error.code === 'ECONNABORTED' || message.includes('timeout')) {
    return new TimeoutError(errorMessages.general.timeout.message);
  }

  // Error de red (sin respuesta)
  if (!response && request) {
    return new NetworkError(errorMessages.general.network.message);
  }

  // Error de configuración de solicitud
  if (!response && !request) {
    return new ApiError(errorMessages.general.unknown.message);
  }

  // Errores basados en código de estado
  switch (status) {
    case 400:
      // Error de validación
      if (data?.errors && Array.isArray(data.errors)) {
        return new ValidationErrorException(errorMessage);
      }
      return new ApiError(errorMessage, status, 'BAD_REQUEST');

    case 401:
      return new UnauthorizedError(errorMessages.general.unauthorized.message);

    case 403:
      return new ForbiddenError(errorMessages.general.forbidden.message);

    case 404:
      return new NotFoundError(errorMessages.general.notFound.message);

    case 409:
      return new ConflictError(errorMessages.api.conflict.message);

    case 422:
      return new ValidationErrorException(errorMessage);

    case 429:
      return new ApiError(
        errorMessages.api.rateLimitExceeded.message,
        status,
        'RATE_LIMIT_EXCEEDED'
      );

    case 500:
    case 502:
    case 503:
    case 504:
      return new ServerError(errorMessages.api.serverError.message);

    default:
      return new ApiError(errorMessage, status, 'UNKNOWN_ERROR');
  }
}

/**
 * Crear instancia de axios configurada
 */
const createApiClient = (): AxiosInstance => {
  const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787',
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 30000, // 30 segundos de timeout
  });

  /**
   * Interceptor de solicitud - Agregar logging y headers
   */
  apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // Logging opcional para desarrollo
      if (import.meta.env.DEV) {
        console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
      }
      return config;
    },
    (error: AxiosError) => {
      logError(error, 'API Request');
      return Promise.reject(error);
    }
  );

  /**
   * Interceptor de respuesta - Manejo de errores y logging
   */
  apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
      // Logging opcional para desarrollo
      if (import.meta.env.DEV) {
        console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
      }
      return response;
    },
    (error: AxiosError<ApiErrorResponse>) => {
      // Transformar error de Axios a error personalizado
      const customError = mapHttpErrorToCustomError(error);
      
      // Loggear el error
      logError(customError, 'API Response');
      
      // Rechazar con el error personalizado
      return Promise.reject(customError);
    }
  );

  return apiClient;
};

/**
 * Instancia única del cliente API
 */
export const apiClient = createApiClient();

/**
 * Función auxiliar para verificar si un error es de un tipo específico
 */
export function isNetworkError(error: unknown): error is NetworkError {
  return error instanceof NetworkError;
}

export function isValidationError(error: unknown): error is ValidationErrorException {
  return error instanceof ValidationErrorException;
}

export function isNotFoundError(error: unknown): error is NotFoundError {
  return error instanceof NotFoundError;
}

export function isConflictError(error: unknown): error is ConflictError {
  return error instanceof ConflictError;
}

export function isWorkflowError(error: unknown): error is WorkflowError {
  return error instanceof WorkflowError;
}

export function isUnauthorizedError(error: unknown): error is UnauthorizedError {
  return error instanceof UnauthorizedError;
}

export function isForbiddenError(error: unknown): error is ForbiddenError {
  return error instanceof ForbiddenError;
}

export function isTimeoutError(error: unknown): error is TimeoutError {
  return error instanceof TimeoutError;
}

export function isServerError(error: unknown): error is ServerError {
  return error instanceof ServerError;
}

/**
 * Manejar errores de API y convertirlos a ApiError
 */
export function handleApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }
  if (error instanceof Error) {
    return new ApiError(error.message);
  }
  return new ApiError('Unknown error occurred');
}

/**
 * Extraer datos de una respuesta de API exitosa
 */
export function extractData<T>(response: AxiosResponse<ApiSuccessResponse<T>>): T {
  return response.data.data;
}
