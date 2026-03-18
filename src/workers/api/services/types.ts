/**
 * Service Types - VaaIA API Services
 * 
 * Definición de tipos compartidos para todos los servicios.
 * Incluye tipos para entidades, bindings y respuestas.
 * 
 * @module services/types
 */

/**
 * Environment Bindings Type
 * Define los bindings de Cloudflare disponibles en el entorno.
 * R4: Accesores tipados para bindings (centralizar validación de variables requeridas)
 */
export interface Env {
  CF_B_KV_SECRETS: KVNamespace;
  CF_B_DB_INMO: D1Database;
  CF_B_R2_INMO: R2Bucket;
}

/**
 * Project State Type
 * Estados permitidos para un proyecto según el modelo de datos.
 */
export type EstadoProyecto = 'creado' | 'procesando_analisis' | 'analisis_con_error' | 'analisis_finalizado';

/**
 * Execution State Type
 * Estados permitidos para una ejecución de workflow.
 */
export type EstadoEjecucion = 'iniciada' | 'en_ejecucion' | 'finalizada_correctamente' | 'finalizada_con_error';

/**
 * Step State Type
 * Estados permitidos para un paso de workflow.
 */
export type EstadoPaso = 'pendiente' | 'en_ejecucion' | 'correcto' | 'error';

/**
 * Step Type
 * Tipos de pasos del workflow de análisis.
 */
export type TipoPaso = 'resumen' | 'datos_clave' | 'activo_fisico' | 'activo_estrategico' | 'activo_financiero' | 'activo_regulado' | 'lectura_inversor' | 'lectura_emprendedor' | 'lectura_propietario';

/**
 * Project Data Interface
 * Estructura de datos de un proyecto.
 */
export interface ProyectoData {
  id: string;
  nombre: string;
  descripcion: string | null;
  i_json: string;
  estado: EstadoProyecto;
  asesor_responsable: string | null;
  fecha_creacion: string;
  fecha_actualizacion: string;
  fecha_analisis_inicio: string | null;
  fecha_analisis_fin: string | null;
  i_json_url: string | null;
}

/**
 * Execution Data Interface
 * Estructura de datos de una ejecución de workflow.
 */
export interface EjecucionData {
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
export interface PasoData {
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
 * Create Project Input Interface
 * Estructura de datos para crear un proyecto.
 */
export interface CreateProjectInput {
  id: string;
  nombre: string;
  descripcion: string | null;
  i_json: string;
  asesor_responsable: string | null;
}

/**
 * Update Project Input Interface
 * Estructura de datos para actualizar un proyecto.
 */
export interface UpdateProjectInput {
  nombre?: string;
  descripcion?: string;
  estado?: EstadoProyecto;
  asesor_responsable?: string;
  fecha_actualizacion?: string;
  fecha_analisis_inicio?: string | null;
  fecha_analisis_fin?: string | null;
  i_json_url?: string | null;
}

/**
 * Create Execution Input Interface
 * Estructura de datos para crear una ejecución.
 */
export interface CreateExecutionInput {
  id: string;
  proyecto_id: string;
  fecha_inicio: string;
}

/**
 * Update Execution Input Interface
 * Estructura de datos para actualizar una ejecución.
 */
export interface UpdateExecutionInput {
  estado?: EstadoEjecucion;
  fecha_fin?: string | null;
  error_mensaje?: string | null;
}

/**
 * Create Step Input Interface
 * Estructura de datos para crear un paso.
 */
export interface CreateStepInput {
  id: string;
  ejecucion_id: string;
  tipo_paso: TipoPaso;
  orden: number;
  fecha_inicio: string;
}

/**
 * Update Step Input Interface
 * Estructura de datos para actualizar un paso.
 */
export interface UpdateStepInput {
  estado?: EstadoPaso;
  fecha_fin?: string | null;
  error_mensaje?: string | null;
  ruta_archivo_r2?: string | null;
}

/**
 * Pagination Options Interface
 * Opciones de paginación para listados.
 */
export interface PaginationOptions {
  page?: number;
  limit?: number;
}

/**
 * Pagination Result Interface
 * Resultado de una consulta paginada.
 */
export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

/**
 * Storage Upload Options Interface
 * Opciones para subir archivos a R2.
 */
export interface StorageUploadOptions {
  contentType?: string;
  customMetadata?: Record<string, string>;
}

/**
 * Validation Error Detail Interface
 * Estructura para detalles de error de validación.
 */
export interface ValidationErrorDetail {
  campo: string;
  mensaje: string;
}

/**
 * Validation Result Interface
 * Resultado de una validación.
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationErrorDetail[];
}

/**
 * I-JSON Schema Interface
 * Esquema de validación para I-JSON.
 */
export interface IJsonSchema {
  titulo_anuncio?: string;
  descripcion?: string;
  tipo_operacion?: string;
  tipo_inmueble?: string;
  precio?: string | number;
  superficie_construida_m2?: string | number;
  ciudad?: string;
  barrio?: string;
  url_fuente?: string;
  portal_inmobiliario?: string;
  id_anuncio?: string;
}
