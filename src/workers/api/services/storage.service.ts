/**
 * Storage Service - VaaIA API Services
 * 
 * Servicio para almacenamiento en R2.
 * Proporciona operaciones de upload, download, delete y list para archivos.
 * 
 * @module services/storage.service
 */

import type {
  Env,
  StorageUploadOptions
} from './types';
import { logger } from '../utils/logger';

/**
 * StorageService Class
 * 
 * Servicio para gestión de archivos en el almacenamiento R2 de Cloudflare.
 * Implementa operaciones de subida, descarga, eliminación y listado de archivos.
 * 
 * R4: Accesores tipados para bindings (centralizar validación de variables requeridas)
 */
export class StorageService {
  private bucket: R2Bucket;

  /**
   * R2 base path for project storage
   * Estructura de carpetas: r2-almacen/dir-api-inmo/{proyecto_id}/
   */
  private static readonly BASE_PATH = 'r2-almacen/dir-api-inmo';

  /**
   * Constructor - Inicializa el servicio con el binding de R2
   * 
   * @param env - Environment bindings
   * @throws Error si el binding CF_B_R2_INMO no está disponible
   */
  constructor(env: Env) {
    // R4: Validación de binding requerido
    if (!env.CF_B_R2_INMO) {
      throw new Error('R2 binding CF_B_R2_INMO is required');
    }
    this.bucket = env.CF_B_R2_INMO;
  }

  /**
   * Upload a file to R2
   * 
   * Sube un archivo al almacenamiento R2 con la ruta especificada.
   * 
   * @param projectId - ID del proyecto
   * @param fileName - Nombre del archivo
   * @param data - Datos del archivo (string, ArrayBuffer, ReadableStream)
   * @param options - Opciones adicionales para el upload
   * @returns La clave del archivo en R2
   * @throws Error si el upload falla
   */
  async upload(
    projectId: string,
    fileName: string,
    data: string | ArrayBuffer | ReadableStream,
    options: StorageUploadOptions = {}
  ): Promise<string> {
    const key = this.buildKey(projectId, fileName);
    
    logger.debug('Uploading file to R2', { projectId, fileName, key });

    // Prepare upload options
    const uploadOptions: R2PutOptions = {};

    if (options.contentType) {
      uploadOptions.httpMetadata = {
        contentType: options.contentType,
      };
    }

    if (options.customMetadata) {
      uploadOptions.customMetadata = options.customMetadata;
    }

    // Upload to R2
    await this.bucket.put(key, data, uploadOptions);

    logger.debug('File uploaded successfully', { projectId, fileName, key });
    return key;
  }

  /**
   * Download a file from R2
   * 
   * Descarga un archivo del almacenamiento R2.
   * 
   * @param projectId - ID del proyecto
   * @param fileName - Nombre del archivo
   * @returns El objeto R2Object con los datos del archivo o null si no existe
   */
  async download(
    projectId: string,
    fileName: string
  ): Promise<R2Object | null> {
    const key = this.buildKey(projectId, fileName);
    
    logger.debug('Downloading file from R2', { projectId, fileName, key });

    const object = await this.bucket.get(key);

    logger.debug('File downloaded successfully', { projectId, fileName, key, exists: !!object });
    return object;
  }

  /**
   * Download a file as text
   *
   * Descarga un archivo del almacenamiento R2 y lo devuelve como texto.
   *
   * @param projectId - ID del proyecto
   * @param fileName - Nombre del archivo
   * @returns El contenido del archivo como texto o null si no existe
   */
  async downloadAsText(
    projectId: string,
    fileName: string
  ): Promise<string | null> {
    const object = await this.download(projectId, fileName);

    if (!object) {
      return null;
    }

    // Read the object as text using type assertion
    // R2Object body is a ReadableStream, we need to read it
    const text = await (object as any).text();
    return text;
  }

  /**
   * Download a file as JSON
   * 
   * Descarga un archivo del almacenamiento R2 y lo devuelve como JSON.
   * 
   * @param projectId - ID del proyecto
   * @param fileName - Nombre del archivo
   * @returns El contenido del archivo como JSON o null si no existe
   * @throws Error si el archivo no es un JSON válido
   */
  async downloadAsJson<T = any>(
    projectId: string,
    fileName: string
  ): Promise<T | null> {
    const text = await this.downloadAsText(projectId, fileName);

    if (!text) {
      return null;
    }

    try {
      return JSON.parse(text) as T;
    } catch (error) {
      throw new Error(`Failed to parse JSON from file ${fileName}: ${error}`);
    }
  }

  /**
   * Delete a file from R2
   * 
   * Elimina un archivo del almacenamiento R2.
   * 
   * @param projectId - ID del proyecto
   * @param fileName - Nombre del archivo
   * @returns true si se eliminó, false si no existía
   */
  async delete(
    projectId: string,
    fileName: string
  ): Promise<boolean> {
    const key = this.buildKey(projectId, fileName);

    await this.bucket.delete(key);

    // R2 delete doesn't return success status, so we assume success
    // To verify, we could check if the file exists before deletion
    return true;
  }

  /**
   * Delete all files for a project
   * 
   * Elimina todos los archivos de un proyecto del almacenamiento R2.
   * 
   * @param projectId - ID del proyecto
   * @returns Número de archivos eliminados
   */
  async deleteProjectFiles(projectId: string): Promise<number> {
    // List all files for the project
    const listed = await this.list(projectId);

    if (listed.length === 0) {
      return 0;
    }

    // Delete all files
    const keys = listed.map(item => item.key);
    await this.bucket.delete(keys);

    return keys.length;
  }

