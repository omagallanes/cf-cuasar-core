/**
 * Project Handlers - VaaIA API
 * 
 * Implementación de handlers REST para gestión de proyectos.
 * Proporciona endpoints para CRUD completo de proyectos.
 * 
 * @module handlers/proyectos
 */

import { Hono } from 'hono';
import type { Context } from 'hono';
import { createRequestLogger } from '../utils/logger';

// Types for Cloudflare bindings
type Env = {
  CF_B_KV_SECRETS: KVNamespace;
  CF_B_DB_INMO: D1Database;
  CF_B_R2_INMO: R2Bucket;
};

type AppContext = {
  Bindings: Env;
};

/**
 * Project State Type
 * Estados permitidos para un proyecto según el modelo de datos.
 */
type EstadoProyecto = 'creado' | 'procesando_analisis' | 'analisis_con_error' | 'analisis_finalizado';

/**
 * Project Data Interface
 * Estructura de datos de un proyecto.
 */
interface ProyectoData {
  id: string;
  nombre: string;
  descripcion: string | null;
  estado: EstadoProyecto;
  asesor_responsable: string | null;
  fecha_creacion: string;
  fecha_actualizacion: string;
  fecha_analisis_inicio: string | null;
  fecha_analisis_fin: string | null;
  i_json_url: string | null;
  resultados_disponibles: boolean;
}

/**
 * Create Project Request Interface
 * Estructura de datos para crear un proyecto.
 */
interface CreateProjectRequest {
  i_json: Record<string, any>;
  nombre?: string;
  asesor_responsable?: string;
}

/**
 * Update Project Request Interface
 * Estructura de datos para actualizar un proyecto.
 */
interface UpdateProjectRequest {
  nombre?: string;
  descripcion?: string;
}

/**
 * Validation Error Detail Interface
 * Estructura para detalles de error de validación.
 */
interface ValidationErrorDetail {
  campo: string;
  mensaje: string;
}

/**
 * ========================================
 * VALIDATION HELPERS
 * ========================================
 */

/**
 * Validates if a value is a valid UUID v4
 */
const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Validates if a value is a valid project state
 */
const isValidEstadoProyecto = (estado: string): estado is EstadoProyecto => {
  return ['creado', 'procesando_analisis', 'analisis_con_error', 'analisis_finalizado'].includes(estado);
};

/**
 * Validates I-JSON structure according to specification
 * Required fields: titulo_anuncio, descripcion, tipo_operacion, tipo_inmueble, precio, ciudad
 */
const validateIJson = (iJson: Record<string, any>): ValidationErrorDetail[] => {
  const errors: ValidationErrorDetail[] = [];
  
  const requiredFields = [
    'titulo_anuncio',
    'descripcion',
    'tipo_operacion',
    'tipo_inmueble',
    'precio',
    'ciudad'
  ];
  
  for (const field of requiredFields) {
    if (!iJson[field] || (typeof iJson[field] === 'string' && iJson[field].trim() === '')) {
      errors.push({
        campo: field,
        mensaje: `El campo ${field} es obligatorio en el I-JSON`
      });
    }
  }
  
  // Validate tipo_operacion values
  if (iJson.tipo_operacion && !['venta', 'alquiler', 'traspaso'].includes(iJson.tipo_operacion)) {
    errors.push({
      campo: 'tipo_operacion',
      mensaje: 'tipo_operacion debe ser: venta, alquiler o traspaso'
    });
  }
  
  // Validate precio is a valid number
  if (iJson.precio && isNaN(parseFloat(iJson.precio))) {
    errors.push({
      campo: 'precio',
      mensaje: 'precio debe ser un número válido'
    });
  }
  
  return errors;
};

/**
 * ========================================
 * DATABASE HELPERS
 * ========================================
 */

/**
 * Checks if a project exists in the database
 */
const projectExists = async (db: D1Database, proyectoId: string): Promise<boolean> => {
  const result = await db
    .prepare('SELECT id FROM ani_proyectos WHERE id = ?')
    .bind(proyectoId)
    .first();
  
  return result !== undefined;
};

/**
 * Fetches a project by ID from the database
 */
const getProjectById = async (db: D1Database, proyectoId: string): Promise<ProyectoData | null> => {
  const result = await db
    .prepare(`
      SELECT 
        id,
        nombre,
        descripcion,
        estado,
        asesor_responsable,
        fecha_creacion,
        fecha_actualizacion,
        fecha_analisis_inicio,
        fecha_analisis_fin,
        i_json_url
      FROM ani_proyectos
      WHERE id = ?
    `)
    .bind(proyectoId)
    .first();
  
  if (!result) {
    return null;
  }
  
  // Determine if results are available based on state
  const resultadosDisponibles = result.estado === 'analisis_finalizado';
  
  return {
    id: result.id as string,
    nombre: result.nombre as string,
    descripcion: result.descripcion as string | null,
    estado: result.estado as EstadoProyecto,
    asesor_responsable: result.asesor_responsable as string | null,
    fecha_creacion: result.fecha_creacion as string,
    fecha_actualizacion: result.fecha_actualizacion as string,
    fecha_analisis_inicio: result.fecha_analisis_inicio as string | null,
    fecha_analisis_fin: result.fecha_analisis_fin as string | null,
    i_json_url: result.i_json_url as string | null,
    resultados_disponibles: resultadosDisponibles
  };
};

