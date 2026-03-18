/**
 * Workflow Handlers - VaaIA API
 * 
 * Implementación de handlers REST para gestión y ejecución de workflows.
 * Proporciona endpoints para ejecutar, listar y consultar ejecuciones de workflows.
 * 
 * @module handlers/workflows
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
 * Execution State Type
 * Estados permitidos para una ejecución de workflow.
 */
type EstadoEjecucion = 'iniciada' | 'en_ejecucion' | 'finalizada_correctamente' | 'finalizada_con_error';

/**
 * Step State Type
 * Estados permitidos para un paso de workflow.
 */
type EstadoPaso = 'pendiente' | 'en_ejecucion' | 'correcto' | 'error';

/**
 * Step Type
 * Tipos de pasos en el workflow de análisis.
 */
type TipoPaso = 'resumen' | 'datos_clave' | 'activo_fisico' | 'activo_estrategico' | 
  'activo_financiero' | 'activo_regulado' | 'lectura_inversor' | 'lectura_emprendedor' | 'lectura_propietario';

/**
 * Execution Data Interface
 * Estructura de datos de una ejecución de workflow.
 */
interface EjecucionData {
  id: string;
  proyecto_id: string;
  estado: EstadoEjecucion;
  fecha_inicio: string;
  fecha_fin: string | null;
  error_mensaje: string | null;
}

/**
 * Step Data Interface
 * Estructura de datos de un paso de workflow.
 */
interface PasoData {
  id: string;
  ejecucion_id: string;
  tipo_paso: TipoPaso;
  orden: number;
  estado: EstadoPaso;
  fecha_inicio: string;
  fecha_fin: string | null;
  error_mensaje: string | null;
  ruta_archivo_r2: string | null;
}

/**
 * Execute Workflow Request Interface
 * Estructura de datos para ejecutar un workflow.
 */
interface ExecuteWorkflowRequest {
  confirmar_reejecucion?: boolean;
}

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
 * Checks if a project has any previous executions
 */
const hasPreviousExecutions = async (db: D1Database, proyectoId: string): Promise<boolean> => {
  const result = await db
    .prepare('SELECT COUNT(*) as count FROM ani_ejecuciones WHERE proyecto_id = ?')
    .bind(proyectoId)
    .first();
  
  const count = result?.count as number || 0;
  return count > 0;
};

/**
 * Checks if a project has an execution currently in progress
 */
const hasExecutionInProgress = async (db: D1Database, proyectoId: string): Promise<boolean> => {
  const result = await db
    .prepare(`
      SELECT COUNT(*) as count 
      FROM ani_ejecuciones 
      WHERE proyecto_id = ? AND estado IN ('iniciada', 'en_ejecucion')
    `)
    .bind(proyectoId)
    .first();
  
  const count = result?.count as number || 0;
  return count > 0;
};

/**
 * Fetches all executions for a project
 */
const getExecutionsByProjectId = async (db: D1Database, proyectoId: string): Promise<EjecucionData[]> => {
  const results = await db
    .prepare(`
      SELECT 
        id,
        proyecto_id,
        estado,
        fecha_inicio,
        fecha_fin,
        error_mensaje
      FROM ani_ejecuciones
      WHERE proyecto_id = ?
      ORDER BY fecha_inicio DESC
    `)
    .bind(proyectoId)
    .all();
  
  return results.results.map((row: any) => ({
    id: row.id,
    proyecto_id: row.proyecto_id,
    estado: row.estado,
    fecha_inicio: row.fecha_inicio,
    fecha_fin: row.fecha_fin,
    error_mensaje: row.error_mensaje
  }));
};

/**
 * Fetches an execution by ID
 */
const getExecutionById = async (db: D1Database, ejecucionId: string): Promise<EjecucionData | null> => {
  const result = await db
    .prepare(`
      SELECT 
        id,
        proyecto_id,
        estado,
        fecha_inicio,
        fecha_fin,
        error_mensaje
      FROM ani_ejecuciones
      WHERE id = ?
    `)
    .bind(ejecucionId)
    .first();
  
  if (!result) {
    return null;
  }
  
  return {
    id: result.id as string,
    proyecto_id: result.proyecto_id as string,
    estado: result.estado as EstadoEjecucion,
    fecha_inicio: result.fecha_inicio as string,
    fecha_fin: result.fecha_fin as string | null,
    error_mensaje: result.error_mensaje as string | null
  };
};

/**
 * Fetches all steps for an execution
 */
