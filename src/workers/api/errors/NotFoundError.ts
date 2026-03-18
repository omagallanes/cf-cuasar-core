/**
 * NotFoundError
 * 
 * Thrown when a requested resource does not exist.
 * HTTP Status: 404 Not Found
 */

import { AppError, HttpStatusCode, ErrorSeverity } from './types';

export class NotFoundError extends Error implements AppError {
  code = 'NOT_FOUND';
  statusCode = HttpStatusCode.NOT_FOUND;
  severity = ErrorSeverity.LOW;
  isOperational = true;

  /** Type of resource that was not found */
  resourceType?: string;
  /** ID of the resource that was not found */
  resourceId?: string;

  constructor(message: string, resourceType?: string, resourceId?: string) {
    super(message);
    this.name = 'NotFoundError';
    this.resourceType = resourceType;
    this.resourceId = resourceId;
    
    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, NotFoundError);
  }
}
