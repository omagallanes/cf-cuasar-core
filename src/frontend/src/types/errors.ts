/**
 * Tipos de error personalizados para el frontend
 * Proporciona una estructura consistente para manejar diferentes tipos de errores
 */

/**
 * Error de red - Error de conexión con API
 */
export class NetworkError extends Error {
  constructor(message: string = 'Error de conexión con el servidor') {
    super(message);
    this.name = 'NetworkError';
  }
}

/**
 * Error de validación - Error de validación de datos
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public value?: unknown
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Error de recurso no encontrado
 */
export class NotFoundError extends Error {
  constructor(message: string = 'El recurso solicitado no fue encontrado') {
    super(message);
    this.name = 'NotFoundError';
  }
}

/**
 * Error de conflicto - Conflicto de estado
 */
export class ConflictError extends Error {
  constructor(message: string = 'Ya existe un recurso con estos datos') {
    super(message);
    this.name = 'ConflictError';
  }
}

/**
 * Error de workflow - Error en ejecución de workflow
 */
export class WorkflowError extends Error {
  constructor(
    message: string,
    public step?: string,
    public workflowId?: string
  ) {
    super(message);
    this.name = 'WorkflowError';
  }
}

/**
 * Error de API - Error genérico de la API
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

/**
 * Error de autorización - No autorizado
 */
export class UnauthorizedError extends Error {
  constructor(message: string = 'No tienes autorización para realizar esta acción') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

/**
 * Error de permisos - Acceso prohibido
 */
export class ForbiddenError extends Error {
  constructor(message: string = 'No tienes permisos para acceder a este recurso') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

/**
 * Error de timeout - Tiempo de espera excedido
 */
export class TimeoutError extends Error {
  constructor(message: string = 'La solicitud excedió el tiempo de espera') {
    super(message);
    this.name = 'TimeoutError';
  }
}

/**
 * Error de servidor - Error interno del servidor
 */
export class ServerError extends Error {
  constructor(message: string = 'Error del servidor. Por favor, intenta nuevamente más tarde.') {
    super(message);
    this.name = 'ServerError';
  }
}

/**
 * Tipo de acción sugerida para el usuario
 */
export type SuggestedAction =
  | 'retry'
  | 'refresh'
  | 'contact_support'
  | 'check_connection'
  | 'login'
  | 'go_back'
  | 'none';

/**
 * Interfaz para información de error amigable
 */
export interface ErrorInfo {
  /** Título del error */
  title: string;
  /** Mensaje descriptivo del error */
  message: string;
  /** Acción sugerida para el usuario */
  suggestedAction: SuggestedAction;
  /** Texto del botón de acción */
  actionLabel: string;
  /** Indica si el error es recuperable */
  isRecoverable: boolean;
  /** Detalles técnicos (solo para debugging) */
  technicalDetails?: string;
}

/**
 * Interfaz para contexto de error en ErrorBoundary
 */
export interface ErrorBoundaryContext {
  /** Error capturado */
  error: Error;
  /** Información del error */
  errorInfo: React.ErrorInfo;
  /** Función para reintentar */
  resetError: () => void;
}
