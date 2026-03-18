/**
 * StorageError
 * 
 * Thrown when there is an error with R2 storage operations.
 * HTTP Status: 500 Internal Server Error
 */

import { AppError, HttpStatusCode, ErrorSeverity } from './types';

export class StorageError extends Error implements AppError {
  code = 'STORAGE_ERROR';
  statusCode = HttpStatusCode.INTERNAL_SERVER_ERROR;
  severity = ErrorSeverity.HIGH;
  isOperational = true;

  /** Type of storage operation that failed */
  operation?: string;
  /** Bucket name */
  bucket?: string;
  /** Key or path being accessed */
  key?: string;

  constructor(message: string, operation?: string, bucket?: string, key?: string) {
    super(message);
    this.name = 'StorageError';
    this.operation = operation;
    this.bucket = bucket;
    this.key = key;
    
    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, StorageError);
  }
}