const getStepsByExecutionId = async (db: D1Database, ejecucionId: string): Promise<PasoData[]> => {
  const results = await db
    .prepare(`
      SELECT 
        id,
        ejecucion_id,
        tipo_paso,
        orden,
        estado,
        fecha_inicio,
        fecha_fin,
        error_mensaje,
        ruta_archivo_r2
      FROM ani_pasos
      WHERE ejecucion_id = ?
      ORDER BY orden ASC
    `)
    .bind(ejecucionId)
    .all();
  
  return results.results.map((row: any) => ({
    id: row.id,
    ejecucion_id: row.ejecucion_id,
    tipo_paso: row.tipo_paso,
    orden: row.orden,
    estado: row.estado,
    fecha_inicio: row.fecha_inicio,
    fecha_fin: row.fecha_fin,
    error_mensaje: row.error_mensaje,
    ruta_archivo_r2: row.ruta_archivo_r2
  }));
};

/**
 * ========================================
 * STATE VALIDATION
 * ========================================
 */

/**
 * ========================================
 * HANDLERS
 * ========================================
 */

/**
 * Handler: POST /api/v1/proyectos/{proyecto_id}/workflows/ejecutar
 * 
 * Inicia la ejecución del workflow completo de análisis sobre un proyecto.
 * 
 * Path Parameters:
 * - proyecto_id: String (UUID) - Identificador único del proyecto
 * 
 * Request Body:
 * - confirmar_reejecucion: Boolean (optional) - Confirmación explícita para reejecutar
 * 
 * Response 200: { data: {...}, message: "..." }
 * Response 400: { error: "..." }
 * Response 404: { error: "..." }
 * Response 409: { error: "..." }
 */