/**
 * ========================================
 * HANDLERS
 * ========================================
 */

/**
 * Handler: GET /api/v1/proyectos
 * 
 * Lista todos los proyectos con paginación opcional.
 * 
 * Query Parameters:
 * - page: Número de página (default: 1)
 * - limit: Cantidad de resultados por página (default: 20)
 * - estado: Filtrar por estado (opcional)
 * 
 * Response 200: { data: [...], pagination: { page, limit, total } }
 */
export const listProjects = async (c: Context<AppContext>): Promise<Response> => {
  const requestId = c.req.header('x-request-id') || crypto.randomUUID();
  const requestLogger = createRequestLogger(requestId);
  
  try {
    // Parse query parameters
    const page = parseInt(c.req.query('page') || '1', 10);
    const limit = Math.min(parseInt(c.req.query('limit') || '20', 10), 100); // Max 100 per page
    const estado = c.req.query('estado');
    
    requestLogger.info('List projects request', { page, limit, estado });
    
    // Validate page and limit
    if (page < 1) {
      return c.json(
        { error: 'El parámetro page debe ser mayor o igual a 1' },
        400
      );
    }
    
    if (limit < 1) {
      return c.json(
        { error: 'El parámetro limit debe ser mayor o igual a 1' },
        400
      );
    }
    
    // Validate estado if provided
    if (estado && !isValidEstadoProyecto(estado)) {
      return c.json(
        { error: 'El parámetro estado debe ser uno de: creado, procesando_analisis, analisis_con_error, analisis_finalizado' },
        400
      );
    }
    
    const db = c.env.CF_B_DB_INMO;
    const offset = (page - 1) * limit;
    
    // Build query with optional state filter
    let query = `
      SELECT 
        id,
        nombre,
        descripcion,
        estado,
        asesor_responsable,
        fecha_creacion,
        fecha_actualizacion,
        fecha_analisis_inicio,
        fecha_analisis_fin,
        i_json_url
      FROM ani_proyectos
    `;
    
    const params: any[] = [];
    
    if (estado) {
      query += ' WHERE estado = ?';
      params.push(estado);
    }
    
    query += ' ORDER BY fecha_creacion DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    // Execute query
    const projectsResult = await db.prepare(query).bind(...params).all();
    
    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM ani_proyectos';
    const countParams: any[] = [];
    
    if (estado) {
      countQuery += ' WHERE estado = ?';
      countParams.push(estado);
    }
    
    const countResult = await db.prepare(countQuery).bind(...countParams).first();
    const total = countResult?.total as number || 0;
    
    // Transform results
    const data: ProyectoData[] = projectsResult.results.map((row: any) => ({
      id: row.id,
      nombre: row.nombre,
      descripcion: row.descripcion,
      estado: row.estado,
      asesor_responsable: row.asesor_responsable,
      fecha_creacion: row.fecha_creacion,
      fecha_actualizacion: row.fecha_actualizacion,
      fecha_analisis_inicio: row.fecha_analisis_inicio,
      fecha_analisis_fin: row.fecha_analisis_fin,
      i_json_url: row.i_json_url,
      resultados_disponibles: row.estado === 'analisis_finalizado'
    }));
    
    return c.json({
      data,
      pagination: {
        page,
        limit,
        total
      }
    });
    
    requestLogger.debug('Projects listed successfully', { count: data.length, total });
  } catch (error) {
    requestLogger.error('Error listing projects', error);
    return c.json(
      { error: 'Error al listar proyectos' },
      500
    );
  }
};

/**
 * Handler: POST /api/v1/proyectos
 * 
 * Crea un nuevo proyecto a partir de un I-JSON.
 * 
 * Request Body:
 * - i_json: Object (required) - Contenido completo del I-JSON del anuncio
 * - nombre: String (optional) - Nombre personalizado del proyecto
 * - asesor_responsable: String (optional) - Identificador del asesor responsable
 * 
 * Response 201: { data: {...} }
 * Response 400: { error: "...", detalles: [...] }
 */
