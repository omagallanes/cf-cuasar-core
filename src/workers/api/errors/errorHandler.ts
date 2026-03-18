/**
 * Error Handler Middleware for Hono
 *
 * Provides centralized error handling for the VaaIA API Worker.
 * Captures errors, logs them, and returns appropriate HTTP responses.
 */

import type { ErrorHandler } from 'hono';
import type { Context } from 'hono';

import {
  ValidationError
} from './index';

import { AppError, ErrorResponse, HttpStatusCode } from './types';
import { logger } from '../utils/logger';

/**
 * Sanitizes error messages to prevent exposing sensitive information
 */
function sanitizeErrorMessage(error: Error, isDevelopment: boolean): string {
  // For custom AppError, use the message as-is (they should be sanitized)
  if ('isOperational' in error && error.isOperational) {
    return error.message;
  }

  // For non-operational errors in production, use generic message
  if (!isDevelopment) {
    return 'Internal server error';
  }

  // In development, show the actual error message
  return error.message;
}

/**
 * Checks if the environment is development
 */
function isDevelopmentEnvironment(): boolean {
  return process.env.ENVIRONMENT === 'development';
}

/**
 * Builds error response object
 */
function buildErrorResponse(error: AppError, isDevelopment: boolean): ErrorResponse {
  const response: ErrorResponse = {
    error: sanitizeErrorMessage(error, isDevelopment)
  };

  // Add error code for operational errors
  if (error.isOperational) {
    response.code = error.code;
  }

  // Add validation details for ValidationError
  if (error instanceof ValidationError && error.hasDetails()) {
    response.details = error.details.map(detail => ({
      field: detail.field,
      message: detail.message,
      constraint: isDevelopment ? detail.constraint : undefined,
      received: isDevelopment ? detail.received : undefined
    }));
  }

  return response;
}

/**
 * Extracts request context for logging
 */
function extractRequestContext(c: Context): Record<string, any> {
  return {
    method: c.req.method,
    path: c.req.path,
    url: c.req.url,
    userAgent: c.req.header('user-agent'),
    requestId: c.req.header('x-request-id')
  };
}

/**
 * Error Handler Middleware
 * 
 * Catches all errors thrown during request processing and returns
 * appropriate HTTP responses with standardized error format.
 */
export const errorHandler: ErrorHandler = async (err: Error, c: Context) => {
  const isDevelopment = isDevelopmentEnvironment();
  const requestContext = extractRequestContext(c);

  // Determine if this is a custom AppError
  const isAppError = 'statusCode' in err && 'code' in err;

  // Get status code (default to 500)
  const statusCode = isAppError
    ? (err as AppError).statusCode
    : HttpStatusCode.INTERNAL_SERVER_ERROR;

  // Log the error with structured information
  if (isAppError) {
    const appError = err as AppError;
    logger.logError(
      appError.message,
      appError.code,
      appError.statusCode,
      appError,
      {
        ...requestContext,
        severity: appError.severity,
        context: appError.context
      }
    );
  } else {
    logger.error(
      'Unhandled error',
      err,
      requestContext
    );
  }

  // Build error response
  const errorResponse = isAppError
    ? buildErrorResponse(err as AppError, isDevelopment)
    : { error: sanitizeErrorMessage(err, isDevelopment) };

  // Return error response with appropriate status code
  return c.json(errorResponse, statusCode);
};

/**
 * Creates a 404 Not Found handler
 */
export const notFoundHandler = (c: Context) => {
  const requestContext = extractRequestContext(c);

  logger.warn('Resource not found', {
    ...requestContext,
    statusCode: HttpStatusCode.NOT_FOUND
  });

  return c.json(
    { error: 'Resource not found' },
    HttpStatusCode.NOT_FOUND
  );
};
