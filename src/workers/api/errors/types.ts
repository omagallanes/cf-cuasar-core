/**
 * Error Types for VaaIA API Worker
 * 
 * Defines the base error interface and error severity levels
 * for structured error handling across the application.
 */

/**
 * Error severity levels for logging and monitoring
 */
export enum ErrorSeverity {
  /** Low severity - informational, does not affect functionality */
  LOW = 'low',
  /** Medium severity - affects specific operations but not overall system */
  MEDIUM = 'medium',
  /** High severity - affects critical functionality */
  HIGH = 'high',
  /** Critical severity - system-wide impact */
  CRITICAL = 'critical'
}

/**
 * HTTP status codes mapping
 */
export enum HttpStatusCode {
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503
}

/**
 * Base error interface for all custom errors
 */
export interface AppError extends Error {
  /** Unique error code for identification */
  code: string;
  /** HTTP status code to return */
  statusCode: HttpStatusCode;
  /** Error severity for logging */
  severity: ErrorSeverity;
  /** Whether to expose details to client */
  isOperational: boolean;
  /** Original error that caused this error */
  cause?: unknown;
  /** Additional context for debugging */
  context?: Record<string, any>;
}

/**
 * Error details for validation errors
 */
export interface ValidationErrorDetail {
  /** Field name that failed validation */
  field: string;
  /** Human-readable error message */
  message: string;
  /** Expected value or constraint */
  constraint?: string;
  /** Actual value received */
  received?: any;
}

/**
 * Sanitized error response for clients
 */
export interface ErrorResponse {
  /** Error message */
  error: string;
  /** Unique error code */
  code?: string;
  /** Validation details (only for ValidationError) */
  details?: ValidationErrorDetail[];
}
