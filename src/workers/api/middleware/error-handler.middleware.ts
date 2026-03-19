/**
 * Error Handler Middleware for VaaIA API Worker
 * 
 * Implements centralized error handling with consistent error responses.
 * Integrates with existing error types and the StructuredLogger.
 * 
 * @module middleware/error-handler
 */

import { StructuredLogger } from '../utils/logger';
import type { AppError, ErrorResponse, ValidationErrorDetail } from '../errors/types';
import { HttpStatusCode } from '../errors/types';

/**
 * Error handler middleware configuration options
 */
export interface ErrorHandlerOptions {
  /** Whether to include stack traces in error responses (development only) */
  includeStackTraces: boolean;
  /** Whether to log all errors */
  logErrors: boolean;
  /** Whether to expose error details to clients */
  exposeErrorDetails: boolean;
  /** Default error message for unexpected errors */
  defaultErrorMessage: string;
}

/**
 * Default error handler configuration
 */
const defaultErrorHandlerOptions: ErrorHandlerOptions = {
  includeStackTraces: false,
  logErrors: true,
  exposeErrorDetails: false,
  defaultErrorMessage: 'An unexpected error occurred. Please try again later.'
};

/**
 * Checks if an error is an AppError
 * 
 * @param error - Error to check
 * @returns True if error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'statusCode' in error &&
    'severity' in error &&
    'isOperational' in error
  );
}

/**
 * Checks if an error is a standard Error
 * 
 * @param error - Error to check
 * @returns True if error is a standard Error
 */
export function isStandardError(error: unknown): error is Error {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    'name' in error
  );
}

/**
 * Extracts error code from an error
 * 
 * @param error - Error to extract code from
 * @returns Error code or default code
 */
export function extractErrorCode(error: unknown): string {
  if (isAppError(error)) {
    return error.code;
  }
  if (isStandardError(error)) {
    return error.name;
  }
  return 'UNKNOWN_ERROR';
}

/**
 * Extracts HTTP status code from an error
 * 
 * @param error - Error to extract status code from
 * @returns HTTP status code
 */
export function extractStatusCode(error: unknown): HttpStatusCode {
  if (isAppError(error)) {
    return error.statusCode;
  }
  if (isStandardError(error)) {
    // Map common error types to status codes
    const errorName = error.name.toLowerCase();
    if (errorName.includes('validation') || errorName.includes('badrequest')) {
      return HttpStatusCode.BAD_REQUEST;
    }
    if (errorName.includes('notfound')) {
      return HttpStatusCode.NOT_FOUND;
    }
    if (errorName.includes('conflict')) {
      return HttpStatusCode.CONFLICT;
    }
    if (errorName.includes('unauthorized')) {
      return HttpStatusCode.UNAUTHORIZED;
    }
    if (errorName.includes('forbidden')) {
      return HttpStatusCode.FORBIDDEN;
    }
  }
  return HttpStatusCode.INTERNAL_SERVER_ERROR;
}

/**
 * Extracts error message from an error
 * 
 * @param error - Error to extract message from
 * @param defaultMessage - Default message if no message found
 * @returns Error message
 */
export function extractErrorMessage(error: unknown, defaultMessage: string): string {
  if (isAppError(error)) {
    return error.message;
  }
  if (isStandardError(error)) {
    return error.message;
  }
  return defaultMessage;
}

/**
 * Extracts validation details from an error
 * 
 * @param error - Error to extract details from
 * @returns Validation details or undefined
 */
export function extractValidationDetails(error: unknown): ValidationErrorDetail[] | undefined {
  if (isAppError(error) && 'details' in error && Array.isArray(error.details)) {
    return error.details as ValidationErrorDetail[];
  }
  return undefined;
}

/**
 * Extracts stack trace from an error
 * 
 * @param error - Error to extract stack trace from
 * @returns Stack trace or undefined
 */
export function extractStackTrace(error: unknown): string | undefined {
  if (isStandardError(error)) {
    return error.stack;
  }
  return undefined;
}

/**
 * Extracts error context from an error
 * 
 * @param error - Error to extract context from
 * @returns Error context or undefined
 */
export function extractErrorContext(error: unknown): Record<string, any> | undefined {
  if (isAppError(error)) {
    return error.context;
  }
  return undefined;
}

/**
 * Creates an error response object
 * 
 * @param error - Error to create response from
 * @param options - Error handler options
 * @returns Error response object
 */
export function createErrorResponse(
  error: unknown,
  options: ErrorHandlerOptions
): ErrorResponse {
  const code = extractErrorCode(error);
  const message = extractErrorMessage(error, options.defaultErrorMessage);
  const details = extractValidationDetails(error);

  const response: ErrorResponse = {
    error: message,
    code: options.exposeErrorDetails ? code : undefined,
    details: options.exposeErrorDetails ? details : undefined
  };

  return response;
}

/**
 * Creates an HTTP response from an error
 * 
 * @param error - Error to create response from
 * @param logger - StructuredLogger instance
 * @param options - Error handler options
 * @param requestId - Request ID for logging
 * @returns HTTP Response object
 */
