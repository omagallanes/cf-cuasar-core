/**
 * Execution Service - VaaIA API Services
 * 
 * Servicio para gestión de ejecuciones de workflows en D1.
 * Proporciona operaciones CRUD para ejecuciones y consultas especializadas.
 * 
 * @module services/execution.service
 */

import type {
  Env,
  EjecucionData,
  CreateExecutionInput,
  UpdateExecutionInput,
  PaginationOptions,
  PaginationResult,
  EstadoEjecucion
} from './types';
import { logger } from '../utils/logger';

/**
 * ExecutionService Class
 * 
 * Servicio para gestión de ejecuciones de workflows en la base de datos D1.
 * Implementa operaciones CRUD y consultas especializadas por proyecto.
 * 
 * R4: Accesores tipados para bindings (centralizar validación de variables requeridas)
 * R9: Migraciones de esquema de base de datos (no DDL dinámico)
 */
export class ExecutionService {
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
   * Create a new execution
   * 
   * Crea una nueva ejecución de workflow en la base de datos D1.
   * 
   * @param input - Datos de la ejecución a crear
   * @returns La ejecución creada
   * @throws Error si la inserción falla
   */
  async create(input: CreateExecutionInput): Promise<EjecucionData> {
    logger.debug('Creating execution', { id: input.id, proyectoId: input.proyecto_id });
    
    // R9: Queries parametrizadas para evitar SQL injection
    const result = await this.db
      .prepare(`
        INSERT INTO ani_ejecuciones (id, proyecto_id, estado, fecha_inicio, fecha_fin, error_mensaje)
        VALUES (?, ?, ?, ?, ?, ?)
      `)
      .bind(
        input.id,
        input.proyecto_id,
        'iniciada' as EstadoEjecucion,
        input.fecha_inicio,
        null,
        null
      )
      .run();

    if (!result.success) {
      throw new Error('Failed to create execution');
    }

    const execution = await this.read(input.id);
    if (!execution) {
      throw new Error('Failed to retrieve created execution');
    }
    logger.debug('Execution created successfully', { id: input.id });
    return execution;
  }

  /**
   * Read an execution by ID
   * 
   * Obtiene una ejecución específica por su ID.
   * 
   * @param id - ID de la ejecución
   * @returns La ejecución o null si no existe
   */
  async read(id: string): Promise<EjecucionData | null> {
    logger.debug('Reading execution', { id });
    
    // R9: Queries parametrizadas
    const result = await this.db
      .prepare(`
        SELECT id, proyecto_id, estado, fecha_inicio, fecha_fin, error_mensaje
        FROM ani_ejecuciones
        WHERE id = ?
      `)
      .bind(id)
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
      error_mensaje: result.error_mensaje as string | null,
    };
    
