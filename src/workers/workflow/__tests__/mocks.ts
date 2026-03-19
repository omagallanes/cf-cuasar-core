/**
 * Mocks for Workflow Worker
 *
 * Mocks para las APIs de Cloudflare Workers: D1, R2, KV, Workflows y OpenAI.
 * Proporciona implementaciones simuladas para testing.
 */

import { vi } from 'vitest';
import { StepType } from '../services/workflow.service';

/**
 * Mock de D1Database
 */
export class MockD1Database {
  private data: Map<string, any[]> = new Map();
  private executionIdCounter = 1;
  private stepIdCounter = 1;

  /**
   * Crea una declaración preparada mock
   */
  prepare(query: string): any {
    return new MockD1PreparedStatement(query, this.data, this);
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
    return { success: true, meta: [], count: 0, duration: 0 };
  }

  /**
   * Limpia todos los datos mock
   */
  clear(): void {
    this.data.clear();
    this.executionIdCounter = 1;
    this.stepIdCounter = 1;
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

  /**
   * Genera un ID de ejecución único
   */
  generateExecutionId(): string {
    return `exec-${this.executionIdCounter++}`;
  }

  /**
   * Genera un ID de paso único
   */
  generateStepId(): string {
    return `step-${this.stepIdCounter++}`;
  }
}

/**
 * Mock de D1PreparedStatement
 */
class MockD1PreparedStatement {
  private query: string;
  private data: Map<string, any[]>;
  private db: MockD1Database;
  private boundParams: any[] = [];

  constructor(query: string, data: Map<string, any[]>, db: MockD1Database) {
    this.query = query;
    this.data = data;
    this.db = db;
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
    return results.results[0] || null;
  }