  /**
   * List files for a project
   *
   * Lista todos los archivos de un proyecto en el almacenamiento R2.
   *
   * @param projectId - ID del proyecto
   * @returns Lista de objetos R2Object con información de los archivos
   */
  async list(projectId: string): Promise<R2Object[]> {
    const prefix = this.buildProjectPrefix(projectId);

    const listed = await this.bucket.list({
      prefix,
    });

    return listed.objects;
  }

  /**
   * Check if a file exists
   * 
   * Verifica si existe un archivo en el almacenamiento R2.
   * 
   * @param projectId - ID del proyecto
   * @param fileName - Nombre del archivo
   * @returns true si existe, false en caso contrario
   */
  async exists(
    projectId: string,
    fileName: string
  ): Promise<boolean> {
    const key = this.buildKey(projectId, fileName);

    const object = await this.bucket.head(key);

    return object !== null;
  }

  /**
   * Get file metadata
   * 
   * Obtiene los metadatos de un archivo sin descargar su contenido.
   * 
   * @param projectId - ID del proyecto
   * @param fileName - Nombre del archivo
   * @returns El objeto R2Object con metadatos o null si no existe
   */
  async getMetadata(
    projectId: string,
    fileName: string
  ): Promise<R2Object | null> {
    const key = this.buildKey(projectId, fileName);

    return await this.bucket.head(key);
  }

  /**
   * Upload I-JSON for a project
   * 
   * Sube el I-JSON de un proyecto al almacenamiento R2.
   * 
   * @param projectId - ID del proyecto
   * @param iJson - Contenido del I-JSON (objeto o string)
   * @returns La clave del archivo en R2
   */
  async uploadIJson(
    projectId: string,
    iJson: Record<string, any> | string
  ): Promise<string> {
    const fileName = `${projectId}.json`;
    const data = typeof iJson === 'string' ? iJson : JSON.stringify(iJson);

    return this.upload(projectId, fileName, data, {
      contentType: 'application/json',
      customMetadata: {
        type: 'i-json',
        uploadedAt: new Date().toISOString(),
      },
    });
  }

  /**
   * Upload Markdown report for a project
   * 
   * Sube un informe Markdown de un proyecto al almacenamiento R2.
   * 
   * @param projectId - ID del proyecto
   * @param reportType - Tipo de informe (ej. resumen, datos_clave, etc.)
   * @param markdown - Contenido del Markdown
   * @returns La clave del archivo en R2
   */
  async uploadReport(
    projectId: string,
    reportType: string,
    markdown: string
  ): Promise<string> {
    const fileName = `${reportType}.md`;

    return this.upload(projectId, fileName, markdown, {
      contentType: 'text/markdown',
      customMetadata: {
        type: 'report',
        reportType,
        uploadedAt: new Date().toISOString(),
      },
    });
  }

  /**
   * Upload log file for a project
   * 
   * Sube un archivo de log para un proyecto al almacenamiento R2.
   * 
   * @param projectId - ID del proyecto
   * @param logContent - Contenido del log
   * @returns La clave del archivo en R2
   */
  async uploadLog(
    projectId: string,
    logContent: string
  ): Promise<string> {
    const fileName = 'log.txt';

    return this.upload(projectId, fileName, logContent, {
      contentType: 'text/plain',
      customMetadata: {
        type: 'log',
        uploadedAt: new Date().toISOString(),
      },
    });
  }

  /**
   * Append to log file
   * 
   * Añade contenido al archivo de log de un proyecto.
   * 
   * @param projectId - ID del proyecto
   * @param logEntry - Entrada de log a añadir
   */
  async appendToLog(projectId: string, logEntry: string): Promise<void> {
    const existingLog = await this.downloadAsText(projectId, 'log.txt');
    const timestamp = new Date().toISOString();
    const newContent = existingLog 
      ? `${existingLog}\n[${timestamp}] ${logEntry}`
      : `[${timestamp}] ${logEntry}`;

    await this.uploadLog(projectId, newContent);
  }

  /**
   * Build the full key for a file
   * 
   * Construye la clave completa para un archivo en R2.
   * 
   * @param projectId - ID del proyecto
   * @param fileName - Nombre del archivo
   * @returns La clave completa del archivo
   */
  private buildKey(projectId: string, fileName: string): string {
    return `${StorageService.BASE_PATH}/${projectId}/${fileName}`;
  }

  /**
   * Build the prefix for a project
   * 
   * Construye el prefijo para listar archivos de un proyecto.
   * 
   * @param projectId - ID del proyecto
   * @returns El prefijo del proyecto
   */
  private buildProjectPrefix(projectId: string): string {
    return `${StorageService.BASE_PATH}/${projectId}/`;
  }

  /**
   * Get public URL for a file
   * 
   * Construye una URL pública para acceder a un archivo en R2.
   * Nota: Esto requiere que el bucket esté configurado para acceso público.
   * 
   * @param projectId - ID del proyecto
   * @param fileName - Nombre del archivo
   * @param domain - Dominio público del bucket R2 (opcional)
   * @returns La URL pública del archivo
   */
  getPublicUrl(
    projectId: string,
    fileName: string,
    domain?: string
  ): string {
    const key = this.buildKey(projectId, fileName);
    
    if (domain) {
      return `https://${domain}/${key}`;
    }

    // Fallback: return key without domain (will need to be prepended with actual R2 domain)
    return `/${key}`;
  }
}
