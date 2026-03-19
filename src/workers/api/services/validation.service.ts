/**
 * Validation Service - VaaIA API Services
 * 
 * Servicio para validación de I-JSON.
 * Proporciona operaciones de validación de esquema para I-JSON.
 * 
 * @module services/validation.service
 */

import type {
  IJsonSchema,
  ValidationResult,
  ValidationErrorDetail
} from './types';
import { logger } from '../utils/logger';

/**
 * ValidationService Class
 * 
 * Servicio para validación de I-JSON según el esquema definido.
 * Implementa validaciones de estructura y contenido para I-JSON.
 * 
 * RB-02: Validación de I-JSON
 */
export class ValidationService {
  /**
   * Required fields for I-JSON validation
   * Campos obligatorios según la especificación del proyecto.
   */
  private static readonly REQUIRED_FIELDS: (keyof IJsonSchema)[] = [
    'titulo_anuncio',
    'descripcion',
    'tipo_operacion',
    'tipo_inmueble',
    'precio',
    'ciudad'
  ];

  /**
   * Valid values for tipo_operacion
   * Valores válidos para el tipo de operación.
   */
  private static readonly VALID_TIPO_OPERACION = ['venta', 'alquiler', 'traspaso'];

  /**
   * Valid city for the project scope
   * Ciudad válida para el alcance del proyecto.
   */
  private static readonly VALID_CIUDAD = 'València';

  /**
   * Validate I-JSON structure
   * 
   * Valida que el I-JSON cumpla con el esquema definido.
   * 
   * @param iJson - Objeto I-JSON a validar
   * @returns Resultado de la validación con detalles de errores si los hay
   */
  validateIJson(iJson: Record<string, any>): ValidationResult {
    const errors: ValidationErrorDetail[] = [];

    // Validate that iJson is an object
    if (iJson === null || iJson === undefined || typeof iJson !== 'object') {
      return {
        valid: false,
        errors: [{
          campo: 'i_json',
          mensaje: 'El I-JSON debe ser un objeto válido'
        }]
      };
    }

    logger.debug('Validating I-JSON', { fields: Object.keys(iJson) });

    // Validate required fields
    for (const field of ValidationService.REQUIRED_FIELDS) {
      if (!iJson[field] || (typeof iJson[field] === 'string' && iJson[field].trim() === '')) {
        errors.push({
          campo: field,
          mensaje: `El campo ${field} es obligatorio en el I-JSON`
        });
      }
    }

    // Validate tipo_operacion values
    if (iJson.tipo_operacion && !ValidationService.VALID_TIPO_OPERACION.includes(iJson.tipo_operacion)) {
      errors.push({
        campo: 'tipo_operacion',
        mensaje: `tipo_operacion debe ser uno de: ${ValidationService.VALID_TIPO_OPERACION.join(', ')}`
      });
    }

    // Validate precio is a valid number
    if (iJson.precio) {
      const precio = parseFloat(iJson.precio);
      if (isNaN(precio) || precio <= 0) {
        errors.push({
          campo: 'precio',
          mensaje: 'precio debe ser un número válido mayor que 0'
        });
      }
    }

    // Validate ciudad
    if (iJson.ciudad && iJson.ciudad !== ValidationService.VALID_CIUDAD) {
      errors.push({
        campo: 'ciudad',
        mensaje: `ciudad debe ser ${ValidationService.VALID_CIUDAD}`
      });
    }

    // Validate superficie_construida_m2 if present
    if (iJson.superficie_construida_m2) {
      const superficie = parseFloat(iJson.superficie_construida_m2);
      if (isNaN(superficie) || superficie <= 0) {
        errors.push({
          campo: 'superficie_construida_m2',
          mensaje: 'superficie_construida_m2 debe ser un número válido mayor que 0'
        });
      }
    }

    // Validate URL format if present
    if (iJson.url_fuente) {
      try {
        new URL(iJson.url_fuente);
      } catch {
        errors.push({
          campo: 'url_fuente',
          mensaje: 'url_fuente debe ser una URL válida'
        });
      }
    }

    const result = {
      valid: errors.length === 0,
      errors
    };
    
    logger.debug('I-JSON validation completed', { valid: result.valid, errorCount: errors.length });
    return result;
  }

  /**
   * Validate I-JSON and throw error if invalid
   * 
   * Valida que el I-JSON cumpla con el esquema definido y lanza un error si no es válido.
   * 
   * @param iJson - Objeto I-JSON a validar
   * @throws Error si el I-JSON no es válido
   */
  validateIJsonOrThrow(iJson: Record<string, any>): void {
    logger.debug('Validating I-JSON or throw', { fields: Object.keys(iJson) });
    
    const result = this.validateIJson(iJson);

    if (!result.valid) {
      const errorMessages = result.errors.map(e => `${e.campo}: ${e.mensaje}`).join('; ');
      throw new Error(`I-JSON validation failed: ${errorMessages}`);
    }
  }

