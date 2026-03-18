/**
 * Error Classes Index
 * 
 * Central export point for all custom error classes and types.
 * Provides a unified interface for error handling across the application.
 */

// Type definitions
export type {
  AppError,
  ValidationErrorDetail,
  ErrorResponse
} from './types';

export {
  ErrorSeverity,
  HttpStatusCode
} from './types';

// Error classes
export { ValidationError } from './ValidationError';
export { NotFoundError } from './NotFoundError';
export { ConflictError } from './ConflictError';
export { DatabaseError } from './DatabaseError';
export { StorageError } from './StorageError';
export { ExternalServiceError } from './ExternalServiceError';