export function createErrorResponseFromError(
  error: unknown,
  logger: StructuredLogger,
  options: ErrorHandlerOptions,
  requestId?: string
): Response {
  const statusCode = extractStatusCode(error);
  const errorResponse = createErrorResponse(error, options);
  const context = extractErrorContext(error);

  // Log the error
  if (options.logErrors) {
    if (isAppError(error)) {
      logger.logError(
        error.message,
        error.code,
        error.statusCode,
        error,
        {
          requestId,
          severity: error.severity,
          isOperational: error.isOperational,
          context
        }
      );
    } else if (isStandardError(error)) {
      logger.error(error.message, error, {
        requestId,
        context
      });
    } else {
      logger.error('Unknown error occurred', error, {
        requestId,
        context
      });
    }
  }

  // Create response headers
  const headers = new Headers();
  headers.set('Content-Type', 'application/json');
  if (requestId) {
    headers.set('X-Request-ID', requestId);
  }

  // Create response body
  const body = JSON.stringify(errorResponse);

  // Include stack trace in development if configured
  if (options.includeStackTraces) {
    const stack = extractStackTrace(error);
    if (stack) {
      const bodyWithStack = JSON.parse(body);
      bodyWithStack.stack = stack;
      return new Response(JSON.stringify(bodyWithStack), {
        status: statusCode,
        headers
      });
    }
  }

  return new Response(body, {
    status: statusCode,
    headers
  });
}

/**
 * Error handler middleware function
 * 
 * This middleware should be the last middleware in the chain.
 * It catches any errors thrown by previous middleware or handlers.
 * 
 * @param logger - StructuredLogger instance
 * @param options - Error handler configuration options (partial, merged with defaults)
 * @returns Error handler middleware function
 */
export function errorHandler(
  logger: StructuredLogger,
  options: Partial<ErrorHandlerOptions> = {}
) {
  const config: ErrorHandlerOptions = {
    ...defaultErrorHandlerOptions,
    ...options
  };

  return async (
    error: unknown,
    _request: Request,
    _env: Record<string, string> = {},
    _ctx?: ExecutionContext
  ): Promise<Response> => {
    // Extract request ID from environment (set by logging middleware)
    const requestId = (_env as any).__requestContext?.requestId;

    return createErrorResponseFromError(error, logger, config, requestId);
  };
}

/**
 * Wraps a handler function with error handling
 * 
 * @param handler - Handler function to wrap
 * @param logger - StructuredLogger instance
 * @param options - Error handler configuration options
 * @returns Wrapped handler with error handling
 */
export function withErrorHandler<T extends Request, E extends Record<string, string>>(
  handler: (request: T, env: E, ctx?: ExecutionContext) => Promise<Response>,
  logger: StructuredLogger,
  options: Partial<ErrorHandlerOptions> = {}
) {
  const config: ErrorHandlerOptions = {
    ...defaultErrorHandlerOptions,
    ...options
  };

  return async (request: T, env: E, ctx?: ExecutionContext): Promise<Response> => {
    try {
      return await handler(request, env, ctx);
    } catch (error) {
      // Extract request ID from environment (set by logging middleware)
      const requestId = (env as any).__requestContext?.requestId;

      return createErrorResponseFromError(error, logger, config, requestId);
    }
  };
}

/**
 * Creates an error handler middleware with environment-based configuration
 * 
 * @param logger - StructuredLogger instance
 * @param env - Environment variables (optional)
 * @returns Error handler middleware function
 */
export function errorHandlerFromEnv(logger: StructuredLogger, env?: Record<string, string>) {
  const isDevelopment = env?.ENVIRONMENT === 'development' || env?.NODE_ENV === 'development';
  
  return errorHandler(logger, {
    includeStackTraces: isDevelopment,
    logErrors: env?.LOG_ERRORS !== 'false',
    exposeErrorDetails: isDevelopment || env?.EXPOSE_ERROR_DETAILS === 'true',
    defaultErrorMessage: env?.DEFAULT_ERROR_MESSAGE || defaultErrorHandlerOptions.defaultErrorMessage
  });
}

/**
 * Creates a 404 Not Found response
 * 
 * @param path - Path that was not found
 * @param logger - StructuredLogger instance
 * @param requestId - Request ID for logging
 * @returns 404 Response
 */
export function createNotFoundResponse(
  path: string,
  logger: StructuredLogger,
  requestId?: string
): Response {
  logger.warn(`Path not found: ${path}`, { requestId });

  const headers = new Headers();
  headers.set('Content-Type', 'application/json');
  if (requestId) {
    headers.set('X-Request-ID', requestId);
  }

  const body = JSON.stringify({
    error: `The requested path '${path}' was not found.`,
    code: 'NOT_FOUND'
  });

  return new Response(body, {
    status: HttpStatusCode.NOT_FOUND,
    headers
  });
}

/**
 * Creates a 405 Method Not Allowed response
 * 
 * @param method - HTTP method that was used
 * @param allowedMethods - List of allowed methods
 * @param logger - StructuredLogger instance
 * @param requestId - Request ID for logging
 * @returns 405 Response
 */
export function createMethodNotAllowedResponse(
  method: string,
  allowedMethods: string[],
  logger: StructuredLogger,
  requestId?: string
): Response {
  logger.warn(`Method not allowed: ${method}`, { requestId, allowedMethods });

  const headers = new Headers();
  headers.set('Content-Type', 'application/json');
  headers.set('Allow', allowedMethods.join(', '));
  if (requestId) {
    headers.set('X-Request-ID', requestId);
  }

  const body = JSON.stringify({
    error: `Method '${method}' is not allowed for this resource.`,
    code: 'METHOD_NOT_ALLOWED'
  });

  return new Response(body, {
    status: 405,
    headers
  });
}
