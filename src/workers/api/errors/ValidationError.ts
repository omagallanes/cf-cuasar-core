/**
 * ValidationError
 * 
 * Thrown when I-JSON or request data is invalid.
 * HTTP Status: 400 Bad Request
 */

import { AppError, HttpStatusCode, ErrorSeverity, ValidationErrorDetail } from './types';

export class ValidationError extends Error implements AppError {
  code = 'VALIDATION_ERROR';
  statusCode = HttpStatusCode.BAD_REQUEST;
  severity = ErrorSeverity.LOW;
  isOperational = true;

  /** Validation details for each field that failed */
  details: ValidationErrorDetail[];

  constructor(message: string, details: ValidationErrorDetail[] = []) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
    
    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, ValidationError);
  }

  /**
   * Adds a validation detail to the error
   */
  addDetail(field: string, message: string, constraint?: string, received?: any): void {
    this.details.push({ field, message, constraint, received });
  }

  /**
   * Checks if there are validation details
   */
  hasDetails(): boolean {
    return this.details.length > 0;
  }
}