    logger.debug('Execution read successfully', { id, exists: !!result });
  }

  /**
   * Update an execution
   * 
   * Actualiza una ejecución existente. Solo actualiza los campos proporcionados.
   * 
   * @param id - ID de la ejecución a actualizar
   * @param input - Datos a actualizar
   * @returns La ejecución actualizada o null si no existe
   * @throws Error si la actualización falla
   */
  async update(id: string, input: UpdateExecutionInput): Promise<EjecucionData | null> {
    logger.debug('Updating execution', { id, fields: Object.keys(input) });
    
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

    // Add id as last parameter for WHERE clause
    values.push(id);

    if (updates.length > 0) {
      // R9: Queries parametrizadas
      const result = await this.db
        .prepare(`UPDATE ani_ejecuciones SET ${updates.join(', ')} WHERE id = ?`)
        .bind(...values)
        .run();

      if (!result.success) {
        throw new Error('Failed to update execution');
      }
    }

    logger.debug('Execution updated successfully', { id });
    return this.read(id);
  }

  /**
   * Delete an execution
   * 
   * Elimina una ejecución y todos sus pasos asociados (cascada en D1).
   * 
   * @param id - ID de la ejecución a eliminar
   * @returns true si se eliminó, false si no existía
   */
  async delete(id: string): Promise<boolean> {
    logger.debug('Deleting execution', { id });
    
    // R9: Queries parametrizadas
    const result = await this.db
      .prepare('DELETE FROM ani_ejecuciones WHERE id = ?')
      .bind(id)
      .run();

    const deleted = result.success && (result.meta?.changes ?? 0) > 0;
    logger.debug('Execution deleted', { id, deleted });
    return deleted;
  }

  /**
   * List executions with pagination
   * 
   * Lista todas las ejecuciones con paginación opcional.
   * 
   * @param options - Opciones de paginación
   * @returns Lista paginada de ejecuciones
   */
  async list(options: PaginationOptions = {}): Promise<PaginationResult<EjecucionData>> {
    const page = options.page ?? 1;
    const limit = options.limit ?? 20;
    const offset = (page - 1) * limit;

    // Get total count
    const countResult = await this.db
      .prepare('SELECT COUNT(*) as total FROM ani_ejecuciones')
      .first<{ total: number }>();

    const total = countResult?.total ?? 0;

    // Get paginated results
    const results = await this.db
      .prepare(`
        SELECT id, proyecto_id, estado, fecha_inicio, fecha_fin, error_mensaje
        FROM ani_ejecuciones
        ORDER BY fecha_inicio DESC
        LIMIT ? OFFSET ?
      `)
      .bind(limit, offset)
      .all<{ 
        id: string; 
        proyecto_id: string; 
        estado: EstadoEjecucion; 
        fecha_inicio: string; 
        fecha_fin: string | null; 
        error_mensaje: string | null; 
      }>();

    const data = results.results.map(row => ({
      id: row.id,
      proyecto_id: row.proyecto_id,
      estado: row.estado,
      fecha_inicio: row.fecha_inicio,
      fecha_fin: row.fecha_fin,
      error_mensaje: row.error_mensaje,
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
   * Get executions by project ID
   * 
   * Obtiene todas las ejecuciones asociadas a un proyecto específico.
   * 
   * @param proyectoId - ID del proyecto
   * @param options - Opciones de paginación
   * @returns Lista paginada de ejecuciones del proyecto
   */
  async getByProjectId(
    proyectoId: string,
    options: PaginationOptions = {}
  ): Promise<PaginationResult<EjecucionData>> {
    const page = options.page ?? 1;
    const limit = options.limit ?? 20;
    const offset = (page - 1) * limit;

    // Get total count for project
    const countResult = await this.db
      .prepare('SELECT COUNT(*) as total FROM ani_ejecuciones WHERE proyecto_id = ?')
      .bind(proyectoId)
      .first<{ total: number }>();

    const total = countResult?.total ?? 0;

    // Get paginated results for project
    const results = await this.db
      .prepare(`
        SELECT id, proyecto_id, estado, fecha_inicio, fecha_fin, error_mensaje
        FROM ani_ejecuciones
        WHERE proyecto_id = ?
        ORDER BY fecha_inicio DESC
        LIMIT ? OFFSET ?
      `)
      .bind(proyectoId, limit, offset)
      .all<{ 
        id: string; 
        proyecto_id: string; 
        estado: EstadoEjecucion; 
        fecha_inicio: string; 
        fecha_fin: string | null; 
        error_mensaje: string | null; 
      }>();

    const data = results.results.map(row => ({
      id: row.id,
      proyecto_id: row.proyecto_id,
      estado: row.estado,
      fecha_inicio: row.fecha_inicio,
      fecha_fin: row.fecha_fin,
      error_mensaje: row.error_mensaje,
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
   * Check if an execution exists
   * 
   * Verifica si existe una ejecución con el ID especificado.
   * 
   * @param id - ID de la ejecución
   * @returns true si existe, false en caso contrario
   */
  async exists(id: string): Promise<boolean> {
    // R9: Queries parametrizadas
    const result = await this.db
      .prepare('SELECT id FROM ani_ejecuciones WHERE id = ?')
      .bind(id)
      .first();

    return result !== undefined;
  }

  /**
   * Get executions by state
   * 
   * Obtiene todas las ejecuciones con un estado específico.
   * 
   * @param estado - Estado de las ejecuciones a buscar
   * @returns Lista de ejecuciones con el estado especificado
   */
  async getByEstado(estado: EstadoEjecucion): Promise<EjecucionData[]> {
    // R9: Queries parametrizadas
    const results = await this.db
      .prepare(`
        SELECT id, proyecto_id, estado, fecha_inicio, fecha_fin, error_mensaje
        FROM ani_ejecuciones
        WHERE estado = ?
        ORDER BY fecha_inicio DESC
      `)
      .bind(estado)
      .all();

    return results.results.map(row => ({
      id: row.id as string,
      proyecto_id: row.proyecto_id as string,
      estado: row.estado as EstadoEjecucion,
      fecha_inicio: row.fecha_inicio as string,
      fecha_fin: row.fecha_fin as string | null,
      error_mensaje: row.error_mensaje as string | null,
    }));
  }

  /**
   * Get latest execution for a project
   * 
   * Obtiene la ejecución más reciente de un proyecto.
   * 
   * @param proyectoId - ID del proyecto
   * @returns La ejecución más reciente o null si no existe
   */
  async getLatestByProjectId(proyectoId: string): Promise<EjecucionData | null> {
    // R9: Queries parametrizadas
    const result = await this.db
      .prepare(`
        SELECT id, proyecto_id, estado, fecha_inicio, fecha_fin, error_mensaje
        FROM ani_ejecuciones
        WHERE proyecto_id = ?
        ORDER BY fecha_inicio DESC
        LIMIT 1
      `)
      .bind(proyectoId)
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
      error_mensaje: result.error_mensaje as string | null,
    };
  }

  /**
   * Check if a project has an active execution
   * 
   * Verifica si un proyecto tiene una ejecución en progreso.
   * 
   * @param proyectoId - ID del proyecto
   * @returns true si hay una ejecución activa, false en caso contrario
   */
  async hasActiveExecution(proyectoId: string): Promise<boolean> {
    // R9: Queries parametrizadas
    const result = await this.db
      .prepare(`
        SELECT id FROM ani_ejecuciones
        WHERE proyecto_id = ? AND estado IN ('iniciada', 'en_ejecucion')
        LIMIT 1
      `)
      .bind(proyectoId)
      .first();

    return result !== undefined;
  }
}
