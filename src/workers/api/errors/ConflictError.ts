/**
 * ConflictError
 * 
 * Thrown when there is a conflict with the current state of the resource.
 * HTTP Status: 409 Conflict
 */

import { AppError, HttpStatusCode, ErrorSeverity } from './types';

export class ConflictError extends Error implements AppError {
  code = 'CONFLICT';
  statusCode = HttpStatusCode.CONFLICT;
  severity = ErrorSeverity.MEDIUM;
  isOperational = true;

  /** Type of conflict */
  conflictType?: string;
  /** Current state that caused the conflict */
  currentState?: string;

  constructor(message: string, conflictType?: string, currentState?: string) {
    super(message);
    this.name = 'ConflictError';
    this.conflictType = conflictType;
    this.currentState = currentState;
    
    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, ConflictError);
  }
}
