/**
 * DatabaseError
 * 
 * Thrown when there is an error with D1 database operations.
 * HTTP Status: 500 Internal Server Error
 */

import { AppError, HttpStatusCode, ErrorSeverity } from './types';

export class DatabaseError extends Error implements AppError {
  code = 'DATABASE_ERROR';
  statusCode = HttpStatusCode.INTERNAL_SERVER_ERROR;
  severity = ErrorSeverity.HIGH;
  isOperational = true;

  /** Type of database operation that failed */
  operation?: string;
  /** Table or collection being accessed */
  table?: string;
  /** Query that caused the error (sanitized in production) */
  query?: string;

  constructor(message: string, operation?: string, table?: string, query?: string) {
    super(message);
    this.name = 'DatabaseError';
    this.operation = operation;
    this.table = table;
    this.query = query;
    
    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, DatabaseError);
  }
}