  /**
   * Ejecuta la declaración y retorna todos los resultados
   */
  async all(): Promise<any> {
    const query = this.query.toLowerCase();
    
    // INSERT INTO ani_ejecuciones
    if (query.includes('insert into ani_ejecuciones')) {
      const id = this.boundParams[0];
      const projectId = this.boundParams[1];
      const estado = this.boundParams[2];
      const fechaInicio = this.boundParams[3];
      
      const executions = this.data.get('ani_ejecuciones') || [];
      executions.push({ id, proyecto_id: projectId, estado, fecha_inicio: fechaInicio });
      this.data.set('ani_ejecuciones', executions);
      
      return { results: [], success: true, meta: { changes: 1 } };
    }
    
    // INSERT INTO ani_pasos
    if (query.includes('insert into ani_pasos')) {
      const id = this.boundParams[0];
      const ejecucionId = this.boundParams[1];
      const tipoPaso = this.boundParams[2];
      const orden = this.boundParams[3];
      const estado = this.boundParams[4];
      const fechaInicio = this.boundParams[5];
      
      const steps = this.data.get('ani_pasos') || [];
      steps.push({ id, ejecucion_id: ejecucionId, tipo_paso: tipoPaso, orden, estado, fecha_inicio: fechaInicio });
      this.data.set('ani_pasos', steps);
      
      return { results: [], success: true, meta: { changes: 1 } };
    }
    
    // UPDATE ani_ejecuciones
    if (query.includes('update ani_ejecuciones')) {
      const executions = this.data.get('ani_ejecuciones') || [];
      const executionId = this.boundParams[this.boundParams.length - 1];
      
      const execution = executions.find((e: any) => e.id === executionId);
      if (execution) {
        execution.estado = this.boundParams[0];
        if (this.boundParams[1]) {
          execution.fecha_fin = this.boundParams[1];
        }
        if (this.boundParams.length > 3 && this.boundParams[2]) {
          execution.error_mensaje = this.boundParams[2];
        }
      }
      
      return { results: [], success: true, meta: { changes: 1 } };
    }
    
    // UPDATE ani_pasos
    if (query.includes('update ani_pasos')) {
      const steps = this.data.get('ani_pasos') || [];
      const stepId = this.boundParams[this.boundParams.length - 1];
      
      const step = steps.find((s: any) => s.id === stepId);
      if (step) {
        step.estado = this.boundParams[0];
        if (this.boundParams[1]) {
          step.fecha_fin = this.boundParams[1];
        }
        if (this.boundParams.length > 4 && this.boundParams[2]) {
          step.error_mensaje = this.boundParams[2];
        }
        if (this.boundParams.length > 5 && this.boundParams[3]) {
          step.ruta_archivo_r2 = this.boundParams[3];
        }
      }
      
      return { results: [], success: true, meta: { changes: 1 } };
    }
    
    // UPDATE ani_proyectos
    if (query.includes('update ani_proyectos')) {
      const projects = this.data.get('ani_proyectos') || [];
      const projectId = this.boundParams[this.boundParams.length - 1];
      
      const project = projects.find((p: any) => p.id === projectId);
      if (project) {
        project.estado = this.boundParams[0];
        project.fecha_actualizacion = this.boundParams[1];
        
        // Verificar si hay fechas de análisis para actualizar
        const hasFechaAnalisisInicio = query.includes('fecha_analisis_inicio');
        const hasFechaAnalisisFin = query.includes('fecha_analisis_fin');
        
        if (hasFechaAnalisisInicio && hasFechaAnalisisFin) {
          // Ambas fechas están en la consulta
          if (this.boundParams[2]) {
            project.fecha_analisis_inicio = this.boundParams[2];
          }
          if (this.boundParams[3]) {
            project.fecha_analisis_fin = this.boundParams[3];
          }
        } else if (hasFechaAnalisisInicio) {
          // Solo fecha_analisis_inicio
          if (this.boundParams[2]) {
            project.fecha_analisis_inicio = this.boundParams[2];
          }
        } else if (hasFechaAnalisisFin) {
          // Solo fecha_analisis_fin
          if (this.boundParams[2]) {
            project.fecha_analisis_fin = this.boundParams[2];
          }
        }
      }
      
      return { results: [], success: true, meta: { changes: 1 } };
    }
    
    // SELECT FROM ani_pasos
    if (query.includes('select') && query.includes('ani_pasos')) {
      const steps = this.data.get('ani_pasos') || [];
      
      if (query.includes('ejecucion_id = ?') && query.includes('orden = ?')) {
        const ejecucionId = this.boundParams[0];
        const orden = this.boundParams[1];
        const step = steps.find((s: any) => s.ejecucion_id === ejecucionId && s.orden === orden);
        return { results: step ? [step] : [], success: true };
      }
      
      if (query.includes('ejecucion_id = ?')) {
        const ejecucionId = this.boundParams[0];
        const filtered = steps.filter((s: any) => s.ejecucion_id === ejecucionId);
        return { results: filtered, success: true };
      }
    }
    
    // SELECT FROM ani_instrucciones
    if (query.includes('select') && query.includes('ani_instrucciones')) {
      const instructions = this.data.get('ani_instrucciones') || [];
      
      if (query.includes('tipo_paso = ?')) {
        const tipoPaso = this.boundParams[0];
        const instruction = instructions.find((i: any) => i.tipo_paso === tipoPaso);
        return { results: instruction ? [instruction] : [], success: true };
      }
      
      return { results: instructions, success: true };
    }
    
    // SELECT FROM ani_proyectos
    if (query.includes('select') && query.includes('ani_proyectos')) {
      const projects = this.data.get('ani_proyectos') || [];
      
      if (query.includes('id = ?')) {
        const projectId = this.boundParams[0];
        const project = projects.find((p: any) => p.id === projectId);
        return { results: project ? [project] : [], success: true };
      }
    }
    
    // SELECT FROM ani_ejecuciones
    if (query.includes('select') && query.includes('ani_ejecuciones')) {
      const executions = this.data.get('ani_ejecuciones') || [];
      
      if (query.includes('id = ?')) {
        const executionId = this.boundParams[0];
        const execution = executions.find((e: any) => e.id === executionId);
        return { results: execution ? [execution] : [], success: true };
      }
    }
    
    return { results: [], success: true };
  }

  /**
   * Ejecuta la declaración y retorna información de ejecución
   */
  async run(): Promise<any> {
    await this.all();
    return { success: true, meta: { changes: 1 } };
  }
}

/**
 * Mock de R2Bucket
 */
export class MockR2Bucket {
  private data: Map<string, { content: string; metadata?: any }> = new Map();

