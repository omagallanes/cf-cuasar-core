/**
 * Project Service - VaaIA API Services
 * 
 * Servicio para gestión de proyectos en D1.
 * Proporciona operaciones CRUD completas para proyectos.
 * 
 * @module services/project.service
 */

import type {
  Env,
  ProyectoData,
  CreateProjectInput,
  UpdateProjectInput,
  PaginationOptions,
  PaginationResult,
  EstadoProyecto
} from './types';
import { logger } from '../utils/logger';

/**
 * ProjectService Class
 * 
 * Servicio para gestión de proyectos en la base de datos D1.
 * Implementa operaciones CRUD completas y consultas especializadas.
 * 
 * R4: Accesores tipados para bindings (centralizar validación de variables requeridas)
 * R9: Migraciones de esquema de base de datos (no DDL dinámico)
 */
export class ProjectService {
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
   * Create a new project
   * 
   * Crea un nuevo proyecto en la base de datos D1.
   * 
   * @param input - Datos del proyecto a crear
   * @returns El proyecto creado
   * @throws Error si la inserción falla
   */
  async create(input: CreateProjectInput): Promise<ProyectoData> {
    const now = new Date().toISOString();
    
    logger.debug('Creating project', { id: input.id, nombre: input.nombre });
    
    // R9: Queries parametrizadas para evitar SQL injection
    const result = await this.db
      .prepare(`
        INSERT INTO ani_proyectos (
          id, nombre, descripcion, i_json, estado, asesor_responsable,
          fecha_creacion, fecha_actualizacion, fecha_analisis_inicio,
          fecha_analisis_fin, i_json_url
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        input.id,
        input.nombre,
        input.descripcion,
        input.i_json,
        'creado' as EstadoProyecto,
        input.asesor_responsable,
        now,
        now,
        null,
        null,
        null
      )
      .run();

    if (!result.success) {
      throw new Error('Failed to create project');
    }

    const project = await this.read(input.id);
    if (!project) {
      throw new Error('Failed to retrieve created project');
    }
    logger.debug('Project created successfully', { id: input.id });
    return project;
  }

  /**
   * Read a project by ID
   * 
   * Obtiene un proyecto específico por su ID.
   * 
   * @param id - ID del proyecto
   * @returns El proyecto o null si no existe
   */
  async read(id: string): Promise<ProyectoData | null> {
    logger.debug('Reading project', { id });
    
    // R9: Queries parametrizadas
    const result = await this.db
      .prepare(`
        SELECT 
          id, nombre, descripcion, i_json, estado, asesor_responsable,
          fecha_creacion, fecha_actualizacion, fecha_analisis_inicio,
          fecha_analisis_fin, i_json_url
        FROM ani_proyectos
        WHERE id = ?
      `)
      .bind(id)
      .first();

    if (!result) {
      return null;
    }

    return {
      id: result.id as string,
      nombre: result.nombre as string,
      descripcion: result.descripcion as string | null,
      i_json: result.i_json as string,
      estado: result.estado as EstadoProyecto,
      asesor_responsable: result.asesor_responsable as string | null,
      fecha_creacion: result.fecha_creacion as string,
      fecha_actualizacion: result.fecha_actualizacion as string,
      fecha_analisis_inicio: result.fecha_analisis_inicio as string | null,
      fecha_analisis_fin: result.fecha_analisis_fin as string | null,
      i_json_url: result.i_json_url as string | null,
    };
    
    logger.debug('Project read successfully', { id, exists: !!result });
  }

  /**
   * Update a project
   * 
   * Actualiza un proyecto existente. Solo actualiza los campos proporcionados.
   * 
   * @param id - ID del proyecto a actualizar
   * @param input - Datos a actualizar
   * @returns El proyecto actualizado o null si no existe
   * @throws Error si la actualización falla
   */
  async update(id: string, input: UpdateProjectInput): Promise<ProyectoData | null> {
    logger.debug('Updating project', { id, fields: Object.keys(input) });
    
    const existing = await this.read(id);
    if (!existing) {
      return null;
    }

    // Build dynamic update query based on provided fields
    const updates: string[] = [];
    const values: any[] = [];

    if (input.nombre !== undefined) {
      updates.push('nombre = ?');
      values.push(input.nombre);
    }
    if (input.descripcion !== undefined) {
      updates.push('descripcion = ?');
      values.push(input.descripcion);
    }
    if (input.estado !== undefined) {
      updates.push('estado = ?');
      values.push(input.estado);
    }
    if (input.asesor_responsable !== undefined) {
      updates.push('asesor_responsable = ?');
      values.push(input.asesor_responsable);
    }
    if (input.i_json_url !== undefined) {
      updates.push('i_json_url = ?');
      values.push(input.i_json_url);
    }
    if (input.fecha_analisis_inicio !== undefined) {
      updates.push('fecha_analisis_inicio = ?');
      values.push(input.fecha_analisis_inicio);
    }
    if (input.fecha_analisis_fin !== undefined) {
      updates.push('fecha_analisis_fin = ?');
      values.push(input.fecha_analisis_fin);
    }

    // Always update fecha_actualizacion
    updates.push('fecha_actualizacion = ?');
    values.push(input.fecha_actualizacion || new Date().toISOString());

    // Add id as last parameter for WHERE clause
    values.push(id);

    if (updates.length > 0) {
      // R9: Queries parametrizadas
      const result = await this.db
        .prepare(`UPDATE ani_proyectos SET ${updates.join(', ')} WHERE id = ?`)
        .bind(...values)
        .run();

      if (!result.success) {
        throw new Error('Failed to update project');
      }
    }

    logger.debug('Project updated successfully', { id });
    return this.read(id);
  }

  /**
   * Delete a project
   * 
   * Elimina un proyecto y todos sus datos asociados (cascada en D1).
   * 
   * @param id - ID del proyecto a eliminar
   * @returns true si se eliminó, false si no existía
   */
  async delete(id: string): Promise<boolean> {
    logger.debug('Deleting project', { id });
    
    // R9: Queries parametrizadas
    const result = await this.db
      .prepare('DELETE FROM ani_proyectos WHERE id = ?')
      .bind(id)
      .run();

    const deleted = result.success && (result.meta?.changes ?? 0) > 0;
    logger.debug('Project deleted', { id, deleted });
    return deleted;
  }

  /**
   * List projects with pagination and optional filtering
   * 
   * Lista todos los proyectos con paginación opcional y filtrado por estado.
   * 
   * @param options - Opciones de paginación y filtrado
   * @returns Lista paginada de proyectos
   */
  async list(options: PaginationOptions & { estado?: EstadoProyecto } = {}): Promise<PaginationResult<ProyectoData>> {
    const page = options.page ?? 1;
    const limit = options.limit ?? 20;
    const offset = (page - 1) * limit;

    // Build WHERE clause for filtering
    const whereClause = options.estado ? 'WHERE estado = ?' : '';
    const whereParams = options.estado ? [options.estado] : [];

    // Get total count
    const countResult = await this.db
      .prepare(`SELECT COUNT(*) as total FROM ani_proyectos ${whereClause}`)
      .bind(...whereParams)
      .first<{ total: number }>();

    const total = countResult?.total ?? 0;

    // Get paginated results
    const results = await this.db
      .prepare(`
        SELECT 
          id, nombre, descripcion, i_json, estado, asesor_responsable,
          fecha_creacion, fecha_actualizacion, fecha_analisis_inicio,
          fecha_analisis_fin, i_json_url
        FROM ani_proyectos
        ${whereClause}
        ORDER BY fecha_creacion DESC
        LIMIT ? OFFSET ?
      `)
      .bind(...whereParams, limit, offset)
      .all<{ 
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
      }>();

    const data = results.results.map(row => ({
      id: row.id,
      nombre: row.nombre,
      descripcion: row.descripcion,
      i_json: row.i_json,
      estado: row.estado,
      asesor_responsable: row.asesor_responsable,
      fecha_creacion: row.fecha_creacion,
      fecha_actualizacion: row.fecha_actualizacion,
      fecha_analisis_inicio: row.fecha_analisis_inicio,
      fecha_analisis_fin: row.fecha_analisis_fin,
      i_json_url: row.i_json_url,
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
   * Check if a project exists
   * 
   * Verifica si existe un proyecto con el ID especificado.
   * 
   * @param id - ID del proyecto
   * @returns true si existe, false en caso contrario
   */
  async exists(id: string): Promise<boolean> {
    // R9: Queries parametrizadas
    const result = await this.db
      .prepare('SELECT id FROM ani_proyectos WHERE id = ?')
      .bind(id)
      .first();

    return result !== undefined;
  }

  /**
   * Get projects by state
   * 
   * Obtiene todos los proyectos con un estado específico.
   * 
   * @param estado - Estado de los proyectos a buscar
   * @returns Lista de proyectos con el estado especificado
   */
  async getByEstado(estado: EstadoProyecto): Promise<ProyectoData[]> {
    // R9: Queries parametrizadas
    const results = await this.db
      .prepare(`
        SELECT 
          id, nombre, descripcion, i_json, estado, asesor_responsable,
          fecha_creacion, fecha_actualizacion, fecha_analisis_inicio,
          fecha_analisis_fin, i_json_url
        FROM ani_proyectos
        WHERE estado = ?
        ORDER BY fecha_creacion DESC
      `)
      .bind(estado)
      .all();

    return results.results.map(row => ({
      id: row.id as string,
      nombre: row.nombre as string,
      descripcion: row.descripcion as string | null,
      i_json: row.i_json as string,
      estado: row.estado as EstadoProyecto,
      asesor_responsable: row.asesor_responsable as string | null,
      fecha_creacion: row.fecha_creacion as string,
      fecha_actualizacion: row.fecha_actualizacion as string,
      fecha_analisis_inicio: row.fecha_analisis_inicio as string | null,
      fecha_analisis_fin: row.fecha_analisis_fin as string | null,
      i_json_url: row.i_json_url as string | null,
    }));
  }

  /**
   * Get projects by advisor
   * 
   * Obtiene todos los proyectos asignados a un asesor específico.
   * 
   * @param asesorResponsable - ID del asesor responsable
   * @returns Lista de proyectos del asesor
   */
  async getByAsesor(asesorResponsable: string): Promise<ProyectoData[]> {
    // R9: Queries parametrizadas
    const results = await this.db
      .prepare(`
        SELECT 
          id, nombre, descripcion, i_json, estado, asesor_responsable,
          fecha_creacion, fecha_actualizacion, fecha_analisis_inicio,
          fecha_analisis_fin, i_json_url
        FROM ani_proyectos
        WHERE asesor_responsable = ?
        ORDER BY fecha_creacion DESC
      `)
      .bind(asesorResponsable)
      .all();

    return results.results.map(row => ({
      id: row.id as string,
      nombre: row.nombre as string,
      descripcion: row.descripcion as string | null,
      i_json: row.i_json as string,
      estado: row.estado as EstadoProyecto,
      asesor_responsable: row.asesor_responsable as string | null,
      fecha_creacion: row.fecha_creacion as string,
      fecha_actualizacion: row.fecha_actualizacion as string,
      fecha_analisis_inicio: row.fecha_analisis_inicio as string | null,
      fecha_analisis_fin: row.fecha_analisis_fin as string | null,
      i_json_url: row.i_json_url as string | null,
    }));
  }
}