  /**
   * Validate project state
   * 
   * Valida que el estado del proyecto sea válido.
   * 
   * @param estado - Estado del proyecto
   * @returns true si es válido, false en caso contrario
   */
  validateProjectState(estado: string): boolean {
    const validStates = ['creado', 'procesando_analisis', 'analisis_con_error', 'analisis_finalizado'];
    return validStates.includes(estado);
  }

  /**
   * Validate execution state
   * 
   * Valida que el estado de la ejecución sea válido.
   * 
   * @param estado - Estado de la ejecución
   * @returns true si es válido, false en caso contrario
   */
  validateExecutionState(estado: string): boolean {
    const validStates = ['iniciada', 'en_ejecucion', 'finalizada_correctamente', 'finalizada_con_error'];
    return validStates.includes(estado);
  }

  /**
   * Validate step state
   * 
   * Valida que el estado del paso sea válido.
   * 
   * @param estado - Estado del paso
   * @returns true si es válido, false en caso contrario
   */
  validateStepState(estado: string): boolean {
    const validStates = ['pendiente', 'en_ejecucion', 'correcto', 'error'];
    return validStates.includes(estado);
  }

  /**
   * Validate step type
   * 
   * Valida que el tipo de paso sea válido.
   * 
   * @param tipoPaso - Tipo de paso
   * @returns true si es válido, false en caso contrario
   */
  validateStepType(tipoPaso: string): boolean {
    const validTypes = [
      'resumen',
      'datos_clave',
      'activo_fisico',
      'activo_estrategico',
      'activo_financiero',
      'activo_regulado',
      'lectura_inversor',
      'lectura_emprendedor',
      'lectura_propietario'
    ];
    return validTypes.includes(tipoPaso);
  }

  /**
   * Validate UUID format
   * 
   * Valida que una cadena tenga el formato de UUID v4.
   * 
   * @param uuid - Cadena a validar
   * @returns true si es un UUID válido, false en caso contrario
   */
  validateUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  /**
   * Validate ISO 8601 date format
   * 
   * Valida que una cadena tenga el formato de fecha ISO 8601.
   * 
   * @param date - Cadena a validar
   * @returns true si es una fecha válida, false en caso contrario
   */
  validateISODate(date: string): boolean {
    if (!date) return false;
    const parsed = new Date(date);
    return !isNaN(parsed.getTime());
  }

  /**
   * Validate email format
   * 
   * Valida que una cadena tenga el formato de email.
   * 
   * @param email - Cadena a validar
   * @returns true si es un email válido, false en caso contrario
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Sanitize string input
   * 
   * Limpia una cadena de entrada para prevenir inyección de código.
   * 
   * @param input - Cadena a limpiar
   * @returns Cadena limpia
   */
  sanitizeString(input: string): string {
    if (typeof input !== 'string') {
      return '';
    }
    return input.trim().replace(/[<>]/g, '');
  }

  /**
   * Validate pagination parameters
   * 
   * Valida que los parámetros de paginación sean válidos.
   * 
   * @param page - Número de página
   * @param limit - Límite de resultados por página
   * @returns Objeto con parámetros validados y valores por defecto
   */
  validatePagination(page?: number, limit?: number): { page: number; limit: number } {
    const validatedPage = Math.max(1, Math.floor(page ?? 1));
    const validatedLimit = Math.max(1, Math.min(100, Math.floor(limit ?? 20)));

    return {
      page: validatedPage,
      limit: validatedLimit
    };
  }

  /**
   * Validate file name
   * 
   * Valida que un nombre de archivo sea seguro.
   * 
   * @param fileName - Nombre de archivo a validar
   * @returns true si es seguro, false en caso contrario
   */
  validateFileName(fileName: string): boolean {
    // Prevent path traversal and ensure safe file names
    const safeFileName = /^[a-zA-Z0-9._-]+$/;
    return safeFileName.test(fileName) && 
           !fileName.startsWith('.') &&
           !fileName.includes('..') &&
           fileName.length > 0 &&
           fileName.length <= 255;
  }

  /**
   * Validate markdown content
   * 
   * Valida que el contenido sea Markdown válido.
   * 
   * @param content - Contenido a validar
   * @returns true si es Markdown válido, false en caso contrario
   */
  validateMarkdown(content: string): boolean {
    if (typeof content !== 'string' || content.trim().length === 0) {
      return false;
    }
    // Basic validation: ensure it's not empty and has some markdown-like content
    return content.length > 0;
  }
}
