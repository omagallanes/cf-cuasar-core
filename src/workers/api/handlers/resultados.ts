/**
 * Results Handlers - VaaIA API
 * 
 * Implementación de handlers REST para consulta y recuperación de resultados de análisis.
 * Proporciona endpoints para obtener informes Markdown generados por el workflow.
 * 
 * @module handlers/resultados
 */

import type { Context } from 'hono';
import { logger, createRequestLogger } from '../utils/logger';

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
 * Report Type
 * Tipos de informes disponibles para consulta.
 */
type TipoInforme = 'resumen' | 'datos_clave' | 'activo_fisico' | 'activo_estrategico' | 
  'activo_financiero' | 'activo_regulado' | 'lectura_inversor' | 'lectura_emprendedor' | 'lectura_propietario';

/**
 * Report Title Mapping
 * Títulos descriptivos para cada tipo de informe.
 */
const REPORT_TITLES: Record<TipoInforme, string> = {
  resumen: 'Resumen del inmueble',
  datos_clave: 'Datos clave del inmueble',
  activo_fisico: 'Análisis físico',
  activo_estrategico: 'Análisis estratégico',
  activo_financiero: 'Análisis financiero',
  activo_regulado: 'Análisis regulatorio',
  lectura_inversor: 'Lectura para inversor',
  lectura_emprendedor: 'Lectura para emprendedor',
  lectura_propietario: 'Lectura para propietario'
};

/**
 * Project State Type
 * Estados permitidos para un proyecto según el modelo de datos.
 */
type EstadoProyecto = 'creado' | 'procesando_analisis' | 'analisis_con_error' | 'analisis_finalizado';

/**
 * Step State Type
 * Estados permitidos para un paso de workflow.
 */
type EstadoPaso = 'pendiente' | 'en_ejecucion' | 'correcto' | 'error';

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
 * Step Data Interface
 * Estructura de datos de un paso de workflow.
 */
interface PasoData {
  id: string;
  ejecucion_id: string;
  tipo_paso: TipoInforme;
  orden: number;
  estado: EstadoPaso;
  fecha_inicio: string;
  fecha_fin: string | null;
  error_mensaje: string | null;
  ruta_archivo_r2: string | null;
}

/**
 * Report Info Interface
 * Información básica de un informe.
 */
interface ReportInfo {
  tipo: TipoInforme;
  titulo: string;
  url: string;
  fecha_generacion: string;
}

/**
 * Results Response Interface
 * Estructura de respuesta para lista de resultados.
 */