  /**
   * Obtiene un objeto del bucket
   */
  async get(key: string): Promise<any> {
    const object = this.data.get(key);
    if (!object) {
      return null;
    }
    
    return {
      text: async () => object.content,
      json: async () => JSON.parse(object.content),
    };
  }

  /**
   * Almacena un objeto en el bucket
   */
  async put(key: string, content: string, options?: any): Promise<void> {
    this.data.set(key, { content, metadata: options });
  }

  /**
   * Elimina un objeto del bucket
   */
  async delete(key: string): Promise<void> {
    this.data.delete(key);
  }

  /**
   * Lista objetos en el bucket
   */
  async list(options?: { prefix?: string; limit?: number }): Promise<any> {
    const prefix = options?.prefix || '';
    const limit = options?.limit || 1000;
    
    const keys: Array<{ name: string }> = [];
    for (const key of this.data.keys()) {
      if (key.startsWith(prefix) && keys.length < limit) {
        keys.push({ name: key });
      }
    }
    
    return { objects: keys, truncated: false };
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
  setData(key: string, content: string, metadata?: any): void {
    this.data.set(key, { content, metadata });
  }

  /**
   * Obtiene datos mock de una clave
   */
  getData(key: string): string | null {
    const object = this.data.get(key);
    return object ? object.content : null;
  }
}

/**
 * Mock de KVNamespace
 */
export class MockKVNamespace {
  private data: Map<string, { value: string; expiration?: number }> = new Map();

  /**
   * Obtiene un valor de KV
   */
  async get(key: string): Promise<string | null> {
    const entry = this.data.get(key);
    if (!entry) {
      return null;
    }
    
    // Verificar expiración
    if (entry.expiration && Date.now() > entry.expiration) {
      this.data.delete(key);
      return null;
    }
    
    return entry.value;
  }

  /**
   * Almacena un valor en KV
   */
  async put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void> {
    const expiration = options?.expirationTtl ? Date.now() + options.expirationTtl * 1000 : undefined;
    this.data.set(key, { value, expiration });
  }

  /**
   * Elimina un valor de KV
   */
  async delete(key: string): Promise<void> {
    this.data.delete(key);
  }

  /**
   * Lista claves en KV
   */
  async list(options?: { prefix?: string; limit?: number }): Promise<{ keys: Array<{ name: string }> }> {
    const prefix = options?.prefix || '';
    const limit = options?.limit || 1000;
    
    const keys: Array<{ name: string }> = [];
    for (const key of this.data.keys()) {
      if (key.startsWith(prefix) && keys.length < limit) {
        keys.push({ name: key });
      }
    }
    
    return { keys };
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
  setData(key: string, value: string, options?: { expirationTtl?: number }): void {
    const expiration = options?.expirationTtl ? Date.now() + options.expirationTtl * 1000 : undefined;
    this.data.set(key, { value, expiration });
  }
}

/**
 * Mock de Workflow
 */
export class MockWorkflow {
  private executions: Map<string, any> = new Map();

  /**
   * Crea una instancia de workflow
   */
  async create(params: any): Promise<any> {
    const id = crypto.randomUUID();
    this.executions.set(id, { id, params, status: 'pending' });
    return { id };
  }

  /**
   * Obtiene una instancia de workflow
   */
  async get(id: string): Promise<any> {
    return this.executions.get(id);
  }

  /**
   * Limpia todos los datos mock
   */
  clear(): void {
    this.executions.clear();
  }
}

/**
 * Mock de fetch para OpenAI API
 */
export function mockOpenAIResponse(response: any): void {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => response,
  }) as any;
}

/**
 * Mock de fetch para OpenAI API con error
 */
export function mockOpenAIError(status: number, errorText: string): void {
  global.fetch = vi.fn().mockResolvedValue({
    ok: false,
    status,
    text: async () => errorText,
  }) as any;
}

/**
 * Mock de fetch para OpenAI API con timeout
 */
export function mockOpenAITimeout(): void {
  global.fetch = vi.fn().mockImplementation(() => {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error('AbortError')), 100);
    });
  }) as any;
}

/**
 * Crea un entorno de mock completo para el Workflow Worker
 */
