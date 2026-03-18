/**
 * Secret Service - VaaIA API Services
 * 
 * Servicio para recuperación de secrets desde KV.
 * Proporciona operaciones para obtener secrets de forma segura.
 * 
 * @module services/secret.service
 */

import type { Env } from './types';
import { logger } from '../utils/logger';

/**
 * SecretService Class
 * 
 * Servicio para gestión de secrets en el almacenamiento KV de Cloudflare.
 * Implementa operaciones para obtener secrets de forma segura.
 * 
 * R4: Accesores tipados para bindings (centralizar validación de variables requeridas)
 * R3: Gestión de secrets y credenciales
 */
export class SecretService {
  private kv: KVNamespace;

  /**
   * Constructor - Inicializa el servicio con el binding de KV
   * 
   * @param env - Environment bindings
   * @throws Error si el binding CF_B_KV_SECRETS no está disponible
   */
  constructor(env: Env) {
    // R4: Validación de binding requerido
    if (!env.CF_B_KV_SECRETS) {
      throw new Error('KV binding CF_B_KV_SECRETS is required');
    }
    this.kv = env.CF_B_KV_SECRETS;
  }

  /**
   * Get a secret by key
   * 
   * Obtiene un secret del almacenamiento KV por su clave.
   * 
   * @param key - Clave del secret
   * @returns El valor del secret o null si no existe
   */
  async getSecret(key: string): Promise<string | null> {
    logger.debug('Getting secret from KV', { key });
    
    const value = await this.kv.get(key, 'text');
    
    logger.debug('Secret retrieved from KV', { key, exists: !!value });
    return value;
  }

  /**
   * Get a secret and parse as JSON
   * 
   * Obtiene un secret del almacenamiento KV y lo parsea como JSON.
   * 
   * @param key - Clave del secret
   * @returns El valor del secret como JSON o null si no existe
   * @throws Error si el secret no es un JSON válido
   */
  async getSecretAsJson<T = any>(key: string): Promise<T | null> {
    const value = await this.getSecret(key);

    if (!value) {
      return null;
    }

    try {
      return JSON.parse(value) as T;
    } catch (error) {
      throw new Error(`Failed to parse JSON from secret ${key}: ${error}`);
    }
  }

  /**
   * Get OpenAI API Key
   * 
   * Obtiene la clave de API de OpenAI desde KV.
   * 
   * @returns La clave de API de OpenAI o null si no existe
   */
  async getOpenAIApiKey(): Promise<string | null> {
    logger.debug('Getting OpenAI API key');
    return this.getSecret('OPENAI_API_KEY');
  }

  /**
   * Check if a secret exists
   * 
   * Verifica si existe un secret en el almacenamiento KV.
   * 
   * @param key - Clave del secret
   * @returns true si existe, false en caso contrario
   */
  async exists(key: string): Promise<boolean> {
    logger.debug('Checking if secret exists in KV', { key });
    
    const value = await this.kv.get(key, 'text');
    const exists = value !== null;
    
    logger.debug('Secret existence checked', { key, exists });
    return exists;
  }

  /**
   * Get multiple secrets by prefix
   * 
   * Obtiene múltiples secrets del almacenamiento KV que empiezan con un prefijo.
   * 
   * @param prefix - Prefijo de las claves
   * @returns Objeto con los secrets encontrados
   */
  async getSecretsByPrefix(prefix: string): Promise<Record<string, string>> {
    const secrets: Record<string, string> = {};

    const listed = await this.kv.list({ prefix });

    for (const item of listed.keys) {
      const value = await this.kv.get(item.name, 'text');
      if (value !== null) {
        secrets[item.name] = value;
      }
    }

    return secrets;
  }

  /**
   * Get secret with metadata
   * 
   * Obtiene un secret del almacenamiento KV junto con sus metadatos.
   * 
   * @param key - Clave del secret
   * @returns El valor del secret con metadatos o null si no existe
   */
  async getSecretWithMetadata(key: string): Promise<{ value: string; metadata?: Record<string, any> } | null> {
    const result = await this.kv.getWithMetadata(key, 'text');

    if (result.value === null) {
      return null;
    }

    return {
      value: result.value,
      metadata: result.metadata as Record<string, any> | undefined,
    };
  }

  /**
   * Validate required secrets
   * 
   * Valifica que los secrets requeridos existan en el almacenamiento KV.
   * 
   * @param requiredKeys - Lista de claves de secrets requeridos
   * @returns Objeto con los secrets encontrados y los faltantes
   */
  async validateRequiredSecrets(requiredKeys: string[]): Promise<{
    found: Record<string, string>;
    missing: string[];
  }> {
    const found: Record<string, string> = {};
    const missing: string[] = [];

    for (const key of requiredKeys) {
      const value = await this.getSecret(key);
      if (value !== null) {
        found[key] = value;
      } else {
        missing.push(key);
      }
    }

    return { found, missing };
  }

  /**
   * Get all secrets (use with caution)
   * 
   * Obtiene todos los secrets del almacenamiento KV.
   * ADVERTENCIA: Usar con precaución, esto puede exponer secrets sensibles.
   * 
   * @returns Objeto con todos los secrets
   */
  async getAllSecrets(): Promise<Record<string, string>> {
    const secrets: Record<string, string> = {};

    const listed = await this.kv.list();

    for (const item of listed.keys) {
      const value = await this.kv.get(item.name, 'text');
      if (value !== null) {
        secrets[item.name] = value;
      }
    }

    return secrets;
  }

  /**
   * Get secret or throw error
   * 
   * Obtiene un secret del almacenamiento KV o lanza un error si no existe.
   * 
   * @param key - Clave del secret
   * @returns El valor del secret
   * @throws Error si el secret no existe
   */
  async getSecretOrThrow(key: string): Promise<string> {
    const value = await this.getSecret(key);

    if (value === null) {
      throw new Error(`Secret ${key} not found`);
    }

    return value;
  }

  /**
   * Get OpenAI API Key or throw error
   * 
   * Obtiene la clave de API de OpenAI desde KV o lanza un error si no existe.
   * 
   * @returns La clave de API de OpenAI
   * @throws Error si la clave no existe
   */
  async getOpenAIApiKeyOrThrow(): Promise<string> {
    const apiKey = await this.getOpenAIApiKey();

    if (apiKey === null) {
      throw new Error('OPENAI_API_KEY not found in KV');
    }

    return apiKey;
  }
}