export const executeWorkflow = async (c: Context<AppContext>): Promise<Response> => {
  const requestId = c.req.header('x-request-id') || crypto.randomUUID();
  const requestLogger = createRequestLogger(requestId);
  
  try {
    const proyectoId = c.req.param('proyecto_id');
    
    requestLogger.info('Execute workflow request', { proyectoId });
    
    // Validate UUID format
    if (!proyectoId || !isValidUUID(proyectoId)) {
      return c.json(
        { error: 'ID de proyecto inválido' },
        400
      );
    }
    
    const body = await c.req.json() as ExecuteWorkflowRequest;
    const db = c.env.CF_B_DB_INMO;
    
    // Check if project exists
    const exists = await projectExists(db, proyectoId);
    if (!exists) {
      return c.json(
        { error: 'Proyecto no encontrado' },
        404
      );
    }
    
    // Fetch project to validate state
    const proyecto = await getProjectById(db, proyectoId);
    if (!proyecto) {
      return c.json(
        { error: 'Proyecto no encontrado' },
        404
      );
    }
    
    // Check if there's an execution in progress
    const hasInProgress = await hasExecutionInProgress(db, proyectoId);
    if (hasInProgress) {
      return c.json(
        { error: 'El proyecto ya tiene un análisis en ejecución' },
        409
      );
    }
    
    // If project has previous executions and state is 'analisis_finalizado', require confirmation
    if (proyecto.estado === 'analisis_finalizado') {
      const hasPrevious = await hasPreviousExecutions(db, proyectoId);
      if (hasPrevious && !body.confirmar_reejecucion) {
        return c.json(
          { error: 'El proyecto ya tiene análisis previos. Confirme la reejecución.' },
          400
        );
      }
    }
    
    // Generate UUID for new execution
    const ejecucionId = crypto.randomUUID();
    const now = new Date().toISOString();
    
    // Create new execution in D1
    await db.prepare(`
      INSERT INTO ani_ejecuciones (
        id,
        proyecto_id,
        estado,
        fecha_inicio,
        fecha_fin,
        error_mensaje
      ) VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      ejecucionId,
      proyectoId,
      'iniciada',
      now,
      null,
      null
    ).run();
    
    // Update project state to 'procesando_analisis'
    await db.prepare(`
      UPDATE ani_proyectos
      SET estado = ?,
          fecha_analisis_inicio = ?,
          fecha_actualizacion = ?
      WHERE id = ?
    `).bind(
      'procesando_analisis',
      now,
      now,
      proyectoId
    ).run();
    
    // Return created execution
    const data: EjecucionData = {
      id: ejecucionId,
      proyecto_id: proyectoId,
      estado: 'iniciada',
      fecha_inicio: now,
      fecha_fin: null,
      error_mensaje: null
    };
    
    return c.json({
      data,
      message: 'Workflow iniciado correctamente'
    });
    
    requestLogger.info('Workflow executed successfully', { ejecucionId, proyectoId });
  } catch (error) {
    requestLogger.error('Error executing workflow', error, { proyectoId: c.req.param('proyecto_id') });
    return c.json(
      { error: 'Error al ejecutar workflow' },
      500
    );
  }
};

/**
 * Handler: GET /api/v1/proyectos/{proyecto_id}/workflows/ejecuciones
 * 
 * Obtiene el historial de ejecuciones de workflow para un proyecto.
 * 
 * Path Parameters:
 * - proyecto_id: String (UUID) - Identificador único del proyecto
 * 
 * Response 200: { data: [...] }
 * Response 400: { error: "..." }
 * Response 404: { error: "..." }
 */
export const listExecutions = async (c: Context<AppContext>): Promise<Response> => {
  const requestId = c.req.header('x-request-id') || crypto.randomUUID();
  const requestLogger = createRequestLogger(requestId);
  
  try {
    const proyectoId = c.req.param('proyecto_id');
    
    requestLogger.info('List executions request', { proyectoId });
    
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
    
    // Fetch all executions for the project
    const executions = await getExecutionsByProjectId(db, proyectoId);
    
    requestLogger.debug('Executions listed successfully', { proyectoId, count: executions.length });
    return c.json({ data: executions });
  } catch (error) {
    requestLogger.error('Error listing executions', error, { proyectoId: c.req.param('proyecto_id') });
    return c.json(
      { error: 'Error al listar ejecuciones' },
      500
    );
  }
};

/**
 * Handler: GET /api/v1/proyectos/{proyecto_id}/workflows/ejecuciones/{ejecucion_id}
 * 
 * Obtiene los detalles de una ejecución específica, incluyendo todos los pasos.
 * 
 * Path Parameters:
 * - proyecto_id: String (UUID) - Identificador único del proyecto
 * - ejecucion_id: String (UUID) - Identificador único de la ejecución
 * 
 * Response 200: { data: { ejecucion: {...}, pasos: [...] } }
 * Response 400: { error: "..." }
 * Response 404: { error: "..." }
 */
export const getExecution = async (c: Context<AppContext>): Promise<Response> => {
  const requestId = c.req.header('x-request-id') || crypto.randomUUID();
  const requestLogger = createRequestLogger(requestId);
  
  try {
    const proyectoId = c.req.param('proyecto_id');
    const ejecucionId = c.req.param('ejecucion_id');
    
    requestLogger.info('Get execution request', { proyectoId, ejecucionId });
    
    // Validate UUID format
    if (!proyectoId || !isValidUUID(proyectoId)) {
      return c.json(
        { error: 'ID de proyecto inválido' },
        400
      );
    }
    
    if (!ejecucionId || !isValidUUID(ejecucionId)) {
      return c.json(
        { error: 'ID de ejecución inválido' },
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
    
    // Fetch execution
    const ejecucion = await getExecutionById(db, ejecucionId);
    
    if (!ejecucion) {
      return c.json(
        { error: 'Ejecución no encontrada' },
        404
      );
    }
    
    // Validate execution belongs to the project
    if (ejecucion.proyecto_id !== proyectoId) {
      return c.json(
        { error: 'La ejecución no pertenece al proyecto especificado' },
        404
      );
    }
    
    // Fetch all steps for the execution
    const pasos = await getStepsByExecutionId(db, ejecucionId);
    
    return c.json({
      data: {
        ejecucion,
        pasos
      }
    });
    
    requestLogger.debug('Execution retrieved successfully', { proyectoId, ejecucionId, stepsCount: pasos.length });
  } catch (error) {
    requestLogger.error('Error getting execution', error, { proyectoId: c.req.param('proyecto_id'), ejecucionId: c.req.param('ejecucion_id') });
    return c.json(
      { error: 'Error al obtener ejecución' },
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
 * Workflows Router
 * Configures all workflow-related routes with their handlers.
 */
export const createWorkflowsRouter = () => {
  const router = new Hono<AppContext>();
  
  // POST /api/v1/proyectos/:proyecto_id/workflows/ejecutar - Execute workflow
  router.post('/ejecutar', executeWorkflow);
  
  // GET /api/v1/proyectos/:proyecto_id/workflows/ejecuciones - List executions
  router.get('/ejecuciones', listExecutions);
  
  // GET /api/v1/proyectos/:proyecto_id/workflows/ejecuciones/:ejecucion_id - Get execution by ID
  router.get('/ejecuciones/:ejecucion_id', getExecution);
  
  return router;
};
