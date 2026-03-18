/**
 * ExternalServiceError
 * 
 * Thrown when there is an error with external services (e.g., OpenAI API).
 * HTTP Status: 500 Internal Server Error
 */

import { AppError, HttpStatusCode, ErrorSeverity } from './types';

export class ExternalServiceError extends Error implements AppError {
  code = 'EXTERNAL_SERVICE_ERROR';
  statusCode = HttpStatusCode.INTERNAL_SERVER_ERROR;
  severity = ErrorSeverity.HIGH;
  isOperational = true;

  /** Name of the external service */
  serviceName?: string;
  /** Endpoint that was called */
  endpoint?: string;
  /** HTTP status code from external service */
  externalStatusCode?: number;

  constructor(message: string, serviceName?: string, endpoint?: string, externalStatusCode?: number) {
    super(message);
    this.name = 'ExternalServiceError';
    this.serviceName = serviceName;
    this.endpoint = endpoint;
    this.externalStatusCode = externalStatusCode;
    
    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, ExternalServiceError);
  }
}
