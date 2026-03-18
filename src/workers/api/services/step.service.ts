/**
 * Step Service - VaaIA API Services
 * 
 * Servicio para gestión de pasos de workflows en D1.
 * Proporciona operaciones CRUD para pasos y consultas especializadas.
 * 
 * @module services/step.service
 */

import type {
  Env,
  PasoData,
  CreateStepInput,
  UpdateStepInput,
  PaginationOptions,
  PaginationResult,
  EstadoPaso,
  TipoPaso
} from './types';
import { logger } from '../utils/logger';

/**
 * StepService Class
 * 
 * Servicio para gestión de pasos de workflows en la base de datos D1.
 * Implementa operaciones CRUD y consultas especializadas por ejecución.
 * 
 * R4: Accesores tipados para bindings (centralizar validación de variables requeridas)
 * R9: Migraciones de esquema de base de datos (no DDL dinámico)
 */
export class StepService {
  private db: D1Database;

  /**
   * Constructor - Inicializa el servicio con el binding de D1
   * 
   * @param env - Environment bindings
   * @throws Error si el binding CF_B_DB_INMO no está disponible
   */
  constructor(env: Env) {
    // R4: Validación de binding requerido
    if (!env.CF_B_DB_INMO) {
      throw new Error('D1 binding CF_B_DB_INMO is required');
    }
    this.db = env.CF_B_DB_INMO;
  }

