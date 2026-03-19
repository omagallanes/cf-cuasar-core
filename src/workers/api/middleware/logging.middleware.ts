/**
 * Logging Middleware for VaaIA API Worker
 * 
 * Implements request/response logging with timing information.
 * Integrates with the existing StructuredLogger for consistent logging.
 * 
 * @module middleware/logging
 */

import { StructuredLogger } from '../utils/logger';

/**
 * Logging middleware configuration options
 */
export interface LoggingOptions {
  /** Whether to log request body */
  logRequestBody: boolean;
  /** Whether to log response body */
  logResponseBody: boolean;
  /** Whether to log query parameters */
  logQueryParams: boolean;
  /** Whether to log request headers */
  logHeaders: boolean;
  /** Maximum body size to log (in bytes) */
  maxBodySize: number;
  /** Paths to exclude from logging */
  excludePaths: string[];
  /** Request ID header name */
  requestIdHeader: string;
}

/**
 * Default logging configuration
 */
const defaultLoggingOptions: LoggingOptions = {
  logRequestBody: false,
  logResponseBody: false,
  logQueryParams: true,
  logHeaders: false,
  maxBodySize: 1024, // 1KB
  excludePaths: ['/health', '/ping'],
  requestIdHeader: 'X-Request-ID'
};

/**
 * Request context for logging
 */
export interface RequestContext {
  /** Request ID */
  requestId: string;
  /** Request method */
  method: string;
  /** Request URL */
  url: string;
  /** Request path */
  path: string;
  /** Query parameters */
  query: Record<string, string>;
  /** Request headers (if configured) */
  headers?: Record<string, string>;
  /** Request body (if configured) */
  body?: any;
  /** User agent */
  userAgent?: string;
  /** Client IP */
  clientIp?: string;
  /** Request start timestamp */
  startTime: number;
}

/**
 * Response context for logging
 */
export interface ResponseContext {
  /** Response status code */
  statusCode: number;
  /** Response status text */
  statusText: string;
  /** Response headers (if configured) */
  headers?: Record<string, string>;
  /** Response body (if configured) */
  body?: any;
  /** Response size in bytes */
  size?: number;
}

/**
 * Generates a unique request ID
 * 
 * @returns Unique request ID
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Extracts query parameters from a URL
 * 
 * @param url - URL to parse
 * @returns Query parameters object
 */
export function extractQueryParams(url: string): Record<string, string> {
  try {
    const urlObj = new URL(url);
    const params: Record<string, string> = {};
    urlObj.searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  } catch {
    return {};
  }
}

/**
 * Extracts the path from a URL
 * 
 * @param url - URL to parse
 * @returns URL path
 */
export function extractPath(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname;
  } catch {
    return url;
  }
}

/**
 * Checks if a path should be excluded from logging
 * 
 * @param path - Path to check
 * @param excludePaths - List of paths to exclude
 * @returns True if path should be excluded
 */
export function shouldExcludePath(path: string, excludePaths: string[]): boolean {
  return excludePaths.some(excludedPath => {
    if (excludedPath.endsWith('*')) {
      const prefix = excludedPath.slice(0, -1);
      return path.startsWith(prefix);
    }
    return path === excludedPath;
  });
}

/**
 * Truncates a body to the maximum size
 * 
 * @param body - Body to truncate
 * @param maxSize - Maximum size in bytes
 * @returns Truncated body
 */
export function truncateBody(body: any, maxSize: number): any {
  if (body === null || body === undefined) {
    return body;
  }

  if (typeof body === 'string') {
    if (body.length > maxSize) {
      return body.substring(0, maxSize) + '...[truncated]';
    }
    return body;
  }

  const bodyStr = JSON.stringify(body);
  if (bodyStr.length > maxSize) {
    return JSON.parse(bodyStr.substring(0, maxSize)) + '...[truncated]';
  }

  return body;
}

/**
 * Creates a logging middleware with the given options
 * 
 * @param logger - StructuredLogger instance
 * @param options - Logging configuration options (partial, merged with defaults)
 * @returns Logging middleware function
 */
export function logging(
  logger: StructuredLogger,
  options: Partial<LoggingOptions> = {}
) {
  const config: LoggingOptions = {
    ...defaultLoggingOptions,
    ...options
  };

  return async (
    request: Request,
    env: Record<string, string> = {},
    _ctx?: ExecutionContext
  ): Promise<Response | null> => {
    const startTime = Date.now();
    const requestId = request.headers.get(config.requestIdHeader) || generateRequestId();
    const url = request.url;
    const path = extractPath(url);

    // Skip logging for excluded paths
    if (shouldExcludePath(path, config.excludePaths)) {
      return null;
    }

    // Build request context
    const requestContext: RequestContext = {
      requestId,
      method: request.method,
      url,
      path,
      query: config.logQueryParams ? extractQueryParams(url) : {},
      startTime,
      userAgent: request.headers.get('User-Agent') || undefined,
      clientIp: request.headers.get('CF-Connecting-IP') || 
                 request.headers.get('X-Forwarded-For')?.split(',')[0] || undefined
    };

    // Log headers if configured
    if (config.logHeaders) {
      const headers: Record<string, string> = {};
      request.headers.forEach((value, key) => {
        // Skip sensitive headers
        if (!key.toLowerCase().includes('authorization') && 
            !key.toLowerCase().includes('cookie') &&
            !key.toLowerCase().includes('token')) {
          headers[key] = value;
        }
      });
      requestContext.headers = headers;
    }

    // Log request body if configured
    if (config.logRequestBody && request.method !== 'GET' && request.method !== 'HEAD') {
      try {
        const contentType = request.headers.get('Content-Type') || '';
        if (contentType.includes('application/json')) {
          const body = await request.clone().json();
          requestContext.body = truncateBody(body, config.maxBodySize);
        } else if (contentType.includes('text/')) {
          const body = await request.clone().text();
          requestContext.body = truncateBody(body, config.maxBodySize);
        }
      } catch {
        // Failed to parse body, skip logging it
      }
    }

    // Log the incoming request
    logger.info(`Incoming request: ${request.method} ${path}`, {
      requestId: requestContext.requestId,
      method: requestContext.method,
      path: requestContext.path,
      query: requestContext.query,
      userAgent: requestContext.userAgent,
      clientIp: requestContext.clientIp,
      headers: requestContext.headers,
      body: requestContext.body
    });

    // Store request context in the environment for later use
    (env as any).__requestContext = requestContext;

    // Return null to continue the middleware chain
    return null;
  };
}

