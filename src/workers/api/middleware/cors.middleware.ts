/**
 * CORS Middleware for VaaIA API Worker
 * 
 * Implements Cross-Origin Resource Sharing (CORS) handling for the API.
 * Configures appropriate CORS headers and handles preflight requests.
 * 
 * @module middleware/cors
 */

/**
 * CORS configuration options
 */
export interface CorsOptions {
  /** Allowed origins (array of strings or '*' for any origin) */
  allowedOrigins: string[];
  /** Allowed HTTP methods */
  allowedMethods: string[];
  /** Allowed request headers */
  allowedHeaders: string[];
  /** Headers that can be exposed to the client */
  exposedHeaders: string[];
  /** Whether credentials are allowed */
  allowCredentials: boolean;
  /** Maximum age for preflight requests (in seconds) */
  maxAge: number;
}

/**
 * Default CORS configuration
 */
const defaultCorsOptions: CorsOptions = {
  allowedOrigins: ['*'],
  allowedMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  exposedHeaders: ['X-Request-ID'],
  allowCredentials: false,
  maxAge: 86400 // 24 hours
};

/**
 * Parses allowed origins from environment variable
 * 
 * @param env - Environment variables
 * @returns Array of allowed origins
 */
export function parseAllowedOrigins(env?: Record<string, string>): string[] {
  if (!env) {
    return defaultCorsOptions.allowedOrigins;
  }

  const corsOrigins = env.CORS_ORIGINS || env.ALLOWED_ORIGINS;
  
  if (!corsOrigins) {
    return defaultCorsOptions.allowedOrigins;
  }

  // Handle comma-separated list
  if (corsOrigins.includes(',')) {
    return corsOrigins.split(',').map(origin => origin.trim());
  }

  // Handle space-separated list
  if (corsOrigins.includes(' ')) {
    return corsOrigins.split(' ').map(origin => origin.trim());
  }

  // Single origin
  return [corsOrigins.trim()];
}

/**
 * Checks if an origin is allowed
 * 
 * @param origin - Origin to check
 * @param allowedOrigins - List of allowed origins
 * @returns True if origin is allowed
 */
export function isOriginAllowed(origin: string | null, allowedOrigins: string[]): boolean {
  // Allow all origins if '*' is in the list
  if (allowedOrigins.includes('*')) {
    return true;
  }

  // No origin provided (e.g., same-origin requests)
  if (!origin) {
    return true;
  }

  // Check if origin is in the allowed list
  return allowedOrigins.includes(origin);
}

/**
 * Creates a CORS middleware with the given options
 * 
 * @param options - CORS configuration options (partial, merged with defaults)
 * @returns CORS middleware function
 */
export function cors(options: Partial<CorsOptions> = {}) {
  const config: CorsOptions = {
    ...defaultCorsOptions,
    ...options
  };

  return async (
    request: Request,
    _env: Record<string, string> = {}
  ): Promise<Response | null> => {
    const origin = request.headers.get('Origin');
    const method = request.method;

    // Handle preflight OPTIONS requests
    if (method === 'OPTIONS') {
      const headers = new Headers();

      // Only add Access-Control-Allow-Origin if origin is allowed
      if (origin && isOriginAllowed(origin, config.allowedOrigins)) {
        headers.set('Access-Control-Allow-Origin', origin);
      } else if (config.allowedOrigins.includes('*')) {
        headers.set('Access-Control-Allow-Origin', '*');
      }

      headers.set('Access-Control-Allow-Methods', config.allowedMethods.join(', '));
      headers.set('Access-Control-Allow-Headers', config.allowedHeaders.join(', '));
      headers.set('Access-Control-Expose-Headers', config.exposedHeaders.join(', '));

      if (config.allowCredentials) {
        headers.set('Access-Control-Allow-Credentials', 'true');
      }

      if (config.maxAge > 0) {
        headers.set('Access-Control-Max-Age', config.maxAge.toString());
      }

      return new Response(null, { status: 204, headers });
    }

    // For non-OPTIONS requests, return null to continue the middleware chain
    return null;
  };
}

/**
 * Adds CORS headers to a response
 * 
 * @param response - Original response
 * @param origin - Request origin
 * @param config - CORS configuration
 * @returns Response with CORS headers
 */
export function addCorsHeaders(
  response: Response,
  origin: string | null,
  config: CorsOptions
): Response {
  const headers = new Headers(response.headers);

  // Only add Access-Control-Allow-Origin if origin is allowed
  if (origin && isOriginAllowed(origin, config.allowedOrigins)) {
    headers.set('Access-Control-Allow-Origin', origin);
  } else if (config.allowedOrigins.includes('*')) {
    headers.set('Access-Control-Allow-Origin', '*');
  }

  headers.set('Access-Control-Expose-Headers', config.exposedHeaders.join(', '));

  if (config.allowCredentials) {
    headers.set('Access-Control-Allow-Credentials', 'true');
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

/**
 * Creates a CORS middleware with environment-based configuration
 * 
 * @param env - Environment variables (optional, can be passed at runtime)
 * @returns CORS middleware function
 */
export function corsFromEnv(env?: Record<string, string>) {
  const allowedOrigins = parseAllowedOrigins(env);
  
  return cors({
    allowedOrigins,
    allowedMethods: env?.CORS_METHODS?.split(',') || defaultCorsOptions.allowedMethods,
    allowedHeaders: env?.CORS_HEADERS?.split(',') || defaultCorsOptions.allowedHeaders,
    exposedHeaders: env?.CORS_EXPOSED_HEADERS?.split(',') || defaultCorsOptions.exposedHeaders,
    allowCredentials: env?.CORS_CREDENTIALS === 'true',
    maxAge: parseInt(env?.CORS_MAX_AGE || defaultCorsOptions.maxAge.toString(), 10)
  });
}

/**
 * Wraps a response handler to add CORS headers
 * 
 * @param handler - Response handler function
 * @param options - CORS configuration options
 * @returns Wrapped handler with CORS support
 */
export function withCors<T extends Request, E extends Record<string, string>>(
  handler: (request: T, env: E, ctx?: ExecutionContext) => Promise<Response>,
  options: Partial<CorsOptions> = {}
) {
  const config: CorsOptions = {
    ...defaultCorsOptions,
    ...options
  };

  return async (request: T, env: E, ctx?: ExecutionContext): Promise<Response> => {
    const origin = request.headers.get('Origin');
    const response = await handler(request, env, ctx);
    return addCorsHeaders(response, origin, config);
  };
}
