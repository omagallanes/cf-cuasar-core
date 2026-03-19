/**
 * Interfaz para respuesta exitosa de la API
 */
export interface ApiSuccessResponse<T> {
  data: T;
  message?: string;
}

/**
 * Interfaz para respuesta de error de la API
 */
export interface ApiErrorResponse {
  error: string;
  details?: string;
  code?: string;
  errors?: ValidationError[];
}

/**
 * Tipo unión para respuestas de la API
 */
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Función para verificar si una respuesta es exitosa
 */
export function isSuccessResponse<T>(response: ApiResponse<T>): response is ApiSuccessResponse<T> {
  return 'data' in response;
}

/**
 * Función para verificar si una respuesta es de error
 */
export function isErrorResponse<T>(response: ApiResponse<T>): response is ApiErrorResponse {
  return 'error' in response;
}

/**
 * Interfaz para parámetros de paginación
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/**
 * Interfaz para respuesta paginada
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Interfaz para error de validación
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Interfaz para respuesta de error de validación
 */
export interface ValidationErrorResponse extends ApiErrorResponse {
  errors: ValidationError[];
}

/**
 * Códigos de error HTTP comunes
 */
export enum ErrorCode {
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR'
}
