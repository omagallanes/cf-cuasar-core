/**
 * Mocks for Cloudflare Workers
 *
 * Mocks para las APIs de Cloudflare Workers: D1, R2, KV.
 * Proporciona implementaciones simuladas para testing.
 */

import { vi } from 'vitest';

/**
 * Mock de D1Database
 */
export class MockD1Database {
  private data: Map<string, any[]> = new Map();

  /**
   * Crea una declaración preparada mock
   */
  prepare(query: string): any {
    return new MockD1PreparedStatement(query, this.data);
  }

  /**
   * Ejecuta un lote de declaraciones
   */
  async batch(statements: any[]): Promise<any[]> {
    return Promise.all(statements.map((stmt: any) => stmt.run()));
  }

  /**
   * Ejecuta una consulta SQL directamente
   */
  async exec(query: string): Promise<any> {
    // Implementación simplificada para tests
    return { success: true, meta: [], count: 0, duration: 0 };
  }

  /**
   * Limpia todos los datos mock
   */
  clear(): void {
    this.data.clear();
  }

  /**
   * Establece datos mock para una tabla
   */
  setData(tableName: string, data: any[]): void {
    this.data.set(tableName, data);
  }

  /**
   * Obtiene datos mock de una tabla
   */
  getData(tableName: string): any[] {
    return this.data.get(tableName) || [];
  }
}

/**
 * Mock de D1PreparedStatement
 */
class MockD1PreparedStatement {
  private query: string;
  private data: Map<string, any[]>;
  private boundParams: any[] = [];

  constructor(query: string, data: Map<string, any[]>) {
    this.query = query;
    this.data = data;
  }

  /**
   * Vincula parámetros a la declaración
   */
  bind(...params: any[]): any {
    this.boundParams = params;
    return this;
  }

  /**
   * Propiedad raw para compatibilidad
   */
  get raw(): any {
    return { sql: this.query, params: this.boundParams };
  }

  /**
   * Ejecuta la declaración y retorna el primer resultado
   */
  async first(): Promise<any | null> {
    const results = await this.all();
    return results.results[0] || undefined;
  }

  /**
   * Ejecuta la declaración y retorna todos los resultados
   */
  async all(): Promise<any> {
    // Simulación básica de parsing de SQL
    if (this.query.includes('SELECT')) {
      return this.handleSelect();
    } else if (this.query.includes('INSERT')) {
      return this.handleInsert();
    } else if (this.query.includes('UPDATE')) {
      return this.handleUpdate();
    } else if (this.query.includes('DELETE')) {
      return this.handleDelete();
    }

    return { success: false, meta: [], results: [] };
  }

  /**
   * Ejecuta la declaración y retorna metadatos
   */
  async run(): Promise<any> {
    const result = await this.all();
    return {
      success: true,
      meta: result.meta || { changes: 0 },
      duration: 0,
    };
  }