export function createMockEnv() {
  const mockDb = new MockD1Database();
  const mockR2 = new MockR2Bucket();
  const mockKV = new MockKVNamespace();
  const mockWorkflow = new MockWorkflow();

  // Configurar datos iniciales
  mockKV.setData('OPENAI_API_KEY', 'test-api-key');

  // Configurar instrucciones para cada tipo de paso
  const instructions = [
    { id: 'inst-1', nombre: 'Resumen', tipo_paso: StepType.RESUMEN, orden: 1, prompt_desarrollador: 'Genera un resumen del inmueble', fecha_creacion: new Date().toISOString() },
    { id: 'inst-2', nombre: 'Datos Clave', tipo_paso: StepType.DATOS_CLAVE, orden: 2, prompt_desarrollador: 'Extrae los datos clave del inmueble', fecha_creacion: new Date().toISOString() },
    { id: 'inst-3', nombre: 'Activo Físico', tipo_paso: StepType.ACTIVO_FISICO, orden: 3, prompt_desarrollador: 'Analiza el activo físico del inmueble', fecha_creacion: new Date().toISOString() },
    { id: 'inst-4', nombre: 'Activo Estratégico', tipo_paso: StepType.ACTIVO_ESTRATEGICO, orden: 4, prompt_desarrollador: 'Analiza el activo estratégico del inmueble', fecha_creacion: new Date().toISOString() },
    { id: 'inst-5', nombre: 'Activo Financiero', tipo_paso: StepType.ACTIVO_FINANCIERO, orden: 5, prompt_desarrollador: 'Analiza el activo financiero del inmueble', fecha_creacion: new Date().toISOString() },
    { id: 'inst-6', nombre: 'Activo Regulado', tipo_paso: StepType.ACTIVO_REGULADO, orden: 6, prompt_desarrollador: 'Analiza el activo regulado del inmueble', fecha_creacion: new Date().toISOString() },
    { id: 'inst-7', nombre: 'Lectura Inversor', tipo_paso: StepType.LECTURA_INVERSOR, orden: 7, prompt_desarrollador: 'Genera una lectura para inversores', fecha_creacion: new Date().toISOString() },
    { id: 'inst-8', nombre: 'Lectura Emprendedor', tipo_paso: StepType.LECTURA_EMPRENDEDOR, orden: 8, prompt_desarrollador: 'Genera una lectura para emprendedores', fecha_creacion: new Date().toISOString() },
    { id: 'inst-9', nombre: 'Lectura Propietario', tipo_paso: StepType.LECTURA_PROPIETARIO, orden: 9, prompt_desarrollador: 'Genera una lectura para propietarios', fecha_creacion: new Date().toISOString() },
  ];
  mockDb.setData('ani_instrucciones', instructions);

  // Configurar un proyecto de prueba
  const projects = [
    { id: 'proj-1', nombre: 'Test Project', estado: 'creado', fecha_creacion: new Date().toISOString(), fecha_actualizacion: new Date().toISOString() },
  ];
  mockDb.setData('ani_proyectos', projects);

  // Configurar I-JSON de prueba en R2
  const iJson = {
    id: 'proj-1',
    nombre: 'Test Property',
    direccion: '123 Test Street',
    precio: 100000,
    superficie: 100,
  };
  mockR2.setData('dir-api-inmo/proj-1/proj-1.json', JSON.stringify(iJson));

  return {
    CF_B_DB_INMO: mockDb,
    CF_B_R2_INMO: mockR2,
    CF_B_KV_SECRETS: mockKV,
    ANALYSIS_WORKFLOW: mockWorkflow,
  };
}

/**
 * Crea un mock de respuesta exitosa de OpenAI
 */
export function createMockOpenAIResponse(content: string): any {
  return {
    id: 'resp-1',
    object: 'response',
    created: Date.now(),
    model: 'gpt-5.2',
    output: [
      {
        type: 'text',
        text: content,
      },
    ],
    usage: {
      prompt_tokens: 100,
      completion_tokens: 200,
      total_tokens: 300,
    },
  };
}

/**
 * Crea un mock de respuesta con error de OpenAI
 */
export function createMockOpenAIError(message: string): any {
  return {
    error: {
      message,
      type: 'api_error',
      code: 'invalid_request',
    },
  };
}