interface ResultsResponse {
  proyecto: {
    id: string;
    nombre: string;
    estado: EstadoProyecto;
  };
  informes: ReportInfo[];
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
 * Validates if a value is a valid report type
 */
const isValidTipoInforme = (tipo: string): tipo is TipoInforme => {
  return ['resumen', 'datos_clave', 'activo_fisico', 'activo_estrategico', 
    'activo_financiero', 'activo_regulado', 'lectura_inversor', 'lectura_emprendedor', 'lectura_propietario'].includes(tipo);
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
 * Fetches completed steps for a project from the database
 * Returns steps with successful completion and valid R2 paths
 */
const getCompletedSteps = async (db: D1Database, proyectoId: string): Promise<PasoData[]> => {
  const result = await db
    .prepare(`
      SELECT 
        p.id,
        p.ejecucion_id,
        p.tipo_paso,
        p.orden,
        p.estado,
        p.fecha_inicio,
        p.fecha_fin,
        p.error_mensaje,
        p.ruta_archivo_r2
      FROM ani_pasos p
      INNER JOIN ani_ejecuciones e ON p.ejecucion_id = e.id
      WHERE e.proyecto_id = ?
      AND p.estado = 'correcto'
      AND p.ruta_archivo_r2 IS NOT NULL
      ORDER BY p.orden ASC
    `)
    .bind(proyectoId)
    .all();
  
  return (result.results || []).map((row: any) => ({
    id: row.id,
    ejecucion_id: row.ejecucion_id,
    tipo_paso: row.tipo_paso as TipoInforme,
    orden: row.orden,
    estado: row.estado as EstadoPaso,
    fecha_inicio: row.fecha_inicio,
    fecha_fin: row.fecha_fin,
    error_mensaje: row.error_mensaje,
    ruta_archivo_r2: row.ruta_archivo_r2
  }));
};

/**
 * Fetches a specific step by type for a project from the database
 */
const getStepByType = async (db: D1Database, proyectoId: string, tipoPaso: TipoInforme): Promise<PasoData | null> => {
  const result = await db
    .prepare(`
      SELECT 
        p.id,
        p.ejecucion_id,
        p.tipo_paso,
        p.orden,
        p.estado,
        p.fecha_inicio,
        p.fecha_fin,
        p.error_mensaje,
        p.ruta_archivo_r2
      FROM ani_pasos p
      INNER JOIN ani_ejecuciones e ON p.ejecucion_id = e.id
      WHERE e.proyecto_id = ?
      AND p.tipo_paso = ?
      AND p.estado = 'correcto'
      AND p.ruta_archivo_r2 IS NOT NULL
      ORDER BY p.fecha_fin DESC
      LIMIT 1
    `)
    .bind(proyectoId, tipoPaso)
    .first();
  
  if (!result) {
    return null;
  }
  
  return {
    id: result.id as string,
    ejecucion_id: result.ejecucion_id as string,
    tipo_paso: result.tipo_paso as TipoInforme,
    orden: result.orden as number,
    estado: result.estado as EstadoPaso,
    fecha_inicio: result.fecha_inicio as string,
    fecha_fin: result.fecha_fin as string | null,
    error_mensaje: result.error_mensaje as string | null,
    ruta_archivo_r2: result.ruta_archivo_r2 as string | null
  };
};

/**
 * ========================================
 * R2 STORAGE HELPERS
 * ========================================
 */

/**
 * Constructs the R2 key for a report file
 * Format: dir-api-inmo/{proyecto_id}/{tipo_informe}.md
 */
const getReportR2Key = (proyectoId: string, tipoInforme: TipoInforme): string => {
  return `dir-api-inmo/${proyectoId}/${tipoInforme}.md`;
};

/**
 * Fetches a Markdown file from R2 storage
 */
const fetchReportFromR2 = async (r2: R2Bucket, key: string): Promise<string | null> => {
  try {
    const object = await r2.get(key);
    
    if (!object) {
      return null;
    }
    
    const text = await object.text();
    return text;
  } catch (error) {
    logger.error(`Error fetching report from R2`, error, { key });
    return null;
  }
};

/**
 * ========================================
 * HANDLERS
 * ========================================
 */

/**
 * Handler: GET /api/v1/proyectos/{proyecto_id}/resultados
 * 
 * Obtiene la lista de informes Markdown generados para un proyecto.
 * 
 * Path Parameters:
 * - proyecto_id: String (UUID) - Identificador único del proyecto
 * 
 * Response 200: { data: { proyecto: {...}, informes: [...] } }
 * Response 404: { error: "Proyecto no encontrado" }
 * Response 500: { error: "Error al obtener resultados" }
 */
export const listResults = async (c: Context<AppContext>): Promise<Response> => {
  const requestId = c.req.header('x-request-id') || crypto.randomUUID();
  const requestLogger = createRequestLogger(requestId);
  
  try {
    const proyectoId = c.req.param('proyecto_id');
    
    requestLogger.info('List results request', { proyectoId });
    
    // Validate proyecto_id format
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
    
    // Fetch project data
    const proyecto = await getProjectById(db, proyectoId);
    if (!proyecto) {
      return c.json(
        { error: 'Proyecto no encontrado' },
        404
      );
    }
    
    // Fetch completed steps from database
    const completedSteps = await getCompletedSteps(db, proyectoId);
    
    // Build report info list
    const informes: ReportInfo[] = completedSteps
      .filter(step => step.ruta_archivo_r2 !== null)
      .map(step => {
        const tipoInforme = step.tipo_paso as TipoInforme;
        return {
          tipo: tipoInforme,
          titulo: REPORT_TITLES[tipoInforme],
          url: step.ruta_archivo_r2!,
          fecha_generacion: step.fecha_fin!
        };
      });
    
    // Build response
    const response: ResultsResponse = {
      proyecto: {
        id: proyecto.id,
        nombre: proyecto.nombre,
        estado: proyecto.estado
      },
      informes
    };
    
    requestLogger.debug('Results listed successfully', { proyectoId, reportsCount: informes.length });
    return c.json({ data: response });
  } catch (error) {
    requestLogger.error('Error listing results', error, { proyectoId: c.req.param('proyecto_id') });
    return c.json(
      { error: 'Error al obtener resultados' },
      500
    );
  }
};

/**
 * Handler: GET /api/v1/proyectos/{proyecto_id}/resultados/{tipo_informe}
 * 
 * Obtiene el contenido de un informe Markdown específico.
 * 
 * Path Parameters:
 * - proyecto_id: String (UUID) - Identificador único del proyecto
 * - tipo_informe: String - Tipo de informe
 * 
 * Response 200: Markdown content (text/markdown)
 * Response 404: { error: "Informe no encontrado" }
 * Response 500: { error: "Error al obtener informe" }
 */
export const getReport = async (c: Context<AppContext>): Promise<Response> => {
  const requestId = c.req.header('x-request-id') || crypto.randomUUID();
  const requestLogger = createRequestLogger(requestId);
  
  try {
    const proyectoId = c.req.param('proyecto_id');
    const tipoInformeParam = c.req.param('tipo_informe');
    
    requestLogger.info('Get report request', { proyectoId, tipoInforme: tipoInformeParam });
    
    // Validate proyecto_id format
    if (!proyectoId || !isValidUUID(proyectoId)) {
      return c.json(
        { error: 'ID de proyecto inválido' },
        400
      );
    }
    
    // Validate tipo_informe
    if (!tipoInformeParam || !isValidTipoInforme(tipoInformeParam)) {
      return c.json(
        { 
          error: 'Tipo de informe inválido. Debe ser uno de: resumen, datos_clave, activo_fisico, activo_estrategico, activo_financiero, activo_regulado, lectura_inversor, lectura_emprendedor, lectura_propietario'
        },
        400
      );
    }
    
    const tipoInforme = tipoInformeParam as TipoInforme;
    
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
    
    // Fetch step data from database to get R2 path
    const step = await getStepByType(db, proyectoId, tipoInforme);
    
    if (!step || !step.ruta_archivo_r2) {
      return c.json(
        { error: 'Informe no encontrado' },
        404
      );
    }
    
    // Fetch report content from R2
    const r2Key = getReportR2Key(proyectoId, tipoInforme);
    const reportContent = await fetchReportFromR2(r2, r2Key);
    
    if (!reportContent) {
      return c.json(
        { error: 'Informe no encontrado' },
        404
      );
    }
    
    // Return Markdown content with proper content type
    return new Response(reportContent, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
      }
    });
    
    requestLogger.debug('Report retrieved successfully', { proyectoId, tipoInforme });
  } catch (error) {
    requestLogger.error('Error getting report', error, {
      proyectoId: c.req.param('proyecto_id'),
      tipoInforme: c.req.param('tipo_informe')
    });
    return c.json(
      { error: 'Error al obtener informe' },
      500
    );
  }
};

/**
 * ========================================
 * ROUTER CONFIGURATION
 * ========================================
 */

import { Hono } from 'hono';

/**
 * Creates and configures the results router
 */
export const createResultsRouter = (): Hono<AppContext> => {
  const router = new Hono<AppContext>();
  
  // GET /api/v1/proyectos/:proyecto_id/resultados
  router.get('/proyectos/:proyecto_id/resultados', listResults);
  
  // GET /api/v1/proyectos/:proyecto_id/resultados/:tipo_informe
  router.get('/proyectos/:proyecto_id/resultados/:tipo_informe', getReport);
  
  return router;
};