  /**
   * Maneja consultas SELECT
   */
  private async handleSelect(): Promise<any> {
    // Extraer nombre de tabla de la consulta (simplificado)
    const tableMatch = this.query.match(/FROM\s+(\w+)/);
    if (!tableMatch) {
      return { success: false, meta: [], results: [] };
    }

    const tableName = tableMatch[1];
    let data = this.data.get(tableName) || [];

    // Manejar cláusula WHERE
    const whereMatch = this.query.match(/WHERE\s+(.+?)(?:\s+ORDER\s+BY|\s+LIMIT|$)/i);
    if (whereMatch) {
      const whereClause = whereMatch[1];
      
      // Manejar condiciones simples como "column = ?" y "column IN (?, ?)"
      const conditions = whereClause.split(/\s+AND\s+/i);
      
      // Aplicar todos los filtros WHERE a la vez
      let filteredData = data;
      let paramIndex = 0;
      
      for (let i = 0; i < conditions.length; i++) {
        const condition = conditions[i].trim();
        const columnMatch = condition.match(/(\w+)\s*(?:=|IN)\s*\(?/i);
        
        if (columnMatch) {
          const column = columnMatch[1];
          
          // Manejar cláusula IN
          const inMatch = condition.match(/IN\s*\(([^)]+)\)/i);
          if (inMatch) {
            const values = inMatch[1].split(',').map(v => v.trim().replace(/^'(.*)'$/, '$1'));
            // Los valores en la cláusula IN pueden ser literales o parámetros (?)
            // Si todos son literales, usarlos directamente; si hay ?, usar boundParams
            const hasParams = values.some(v => v === '?');
            if (hasParams) {
              // Usar boundParams para los valores de parámetros
              const paramValues = this.boundParams.slice(paramIndex, paramIndex + values.length);
              filteredData = filteredData.filter((row: any) => paramValues.includes(row[column]));
              paramIndex += values.length;
            } else {
              // Usar los valores literales directamente
              filteredData = filteredData.filter((row: any) => values.includes(row[column]));
            }
          } else if (paramIndex < this.boundParams.length) {
            // Manejar cláusula = (solo si hay parámetros disponibles)
            const value = this.boundParams[paramIndex];
            filteredData = filteredData.filter((row: any) => row[column] === value);
            paramIndex++;
          }
        }
      }
      
      data = filteredData;
    }

    // Manejar funciones de agregación como COUNT(*)
    const countMatch = this.query.match(/SELECT\s+COUNT\(\*\)\s+as\s+(\w+)/i);
    if (countMatch) {
      const alias = countMatch[1];
      return {
        success: true,
        meta: [],
        results: [{ [alias]: data.length }]
      };
    }

    // Manejar cláusula ORDER BY
    const orderByMatch = this.query.match(/ORDER\s+BY\s+(\w+)(?:\s+(ASC|DESC))?/i);
    if (orderByMatch) {
      const column = orderByMatch[1];
      const direction = orderByMatch[2]?.toUpperCase() || 'ASC';
      
      data = data.sort((a: any, b: any) => {
        const aVal = a[column];
        const bVal = b[column];
        
        if (aVal === bVal) return 0;
        if (direction === 'ASC') {
          return aVal < bVal ? -1 : 1;
        } else {
          return aVal > bVal ? -1 : 1;
        }
      });
    }

    // Manejar cláusula LIMIT y OFFSET
    const limitMatch = this.query.match(/LIMIT\s+(\d+|\?)/i);
    const offsetMatch = this.query.match(/OFFSET\s+(\d+|\?)/i);
    
    if (limitMatch) {
      const limitValue = limitMatch[1];
      if (limitValue === '?') {
        // LIMIT es un parámetro
        const limitParamIndex = this.query.match(/LIMIT\s+\?/i) ?
          (this.query.match(/OFFSET\s+\?/i) ? this.boundParams.length - 2 : this.boundParams.length - 1) : -1;
        if (limitParamIndex >= 0) {
          const limit = this.boundParams[limitParamIndex];
          if (typeof limit === 'number' && data.length > limit) {
            data = data.slice(0, limit);
          }
        }
      } else {
        // LIMIT es un número literal
        const limit = parseInt(limitValue);
        if (data.length > limit) {
          data = data.slice(0, limit);
        }
      }
    }
    
    if (offsetMatch) {
      const offsetValue = offsetMatch[1];
      if (offsetValue === '?') {
        // OFFSET es un parámetro
        const offsetParamIndex = this.query.match(/OFFSET\s+\?/i) ?
          this.boundParams.length - 1 : -1;
        if (offsetParamIndex >= 0) {
          const offset = this.boundParams[offsetParamIndex];
          if (typeof offset === 'number' && offset > 0) {
            data = data.slice(offset);
          }
        }
      } else {
        // OFFSET es un número literal
        const offset = parseInt(offsetValue);
        if (offset > 0) {
          data = data.slice(offset);
        }
      }
    }

    return { success: true, meta: [], results: data };
  }

  /**
   * Maneja consultas INSERT
   */
  private async handleInsert(): Promise<any> {
    const tableMatch = this.query.match(/INSERT\s+INTO\s+(\w+)/);
    if (!tableMatch) {
      return { success: false, meta: [], results: [] };
    }

    const tableName = tableMatch[1];
    const currentData = this.data.get(tableName) || [];
    
    // Crear nuevo registro con los parámetros vinculados
    const newRecord: any = {};
    const columns = this.query.match(/\(([^)]+)\)/)?.[1]?.split(',').map(c => c.trim()) || [];
    
    columns.forEach((col, index) => {
      if (index < this.boundParams.length) {
        newRecord[col] = this.boundParams[index];
      }
    });

    // Asegurar que el registro tenga un ID si no se proporcionó
    if (!newRecord.id && columns.includes('id')) {
      newRecord.id = crypto.randomUUID();
    }

    this.data.set(tableName, [...currentData, newRecord]);

