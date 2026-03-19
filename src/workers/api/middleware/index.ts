/**
 * Middleware Index for VaaIA API Worker
 *
 * Central export point for all middleware modules.
 * Provides a unified interface for middleware usage across the application.
 *
 * @module middleware
 */

// CORS Middleware
import {
  cors as _cors,
  corsFromEnv as _corsFromEnv,
  withCors as _withCors,
  addCorsHeaders as _addCorsHeaders,
  parseAllowedOrigins as _parseAllowedOrigins,
  isOriginAllowed as _isOriginAllowed
} from './cors.middleware';


// Logging Middleware
import {
  logging as _logging,
  loggingFromEnv as _loggingFromEnv,
  withLogging as _withLogging,
  logResponse as _logResponse,
  generateRequestId as _generateRequestId,
  extractQueryParams as _extractQueryParams,
  extractPath as _extractPath,
  shouldExcludePath as _shouldExcludePath,
  truncateBody as _truncateBody
} from './logging.middleware';

import type {
  LoggingOptions,
  RequestContext,
  ResponseContext
} from './logging.middleware';

// Re-export types for external use
export type {
  LoggingOptions,
  RequestContext,
  ResponseContext
};

// Error Handler Middleware
import {
  errorHandler as _errorHandler,
  errorHandlerFromEnv as _errorHandlerFromEnv,
  withErrorHandler as _withErrorHandler,
  createErrorResponse as _createErrorResponse,
  createErrorResponseFromError as _createErrorResponseFromError,
  createNotFoundResponse as _createNotFoundResponse,
  createMethodNotAllowedResponse as _createMethodNotAllowedResponse,
  isAppError as _isAppError,
  isStandardError as _isStandardError,
  extractErrorCode as _extractErrorCode,
  extractStatusCode as _extractStatusCode,
  extractErrorMessage as _extractErrorMessage,
  extractValidationDetails as _extractValidationDetails,
  extractStackTrace as _extractStackTrace,
  extractErrorContext as _extractErrorContext
} from './error-handler.middleware';


// Re-export for external use
export {
  _cors as cors,
  _corsFromEnv as corsFromEnv,
  _withCors as withCors,
  _addCorsHeaders as addCorsHeaders,
  _parseAllowedOrigins as parseAllowedOrigins,
  _isOriginAllowed as isOriginAllowed
};

export {
  _logging as logging,
  _loggingFromEnv as loggingFromEnv,
  _withLogging as withLogging,
  _logResponse as logResponse,
  _generateRequestId as generateRequestId,
  _extractQueryParams as extractQueryParams,
  _extractPath as extractPath,
  _shouldExcludePath as shouldExcludePath,
  _truncateBody as truncateBody
};

export {
  _errorHandler as errorHandler,
  _errorHandlerFromEnv as errorHandlerFromEnv,
  _withErrorHandler as withErrorHandler,
  _createErrorResponse as createErrorResponse,
  _createErrorResponseFromError as createErrorResponseFromError,
  _createNotFoundResponse as createNotFoundResponse,
  _createMethodNotAllowedResponse as createMethodNotAllowedResponse,
  _isAppError as isAppError,
  _isStandardError as isStandardError,
  _extractErrorCode as extractErrorCode,
  _extractStatusCode as extractStatusCode,
  _extractErrorMessage as extractErrorMessage,
  _extractValidationDetails as extractValidationDetails,
  _extractStackTrace as extractStackTrace,
  _extractErrorContext as extractErrorContext
};

/**
 * Middleware chain type for composing multiple middleware
 */
export type MiddlewareFunction<T extends Request, E extends Record<string, string>> = (
  request: T,
  env: E,
  ctx?: ExecutionContext
) => Promise<Response | null>;

/**
 * Composes multiple middleware functions into a single middleware
 * 
 * Middleware are executed in the order they are provided.
 * Each middleware receives the request, environment, and context.
 * If a middleware returns a Response, the chain stops and that response is returned.
 * If a middleware returns null, the chain continues to the next middleware.
 * 
 * @param middlewares - Array of middleware functions to compose
 * @returns Composed middleware function
 */
export function composeMiddleware<T extends Request, E extends Record<string, string>>(
  ...middlewares: MiddlewareFunction<T, E>[]
): MiddlewareFunction<T, E> {
  return async (request: T, env: E, ctx?: ExecutionContext): Promise<Response | null> => {
    for (const middleware of middlewares) {
      const result = await middleware(request, env, ctx);
      if (result !== null) {
        return result;
      }
    }
    return null;
  };
}

/**
 * Creates a middleware chain with CORS, logging, and error handling
 *
 * This is a convenience function that creates a standard middleware chain
 * with the three core middleware in the recommended order:
 * 1. CORS - Handle preflight requests and add CORS headers
 * 2. Logging - Log incoming requests
 * 3. Error handling - Catch and handle errors
 *
 * @param logger - StructuredLogger instance
 * @param corsOptions - CORS configuration options (optional)
 * @param loggingOptions - Logging configuration options (optional)
 * @param errorHandlerOptions - Error handler configuration options (optional)
 * @returns Composed middleware function
 */
export function createStandardMiddlewareChain<T extends Request, E extends Record<string, string>>(
  logger: any,
  corsOptions?: Parameters<typeof _cors>[0],
  loggingOptions?: Parameters<typeof _logging>[1],
  errorHandlerOptions?: Parameters<typeof _errorHandler>[1]
): MiddlewareFunction<T, E> {
  const corsMiddleware = _cors(corsOptions);
  const loggingMiddleware = _logging(logger, loggingOptions);
  void _errorHandler(logger, errorHandlerOptions);

  return composeMiddleware<T, E>(
    corsMiddleware,
    loggingMiddleware
  );
}

/**
 * Creates a middleware chain from environment variables
 *
 * This is a convenience function that creates a standard middleware chain
 * configured from environment variables.
 *
 * @param logger - StructuredLogger instance
 * @param env - Environment variables
 * @returns Composed middleware function
 */
export function createMiddlewareChainFromEnv<T extends Request, E extends Record<string, string>>(
  logger: any,
  env: Record<string, string>
): MiddlewareFunction<T, E> {
  const corsMiddleware = _corsFromEnv(env);
  const loggingMiddleware = _loggingFromEnv(logger, env);
  void _errorHandlerFromEnv(logger, env);

  return composeMiddleware<T, E>(
    corsMiddleware,
    loggingMiddleware
  );
}