/**
 * Logs a response with timing information
 * 
 * @param logger - StructuredLogger instance
 * @param requestContext - Request context from the request middleware
 * @param response - Response to log
 * @param config - Logging configuration
 */
export function logResponse(
  logger: StructuredLogger,
  requestContext: RequestContext,
  response: Response,
  config: LoggingOptions
): void {
  const duration = Date.now() - requestContext.startTime;

  const responseContext: ResponseContext = {
    statusCode: response.status,
    statusText: response.statusText,
    size: response.headers.get('Content-Length') 
      ? parseInt(response.headers.get('Content-Length')!, 10)
      : undefined
  };

  // Log response headers if configured
  if (config.logHeaders) {
    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });
    responseContext.headers = headers;
  }

  // Use the logger's logRequest method for consistent formatting
  logger.logRequest(
    requestContext.method,
    requestContext.path,
    responseContext.statusCode,
    duration,
    requestContext.requestId,
    undefined // userId would be extracted from auth context
  );
}

/**
 * Wraps a response handler to add logging
 * 
 * @param handler - Response handler function
 * @param logger - StructuredLogger instance
 * @param options - Logging configuration options
 * @returns Wrapped handler with logging support
 */
export function withLogging<T extends Request, E extends Record<string, string>>(
  handler: (request: T, env: E, ctx?: ExecutionContext) => Promise<Response>,
  logger: StructuredLogger,
  options: Partial<LoggingOptions> = {}
) {
  const config: LoggingOptions = {
    ...defaultLoggingOptions,
    ...options
  };

  return async (request: T, env: E, ctx?: ExecutionContext): Promise<Response> => {
    const startTime = Date.now();
    const requestId = request.headers.get(config.requestIdHeader) || generateRequestId();
    const url = request.url;
    const path = extractPath(url);

    // Skip logging for excluded paths
    if (shouldExcludePath(path, config.excludePaths)) {
      return await handler(request, env, ctx);
    }

    // Build request context
    const requestContext: RequestContext = {
      requestId,
      method: request.method,
      url,
      path,
      query: config.logQueryParams ? extractQueryParams(url) : {},
      startTime,
      userAgent: request.headers.get('User-Agent') || undefined,
      clientIp: request.headers.get('CF-Connecting-IP') || 
                 request.headers.get('X-Forwarded-For')?.split(',')[0] || undefined
    };

    // Log the incoming request
    logger.info(`Incoming request: ${request.method} ${path}`, {
      requestId: requestContext.requestId,
      method: requestContext.method,
      path: requestContext.path,
      query: requestContext.query,
      userAgent: requestContext.userAgent,
      clientIp: requestContext.clientIp
    });

    try {
      const response = await handler(request, env, ctx);
      
      // Log the response
      logResponse(logger, requestContext, response, config);
      
      return response;
    } catch (error) {
      // Log the error
      const duration = Date.now() - startTime;
      logger.error(`Request failed: ${request.method} ${path}`, error, {
        requestId: requestContext.requestId,
        duration
      });
      throw error;
    }
  };
}

/**
 * Creates a logging middleware with environment-based configuration
 * 
 * @param logger - StructuredLogger instance
 * @param env - Environment variables (optional)
 * @returns Logging middleware function
 */
export function loggingFromEnv(logger: StructuredLogger, env?: Record<string, string>) {
  const excludePaths = env?.LOG_EXCLUDE_PATHS?.split(',') || defaultLoggingOptions.excludePaths;
  
  return logging(logger, {
    logRequestBody: env?.LOG_REQUEST_BODY === 'true',
    logResponseBody: env?.LOG_RESPONSE_BODY === 'true',
    logQueryParams: env?.LOG_QUERY_PARAMS !== 'false',
    logHeaders: env?.LOG_HEADERS === 'true',
    maxBodySize: parseInt(env?.LOG_MAX_BODY_SIZE || defaultLoggingOptions.maxBodySize.toString(), 10),
    excludePaths,
    requestIdHeader: env?.LOG_REQUEST_ID_HEADER || defaultLoggingOptions.requestIdHeader
  });
}