    return { 
      success: true, 
      meta: [], 
      results: [newRecord],
    };
  }

  /**
   * Maneja consultas UPDATE
   */
  private async handleUpdate(): Promise<any> {
    const tableMatch = this.query.match(/UPDATE\s+(\w+)/);
    if (!tableMatch) {
      return { success: false, meta: [], results: [] };
    }

    const tableName = tableMatch[1];
    const currentData = this.data.get(tableName) || [];

    // Extraer columnas a actualizar
    const setMatch = this.query.match(/SET\s+([^WHERE]+)/);
    if (!setMatch) {
      return { success: false, meta: [], results: [] };
    }

    const setClause = setMatch[1];
    const columns = setClause.split(',').map(c => c.trim().split('=')[0].trim());

    // Encontrar registro por ID
    const whereMatch = this.query.match(/WHERE\s+id\s*=\s*\?/);
    if (whereMatch && this.boundParams.length > 0) {
      const id = this.boundParams[columns.length]; // El último parámetro es el ID
      const index = currentData.findIndex((row: any) => row.id === id);

      if (index !== -1) {
        const updatedRecord = { ...currentData[index] };
        columns.forEach((col, i) => {
          updatedRecord[col] = this.boundParams[i];
        });

        const newData = [...currentData];
        newData[index] = updatedRecord;
        this.data.set(tableName, newData);

        return { success: true, meta: [], results: [updatedRecord] };
      }
    }

    return { success: false, meta: [], results: [] };
  }

  /**
   * Maneja consultas DELETE
   */
  private async handleDelete(): Promise<any> {
    const tableMatch = this.query.match(/DELETE\s+FROM\s+(\w+)/);
    if (!tableMatch) {
      return { success: false, meta: [], results: [] };
    }

    const tableName = tableMatch[1];
    const currentData = this.data.get(tableName) || [];

    // Filtrar por ID
    const whereMatch = this.query.match(/WHERE\s+id\s*=\s*\?/);
    if (whereMatch && this.boundParams.length > 0) {
      const id = this.boundParams[0];
      const beforeLength = currentData.length;
      const filtered = currentData.filter((row: any) => row.id !== id);
      const deletedCount = beforeLength - filtered.length;
      
      this.data.set(tableName, filtered);

      return {
        success: true,
        meta: {
          rows_written: deletedCount,
          changes: deletedCount
        },
        results: []
      };
    }

    return { success: false, meta: [], results: [] };
  }
}

/**
 * Mock de R2Bucket
 */
export class MockR2Bucket {
  private data: Map<string, { data: any; dataType: 'string' | 'object' | 'arrayBuffer'; metadata?: any }> = new Map();

  /**
   * Obtiene un objeto del bucket
   */
  async get(key: string): Promise<any> {
    const item = this.data.get(key);
    if (!item) {
      return null;
    }

    // Convertir datos según el tipo original
    let textContent: string;
    if (item.dataType === 'string') {
      textContent = item.data;
    } else if (item.dataType === 'object') {
      textContent = JSON.stringify(item.data);
    } else {
      textContent = JSON.stringify(item.data);
    }

    return {
      key,
      size: textContent.length,
      uploaded: new Date(),
      httpMetadata: {},
      customMetadata: item.metadata,
      writeHttpMetadata: vi.fn(),
      range: undefined,
      body: new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(textContent));
          controller.close();
        },
      }),
      text: async () => textContent,
      json: async () => {
        if (item.dataType === 'object') {
          return item.data;
        }
        return JSON.parse(textContent);
      },
      arrayBuffer: async () => new TextEncoder().encode(textContent).buffer,
    };
  }

  /**
   * Pone un objeto en el bucket
   */
  async put(key: string, value: any, options?: any): Promise<any> {
    let dataType: 'string' | 'object' | 'arrayBuffer';
    if (typeof value === 'string') {
      dataType = 'string';
    } else if (value instanceof ArrayBuffer) {
      dataType = 'arrayBuffer';
    } else {
      dataType = 'object';
    }
    
    this.data.set(key, {
      data: value,
      dataType,
      metadata: options?.customMetadata,
    });
    return null;
  }

  /**
   * Elimina un objeto del bucket
   */
  async delete(keys: string | string[]): Promise<void> {
    const keysToDelete = Array.isArray(keys) ? keys : [keys];
    keysToDelete.forEach(key => this.data.delete(key));
  }

  /**
   * Obtiene metadatos de un objeto sin descargar su contenido
   */
  async head(key: string): Promise<any> {
    const item = this.data.get(key);
    if (!item) {
      return null;
    }

    // Calcular tamaño según el tipo de dato
    let size: number;
    if (item.dataType === 'string') {
      size = item.data.length;
    } else if (item.dataType === 'arrayBuffer') {
      size = item.data.byteLength;
    } else {
      size = JSON.stringify(item.data).length;
    }

    return {
      key,
      size,
      uploaded: new Date(),
      httpMetadata: {},
      customMetadata: item.metadata,
    };
  }

  /**
   * Lista objetos en el bucket
   */
  async list(options?: any): Promise<any> {
    const prefix = options?.prefix || '';
    const limit = options?.limit || 100;
    const cursor = options?.cursor;

    const objects: any[] = [];

    for (const [key, item] of this.data.entries()) {
      if (objects.length >= limit) break;
      if (key.startsWith(prefix)) {
        // Calcular tamaño y contenido según el tipo de dato
        let textContent: string;
        let size: number;
        
        if (item.dataType === 'string') {
          textContent = item.data;
          size = item.data.length;
        } else if (item.dataType === 'arrayBuffer') {
          textContent = new TextDecoder().decode(new Uint8Array(item.data));
          size = item.data.byteLength;
        } else {
          textContent = JSON.stringify(item.data);
          size = textContent.length;
        }

        objects.push({
          key,
          size,
          uploaded: new Date(),
          httpMetadata: {},
          customMetadata: item.metadata,
          writeHttpMetadata: vi.fn(),
          range: undefined,
          body: new ReadableStream({
            start(controller) {
              controller.enqueue(new TextEncoder().encode(textContent));
              controller.close();
            },
          }),
          text: async () => textContent,
          json: async () => {
            if (item.dataType === 'object') {
              return item.data;
            }
            return JSON.parse(textContent);
          },
          arrayBuffer: async () => new TextEncoder().encode(textContent).buffer,
        });
      }
    }

    return {
      objects,
      truncated: false,
      delimitedPrefixes: [],
    };
  }

  /**
   * Limpia todos los datos mock
   */
  clear(): void {
    this.data.clear();
  }

  /**
   * Establece datos mock para una clave
   */
  setData(key: string, data: any, metadata?: any): void {
    let dataType: 'string' | 'object' | 'arrayBuffer';
    if (typeof data === 'string') {
      dataType = 'string';
    } else if (data instanceof ArrayBuffer) {
      dataType = 'arrayBuffer';
    } else {
      dataType = 'object';
    }
    
    this.data.set(key, { data, dataType, metadata });
  }
}

