/**
 * VaaIA API Worker - Hono Application
 *
 * Main entry point for the Cloudflare Worker API using Hono framework.
 * Configures middleware, routing, and error handling for the VaaIA backend.
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';

// Import error handling middleware
import { errorHandler, notFoundHandler } from './errors/errorHandler';
import { logger } from './utils/logger';

// Types for Cloudflare bindings
export type Env = {
  CF_B_KV_SECRETS: KVNamespace;
  CF_B_DB_INMO: D1Database;
  CF_B_R2_INMO: R2Bucket;
};

// Type for application context with bindings
export type AppContext = {
  Bindings: Env;
};

// Initialize Hono application
const app = new Hono<AppContext>();

/**
 * ========================================
 * MIDDLEWARE CONFIGURATION
 * ========================================
 */

// CORS Middleware - Configure allowed origins for frontend
// Origins: http://localhost:5173 (dev), https://cb-consulting.pages.dev (production)
app.use('*', cors({
  origin: (origin) => {
    const allowedOrigins = [
      'http://localhost:5173',
      'https://cb-consulting.pages.dev'
    ];
    // Allow requests from allowed origins, or if origin is undefined (e.g., same-origin, curl)
    return allowedOrigins.includes(origin) || !origin ? origin : null;
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Logging Middleware - Log all incoming requests for debugging
app.use('*', async (c, next) => {
  const requestId = c.req.header('x-request-id') || crypto.randomUUID();
  const startTime = Date.now();
  
  await next();
  
  const duration = Date.now() - startTime;
  const statusCode = c.res.status;
  
  // Log the request with structured information
  logger.logRequest(
    c.req.method,
    c.req.path,
    statusCode,
    duration,
    requestId
  );
});

// Error Handling Middleware - Catch and format errors with structured logging
app.onError(errorHandler);

// Not Found Middleware - Handle 404 errors with structured logging
app.notFound(notFoundHandler);

/**
 * ========================================
 * ROUTING STRUCTURE
 * ========================================
 */

// API v1 routes with /api/v1 prefix
const apiV1 = new Hono<AppContext>();

/**
 * Health Check Endpoint
 * GET /api/v1/health
 */
apiV1.get('/health', (c) => {
  return c.json({ 
    data: { 
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    }
  });
});

/**
 * ========================================
 * PROJECTS ROUTES
 * ========================================
 * 
 * All project-related endpoints:
 * - GET    /api/v1/proyectos              - List projects
 * - POST   /api/v1/proyectos              - Create project
 * - GET    /api/v1/proyectos/:id          - Get project by ID
 * - PUT    /api/v1/proyectos/:id          - Update project
 * - DELETE /api/v1/proyectos/:id          - Delete project
 */

const proyectosRouter = new Hono<AppContext>();

// Placeholder handlers - to be implemented in Tarea 2.2
proyectosRouter.get('/', (c) => {
  return c.json({ 
    data: [],
    pagination: { page: 1, limit: 20, total: 0 }
  });
});

proyectosRouter.post('/', (c) => {
  return c.json({ 
    error: 'Not implemented yet' 
  }, 501);
});

proyectosRouter.get('/:proyecto_id', (c) => {
  return c.json({ 
    error: 'Not implemented yet' 
  }, 501);
});

proyectosRouter.put('/:proyecto_id', (c) => {
  return c.json({ 
    error: 'Not implemented yet' 
  }, 501);
});

proyectosRouter.delete('/:proyecto_id', (c) => {
  return c.json({ 
    error: 'Not implemented yet' 
  }, 501);
});

apiV1.route('/proyectos', proyectosRouter);

/**
 * ========================================
 * WORKFLOWS ROUTES
 * ========================================
 * 
 * All workflow-related endpoints:
 * - POST   /api/v1/proyectos/:id/workflows/ejecutar           - Execute workflow
 * - GET    /api/v1/proyectos/:id/workflows/ejecuciones       - List executions
 * - GET    /api/v1/proyectos/:id/workflows/ejecuciones/:eid  - Get execution by ID
 */

const workflowsRouter = new Hono<AppContext>();

// Placeholder handlers - to be implemented in Tarea 2.3
workflowsRouter.post('/ejecutar', (c) => {
  return c.json({ 
    error: 'Not implemented yet' 
  }, 501);
});

workflowsRouter.get('/ejecuciones', (c) => {
  return c.json({ 
    data: [],
    pagination: { page: 1, limit: 20, total: 0 }
  });
});

workflowsRouter.get('/ejecuciones/:ejecucion_id', (c) => {
  return c.json({ 
    error: 'Not implemented yet' 
  }, 501);
});

apiV1.route('/proyectos/:proyecto_id/workflows', workflowsRouter);

/**
 * ========================================
 * RESULTS ROUTES
 * ========================================
 * 
 * All result-related endpoints:
 * - GET    /api/v1/proyectos/:id/resultados     - Get project results
 * - GET    /api/v1/proyectos/:id/resultados/:rid - Get specific result
 */

const resultadosRouter = new Hono<AppContext>();

// Placeholder handlers - to be implemented in Tarea 2.4
resultadosRouter.get('/', (c) => {
  return c.json({ 
    error: 'Not implemented yet' 
  }, 501);
});

resultadosRouter.get('/:resultado_id', (c) => {
  return c.json({ 
    error: 'Not implemented yet' 
  }, 501);
});

apiV1.route('/proyectos/:proyecto_id/resultados', resultadosRouter);

// Mount v1 API routes
app.route('/api/v1', apiV1);

/**
 * ========================================
 * ROOT ENDPOINT
 * ========================================
 */

app.get('/', (c) => {
  return c.json({ 
    data: { 
      message: 'VaaIA API Worker',
      version: '1.0.0',
      endpoints: {
        health: '/api/v1/health',
        proyectos: '/api/v1/proyectos',
        workflows: '/api/v1/proyectos/:id/workflows',
        resultados: '/api/v1/proyectos/:id/resultados'
      }
    }
  });
});

/**
 * ========================================
 * EXPORT FOR CLOUDFLARE WORKERS
 * ========================================
 */

export default app;