  /**
   * Create a new step
   * 
   * Crea un nuevo paso de workflow en la base de datos D1.
   * 
   * @param input - Datos del paso a crear
   * @returns El paso creado
   * @throws Error si la inserción falla
   */
  async create(input: CreateStepInput): Promise<PasoData> {
    logger.debug('Creating step', { id: input.id, ejecucionId: input.ejecucion_id, tipoPaso: input.tipo_paso });
    
    // R9: Queries parametrizadas para evitar SQL injection
    const result = await this.db
      .prepare(`
        INSERT INTO ani_pasos (
          id, ejecucion_id, tipo_paso, orden, estado,
          fecha_inicio, fecha_fin, error_mensaje, ruta_archivo_r2
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        input.id,
        input.ejecucion_id,
        input.tipo_paso,
        input.orden,
        'pendiente' as EstadoPaso,
        input.fecha_inicio,
        null,
        null,
        null
      )
      .run();

    if (!result.success) {
      throw new Error('Failed to create step');
    }

    const step = await this.read(input.id);
    if (!step) {
      throw new Error('Failed to retrieve created step');
    }
    logger.debug('Step created successfully', { id: input.id });
    return step;
  }

  /**
   * Read a step by ID
   * 
   * Obtiene un paso específico por su ID.
   * 
   * @param id - ID del paso
   * @returns El paso o null si no existe
   */
  async read(id: string): Promise<PasoData | null> {
    logger.debug('Reading step', { id });
    
    // R9: Queries parametrizadas
    const result = await this.db
      .prepare(`
        SELECT 
          id, ejecucion_id, tipo_paso, orden, estado,
          fecha_inicio, fecha_fin, error_mensaje, ruta_archivo_r2
        FROM ani_pasos
        WHERE id = ?
      `)
      .bind(id)
      .first();

    if (!result) {
      return null;
    }

    return {
      id: result.id as string,
      ejecucion_id: result.ejecucion_id as string,
      tipo_paso: result.tipo_paso as TipoPaso,
      orden: result.orden as number,
      estado: result.estado as EstadoPaso,
      fecha_inicio: result.fecha_inicio as string,
      fecha_fin: result.fecha_fin as string | null,
      error_mensaje: result.error_mensaje as string | null,
      ruta_archivo_r2: result.ruta_archivo_r2 as string | null,
    };
    
    logger.debug('Step read successfully', { id, exists: !!result });
  }

  /**
   * Update a step
   * 
   * Actualiza un paso existente. Solo actualiza los campos proporcionados.
   * 
   * @param id - ID del paso a actualizar
   * @param input - Datos a actualizar
   * @returns El paso actualizado o null si no existe
   * @throws Error si la actualización falla
   */
  async update(id: string, input: UpdateStepInput): Promise<PasoData | null> {
    logger.debug('Updating step', { id, fields: Object.keys(input) });
    
    const existing = await this.read(id);
    if (!existing) {
      return null;
    }

    // Build dynamic update query based on provided fields
    const updates: string[] = [];
    const values: any[] = [];

    if (input.estado !== undefined) {
      updates.push('estado = ?');
      values.push(input.estado);
    }
    if (input.fecha_fin !== undefined) {
      updates.push('fecha_fin = ?');
      values.push(input.fecha_fin);
    }
    if (input.error_mensaje !== undefined) {
      updates.push('error_mensaje = ?');
      values.push(input.error_mensaje);
    }
    if (input.ruta_archivo_r2 !== undefined) {
      updates.push('ruta_archivo_r2 = ?');
      values.push(input.ruta_archivo_r2);
    }

    // Add id as last parameter for WHERE clause
    values.push(id);

    if (updates.length > 0) {
      // R9: Queries parametrizadas
      const result = await this.db
        .prepare(`UPDATE ani_pasos SET ${updates.join(', ')} WHERE id = ?`)
        .bind(...values)
        .run();

      if (!result.success) {
        throw new Error('Failed to update step');
      }
    }

    return this.read(id);
  }

  /**
   * Delete a step
   * 
   * Elimina un paso de la base de datos.
   * 
   * @param id - ID del paso a eliminar
   * @returns true si se eliminó, false si no existía
   */
  async delete(id: string): Promise<boolean> {
    // R9: Queries parametrizadas
    const result = await this.db
      .prepare('DELETE FROM ani_pasos WHERE id = ?')
      .bind(id)
      .run();

    return result.success && (result.meta?.changes ?? 0) > 0;
  }

  /**
   * List steps with pagination
   * 
   * Lista todos los pasos con paginación opcional.
   * 
   * @param options - Opciones de paginación
   * @returns Lista paginada de pasos
   */
  async list(options: PaginationOptions = {}): Promise<PaginationResult<PasoData>> {
    const page = options.page ?? 1;
    const limit = options.limit ?? 20;
    const offset = (page - 1) * limit;

    // Get total count
    const countResult = await this.db
      .prepare('SELECT COUNT(*) as total FROM ani_pasos')
      .first<{ total: number }>();

    const total = countResult?.total ?? 0;

    // Get paginated results
    const results = await this.db
      .prepare(`
        SELECT 
          id, ejecucion_id, tipo_paso, orden, estado,
          fecha_inicio, fecha_fin, error_mensaje, ruta_archivo_r2
        FROM ani_pasos
        ORDER BY fecha_inicio DESC
        LIMIT ? OFFSET ?
      `)
      .bind(limit, offset)
      .all<{ 
        id: string; 
        ejecucion_id: string; 
        tipo_paso: TipoPaso; 
        orden: number; 
        estado: EstadoPaso; 
        fecha_inicio: string; 
        fecha_fin: string | null; 
        error_mensaje: string | null; 
        ruta_archivo_r2: string | null; 
      }>();

    const data = results.results.map(row => ({
      id: row.id,
      ejecucion_id: row.ejecucion_id,
      tipo_paso: row.tipo_paso,
      orden: row.orden,
      estado: row.estado,
      fecha_inicio: row.fecha_inicio,
      fecha_fin: row.fecha_fin,
      error_mensaje: row.error_mensaje,
      ruta_archivo_r2: row.ruta_archivo_r2,
    }));

    return {
      data,
      pagination: {
        page,
        limit,
        total,
      },
    };
  }

  /**
   * Get steps by execution ID
   * 
   * Obtiene todos los pasos asociados a una ejecución específica.
   * 
   * @param ejecucionId - ID de la ejecución
   * @param options - Opciones de paginación
   * @returns Lista paginada de pasos de la ejecución
   */
  async getByExecutionId(
    ejecucionId: string,
    options: PaginationOptions = {}
  ): Promise<PaginationResult<PasoData>> {
    const page = options.page ?? 1;
    const limit = options.limit ?? 20;
    const offset = (page - 1) * limit;

    // Get total count for execution
    const countResult = await this.db
      .prepare('SELECT COUNT(*) as total FROM ani_pasos WHERE ejecucion_id = ?')
      .bind(ejecucionId)
      .first<{ total: number }>();

    const total = countResult?.total ?? 0;

    // Get paginated results for execution
    const results = await this.db
      .prepare(`
        SELECT 
          id, ejecucion_id, tipo_paso, orden, estado,
          fecha_inicio, fecha_fin, error_mensaje, ruta_archivo_r2
        FROM ani_pasos
        WHERE ejecucion_id = ?
        ORDER BY orden ASC
        LIMIT ? OFFSET ?
      `)
      .bind(ejecucionId, limit, offset)
      .all<{ 
        id: string; 
        ejecucion_id: string; 
        tipo_paso: TipoPaso; 
        orden: number; 
        estado: EstadoPaso; 
        fecha_inicio: string; 
        fecha_fin: string | null; 
        error_mensaje: string | null; 
        ruta_archivo_r2: string | null; 
      }>();

    const data = results.results.map(row => ({
      id: row.id,
      ejecucion_id: row.ejecucion_id,
      tipo_paso: row.tipo_paso,
      orden: row.orden,
      estado: row.estado,
      fecha_inicio: row.fecha_inicio,
      fecha_fin: row.fecha_fin,
      error_mensaje: row.error_mensaje,
      ruta_archivo_r2: row.ruta_archivo_r2,
    }));

    return {
      data,
      pagination: {
        page,
        limit,
        total,
      },
    };
  }

  /**
   * Check if a step exists
   * 
   * Verifica si existe un paso con el ID especificado.
   * 
   * @param id - ID del paso
   * @returns true si existe, false en caso contrario
   */
  async exists(id: string): Promise<boolean> {
    // R9: Queries parametrizadas
    const result = await this.db
      .prepare('SELECT id FROM ani_pasos WHERE id = ?')
      .bind(id)
      .first();

    return result !== undefined;
  }

  /**
   * Get steps by state
   * 
   * Obtiene todos los pasos con un estado específico.
   * 
   * @param estado - Estado de los pasos a buscar
   * @returns Lista de pasos con el estado especificado
   */
  async getByEstado(estado: EstadoPaso): Promise<PasoData[]> {
    // R9: Queries parametrizadas
    const results = await this.db
      .prepare(`
        SELECT 
          id, ejecucion_id, tipo_paso, orden, estado,
          fecha_inicio, fecha_fin, error_mensaje, ruta_archivo_r2
        FROM ani_pasos
        WHERE estado = ?
        ORDER BY fecha_inicio DESC
      `)
      .bind(estado)
      .all();

    return results.results.map(row => ({
      id: row.id as string,
      ejecucion_id: row.ejecucion_id as string,
      tipo_paso: row.tipo_paso as TipoPaso,
      orden: row.orden as number,
      estado: row.estado as EstadoPaso,
      fecha_inicio: row.fecha_inicio as string,
      fecha_fin: row.fecha_fin as string | null,
      error_mensaje: row.error_mensaje as string | null,
      ruta_archivo_r2: row.ruta_archivo_r2 as string | null,
    }));
  }

  /**
   * Get step by execution and type
   * 
   * Obtiene un paso específico por ejecución y tipo.
   * 
   * @param ejecucionId - ID de la ejecución
   * @param tipoPaso - Tipo de paso
   * @returns El paso o null si no existe
   */
  async getByExecutionAndType(ejecucionId: string, tipoPaso: TipoPaso): Promise<PasoData | null> {
    // R9: Queries parametrizadas
    const result = await this.db
      .prepare(`
        SELECT 
          id, ejecucion_id, tipo_paso, orden, estado,
          fecha_inicio, fecha_fin, error_mensaje, ruta_archivo_r2
        FROM ani_pasos
        WHERE ejecucion_id = ? AND tipo_paso = ?
        LIMIT 1
      `)
      .bind(ejecucionId, tipoPaso)
      .first();

    if (!result) {
      return null;
    }

    return {
      id: result.id as string,
      ejecucion_id: result.ejecucion_id as string,
      tipo_paso: result.tipo_paso as TipoPaso,
      orden: result.orden as number,
      estado: result.estado as EstadoPaso,
      fecha_inicio: result.fecha_inicio as string,
      fecha_fin: result.fecha_fin as string | null,
      error_mensaje: result.error_mensaje as string | null,
      ruta_archivo_r2: result.ruta_archivo_r2 as string | null,
    };
  }

  /**
   * Get all steps for execution (without pagination)
   * 
   * Obtiene todos los pasos de una ejecución sin paginación.
   * 
   * @param ejecucionId - ID de la ejecución
   * @returns Lista de pasos de la ejecución ordenados por orden
   */
  async getAllByExecutionId(ejecucionId: string): Promise<PasoData[]> {
    // R9: Queries parametrizadas
    const results = await this.db
      .prepare(`
        SELECT 
          id, ejecucion_id, tipo_paso, orden, estado,
          fecha_inicio, fecha_fin, error_mensaje, ruta_archivo_r2
        FROM ani_pasos
        WHERE ejecucion_id = ?
        ORDER BY orden ASC
      `)
      .bind(ejecucionId)
      .all();

    return results.results.map(row => ({
      id: row.id as string,
      ejecucion_id: row.ejecucion_id as string,
      tipo_paso: row.tipo_paso as TipoPaso,
      orden: row.orden as number,
      estado: row.estado as EstadoPaso,
      fecha_inicio: row.fecha_inicio as string,
      fecha_fin: row.fecha_fin as string | null,
      error_mensaje: row.error_mensaje as string | null,
      ruta_archivo_r2: row.ruta_archivo_r2 as string | null,
    }));
  }

  /**
   * Update step state
   * 
   * Actualiza el estado de un paso.
   * 
   * @param id - ID del paso
   * @param estado - Nuevo estado
   * @param fechaFin - Fecha de finalización (opcional)
   * @param errorMessage - Mensaje de error (opcional)
   * @returns El paso actualizado o null si no existe
   */
  async updateState(
    id: string,
    estado: EstadoPaso,
    fechaFin?: string,
    errorMessage?: string
  ): Promise<PasoData | null> {
    const updates: string[] = ['estado = ?'];
    const values: any[] = [estado];

    if (fechaFin !== undefined) {
      updates.push('fecha_fin = ?');
      values.push(fechaFin);
    }
    if (errorMessage !== undefined) {
      updates.push('error_mensaje = ?');
      values.push(errorMessage);
    }

    values.push(id);

    // R9: Queries parametrizadas
    const result = await this.db
      .prepare(`UPDATE ani_pasos SET ${updates.join(', ')} WHERE id = ?`)
      .bind(...values)
      .run();

    if (!result.success) {
      throw new Error('Failed to update step state');
    }

    return this.read(id);
  }
}