/**
 * Mock de KVNamespace
 */
export class MockKVNamespace {
  private data: Map<string, { value: string; expiration?: number }> = new Map();

  /**
   * Obtiene un valor del KV
   */
  async get(key: string, options?: any): Promise<string | null> {
    const item = this.data.get(key);
    if (!item) {
      return null;
    }

    // Verificar expiración
    if (item.expiration && Date.now() > item.expiration) {
      this.data.delete(key);
      return null;
    }

    // Si se solicita como JSON, parsear
    if (options?.type === 'json') {
      return JSON.parse(item.value);
    }

    return item.value;
  }

  /**
   * Obtiene un valor con metadatos
   */
  async getWithMetadata(key: string, options?: any): Promise<any> {
    const value = await this.get(key, options);
    if (value === null) {
      return null;
    }
    return {
      value,
      metadata: undefined,
    };
  }

  /**
   * Pone un valor en el KV
   */
  async put(key: string, value: string | ArrayBuffer | ReadableStream, options?: any): Promise<void> {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    let expiration: number | undefined;

    if (options?.expirationTtl) {
      expiration = Date.now() + (options.expirationTtl * 1000);
    }

    this.data.set(key, { value: stringValue, expiration });
  }

  /**
   * Elimina un valor del KV
   */
  async delete(key: string): Promise<void> {
    this.data.delete(key);
  }

  /**
   * Lista claves en el KV
   */
  async list(options?: any): Promise<any> {
    const prefix = options?.prefix || '';
    const limit = options?.limit || 100;
    const cursor = options?.cursor;

    const keys: any[] = [];
    let count = 0;

    for (const [key, item] of this.data.entries()) {
      if (count >= limit) break;
      if (key.startsWith(prefix)) {
        // Verificar expiración
        if (item.expiration && Date.now() > item.expiration) {
          this.data.delete(key);
          continue;
        }

        keys.push({
          name: key,
          expiration: item.expiration,
          metadata: undefined,
        });
        count++;
      }
    }

    return {
      keys,
      list_complete: true,
      cursor: '',
    };
  }

  /**
   * Limpia todos los datos mock
   */
  clear(): void {
    this.data.clear();
  }

  /**
   * Establece datos mock para una clave
   */
  setData(key: string, value: string, expirationTtl?: number): void {
    let expiration: number | undefined;
    if (expirationTtl) {
      expiration = Date.now() + (expirationTtl * 1000);
    }
    this.data.set(key, { value, expiration });
  }
}

/**
 * Crea un entorno mock completo para Cloudflare Workers
 */
export function createMockEnv(): any {
  return {
    CF_B_KV_SECRETS: new MockKVNamespace(),
    CF_B_DB_INMO: new MockD1Database(),
    CF_B_R2_INMO: new MockR2Bucket(),
  };
}