export const createProject = async (c: Context<AppContext>): Promise<Response> => {
  const requestId = c.req.header('x-request-id') || crypto.randomUUID();
  const requestLogger = createRequestLogger(requestId);
  
  try {
    const body = await c.req.json() as CreateProjectRequest;
    
    requestLogger.info('Create project request', { nombre: body.nombre });
    
    // Validate required fields
    if (!body.i_json) {
      return c.json(
        { 
          error: 'Error de validación',
          detalles: [
            { campo: 'i_json', mensaje: 'El I-JSON es obligatorio' }
          ]
        },
        400
      );
    }
    
    // Validate I-JSON structure
    const validationErrors = validateIJson(body.i_json);
    if (validationErrors.length > 0) {
      return c.json(
        { 
          error: 'Error de validación del I-JSON',
          detalles: validationErrors
        },
        400
      );
    }
    
    // Extract data from I-JSON
    const iJson = body.i_json;
    const nombre = body.nombre || iJson.titulo_anuncio || 'Proyecto sin nombre';
    const descripcion = iJson.descripcion || null;
    const asesorResponsable = body.asesor_responsable || null;
    
    // Generate UUID for new project
    const proyectoId = crypto.randomUUID();
    const now = new Date().toISOString();
    
    // Store I-JSON as string
    const iJsonString = JSON.stringify(iJson);
    
    const db = c.env.CF_B_DB_INMO;
    
    // Insert project into database
    await db.prepare(`
      INSERT INTO ani_proyectos (
        id,
        nombre,
        descripcion,
        i_json,
        estado,
        asesor_responsable,
        fecha_creacion,
        fecha_actualizacion
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      proyectoId,
      nombre,
      descripcion,
      iJsonString,
      'creado',
      asesorResponsable,
      now,
      now
    ).run();
    
    // Return created project
    const data: ProyectoData = {
      id: proyectoId,
      nombre,
      descripcion,
      estado: 'creado',
      asesor_responsable: asesorResponsable,
      fecha_creacion: now,
      fecha_actualizacion: now,
      fecha_analisis_inicio: null,
      fecha_analisis_fin: null,
      i_json_url: null,
      resultados_disponibles: false
    };
    
    requestLogger.info('Project created successfully', { projectId: proyectoId, nombre });
    return c.json({ data }, 201);
  } catch (error) {
    requestLogger.error('Error creating project', error);
    return c.json(
      { error: 'Error al crear proyecto' },
      500
    );
  }
};

/**
 * Handler: GET /api/v1/proyectos/{proyecto_id}
 * 
 * Obtiene los detalles de un proyecto específico.
 * 
 * Path Parameters:
 * - proyecto_id: String (UUID) - Identificador único del proyecto
 * 
 * Response 200: { data: {...} }
 * Response 404: { error: "..." }
 */
export const getProject = async (c: Context<AppContext>): Promise<Response> => {
  const requestId = c.req.header('x-request-id') || crypto.randomUUID();
  const requestLogger = createRequestLogger(requestId);
  
  try {
    const proyectoId = c.req.param('proyecto_id');
    
    requestLogger.info('Get project request', { proyectoId });
    
    // Validate UUID format
    if (!proyectoId || !isValidUUID(proyectoId)) {
      return c.json(
        { error: 'ID de proyecto inválido' },
        400
      );
    }
    
    const db = c.env.CF_B_DB_INMO;
    
    // Check if project exists
    const exists = await projectExists(db, proyectoId);
    if (!exists) {
      return c.json(
        { error: 'Proyecto no encontrado' },
        404
      );
    }
    
    // Fetch project
    const project = await getProjectById(db, proyectoId);
    
    if (!project) {
      return c.json(
        { error: 'Proyecto no encontrado' },
        404
      );
    }
    
    requestLogger.debug('Project retrieved successfully', { proyectoId });
    return c.json({ data: project });
  } catch (error) {
    requestLogger.error('Error getting project', error, { proyectoId: c.req.param('proyecto_id') });
    return c.json(
      { error: 'Error al obtener proyecto' },
      500
    );
  }
};

/**
 * Handler: PUT /api/v1/proyectos/{proyecto_id}
 * 
 * Actualiza los datos de un proyecto existente.
 * 
 * Path Parameters:
 * - proyecto_id: String (UUID) - Identificador único del proyecto
 * 
 * Request Body:
 * - nombre: String (optional) - Nuevo nombre del proyecto
 * - descripcion: String (optional) - Nueva descripción del proyecto
 * 
 * Response 200: { data: {...} }
 * Response 400: { error: "..." }
 * Response 404: { error: "..." }
 */
export const updateProject = async (c: Context<AppContext>): Promise<Response> => {
  const requestId = c.req.header('x-request-id') || crypto.randomUUID();
  const requestLogger = createRequestLogger(requestId);
  
  try {
    const proyectoId = c.req.param('proyecto_id');
    
    requestLogger.info('Update project request', { proyectoId, updates: Object.keys(await c.req.json() as UpdateProjectRequest) });
    
    // Validate UUID format
    if (!proyectoId || !isValidUUID(proyectoId)) {
      return c.json(
        { error: 'ID de proyecto inválido' },
        400
      );
    }
    
    const body = await c.req.json() as UpdateProjectRequest;
    
    // Validate at least one field is provided
    if (!body.nombre && !body.descripcion) {
      return c.json(
        { 
          error: 'Error de validación',
          detalles: [
            { campo: 'nombre', mensaje: 'Debe proporcionar al menos nombre o descripción para actualizar' }
          ]
        },
        400
      );
    }
    
    const db = c.env.CF_B_DB_INMO;
    
    // Check if project exists
    const exists = await projectExists(db, proyectoId);
    if (!exists) {
      return c.json(
        { error: 'Proyecto no encontrado' },
        404
      );
    }
    
    // Build update query dynamically
    const updates: string[] = [];
    const params: any[] = [];
    
    if (body.nombre !== undefined) {
      updates.push('nombre = ?');
      params.push(body.nombre);
    }
    
    if (body.descripcion !== undefined) {
      updates.push('descripcion = ?');
      params.push(body.descripcion);
    }
    
    updates.push('fecha_actualizacion = ?');
    params.push(new Date().toISOString());
    
    params.push(proyectoId);
    
    // Execute update
    await db.prepare(`
      UPDATE ani_proyectos
      SET ${updates.join(', ')}
      WHERE id = ?
    `).bind(...params).run();
    
    // Fetch updated project
    const project = await getProjectById(db, proyectoId);
    
    if (!project) {
      return c.json(
        { error: 'Proyecto no encontrado' },
        404
      );
    }
    
    requestLogger.info('Project updated successfully', { proyectoId });
    return c.json({ data: project });
  } catch (error) {
    requestLogger.error('Error updating project', error, { proyectoId: c.req.param('proyecto_id') });
    return c.json(
      { error: 'Error al actualizar proyecto' },
      500
    );
  }
};

/**
 * Handler: DELETE /api/v1/proyectos/{proyecto_id}
 * 
 * Elimina un proyecto y todos sus datos asociados (D1 y R2).
 * 
 * Path Parameters:
 * - proyecto_id: String (UUID) - Identificador único del proyecto
 * 
 * Response 204: No content (eliminado exitosamente)
 * Response 400: { error: "..." }
 * Response 404: { error: "..." }
 */
export const deleteProject = async (c: Context<AppContext>): Promise<Response> => {
  const requestId = c.req.header('x-request-id') || crypto.randomUUID();
  const requestLogger = createRequestLogger(requestId);
  
  try {
    const proyectoId = c.req.param('proyecto_id');
    
    requestLogger.info('Delete project request', { proyectoId });
    
    // Validate UUID format
    if (!proyectoId || !isValidUUID(proyectoId)) {
      return c.json(
        { error: 'ID de proyecto inválido' },
        400
      );
    }
    
    const db = c.env.CF_B_DB_INMO;
    const r2 = c.env.CF_B_R2_INMO;
    
    // Check if project exists
    const exists = await projectExists(db, proyectoId);
    if (!exists) {
      return c.json(
        { error: 'Proyecto no encontrado' },
        404
      );
    }
    
    // Delete project from database (cascades to executions and steps)
    await db.prepare('DELETE FROM ani_proyectos WHERE id = ?')
      .bind(proyectoId)
      .run();
    
    // Delete project files from R2
    // List all objects with the project prefix
    const listed = await r2.list({ prefix: `dir-api-inmo/${proyectoId}/` });
    
    // Delete each object
    for (const object of listed.objects) {
      await r2.delete(object.key);
    }
    
    requestLogger.info('Project deleted successfully', { proyectoId, filesDeleted: listed.objects.length });
    return c.body(null, 204);
  } catch (error) {
    requestLogger.error('Error deleting project', error, { proyectoId: c.req.param('proyecto_id') });
    return c.json(
      { error: 'Error al eliminar proyecto' },
      500
    );
  }
};

/**
 * ========================================
 * ROUTER EXPORT
 * ========================================
 */

/**
 * Projects Router
 * Configures all project-related routes with their handlers.
 */
export const createProyectosRouter = () => {
  const router = new Hono<AppContext>();
  
  // GET /api/v1/proyectos - List projects
  router.get('/', listProjects);
  
  // POST /api/v1/proyectos - Create project
  router.post('/', createProject);
  
  // GET /api/v1/proyectos/:proyecto_id - Get project by ID
  router.get('/:proyecto_id', getProject);
  
  // PUT /api/v1/proyectos/:proyecto_id - Update project
  router.put('/:proyecto_id', updateProject);
  
  // DELETE /api/v1/proyectos/:proyecto_id - Delete project
  router.delete('/:proyecto_id', deleteProject);
  
  return router;
};
