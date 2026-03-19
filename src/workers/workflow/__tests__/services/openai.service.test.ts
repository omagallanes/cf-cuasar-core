/**
 * Tests for OpenAI Service
 *
 * Tests para el servicio de OpenAI que maneja la integración con la API de OpenAI.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OpenAIService } from '../../services/openai.service';
import { StepType } from '../../services/workflow.service';
import { MockKVNamespace, mockOpenAIResponse, mockOpenAIError, mockOpenAITimeout, createMockOpenAIResponse, createMockOpenAIError } from '../mocks';

describe('OpenAIService', () => {
  let mockKV: MockKVNamespace;
  let openaiService: OpenAIService;

  beforeEach(() => {
    mockKV = new MockKVNamespace();
    mockKV.setData('OPENAI_API_KEY', 'test-api-key');
    openaiService = new OpenAIService(mockKV as any);
    
    // Restaurar fetch original
    global.fetch = vi.fn() as any;
  });

  describe('getApiKey', () => {
    it('debería obtener la API key de KV', async () => {
      const apiKey = await openaiService.getApiKey();
      
      expect(apiKey).toBe('test-api-key');
    });

    it('debería cachear la API key', async () => {
      const apiKey1 = await openaiService.getApiKey();
      const apiKey2 = await openaiService.getApiKey();
      
      expect(apiKey1).toBe(apiKey2);
    });

    it('debería lanzar error si la API key no existe', async () => {
      const emptyKV = new MockKVNamespace();
      const service = new OpenAIService(emptyKV as any);
      
      await expect(service.getApiKey()).rejects.toThrow('OpenAI API key not found in KV namespace');
    });
  });

  describe('buildPrompt', () => {
    const iJson = {
      id: 'proj-1',
      nombre: 'Test Property',
      direccion: '123 Test Street',
      precio: 100000,
      superficie: 100,
    };

    it('debería construir prompt para pasos 1-6 (solo I-JSON)', () => {
      const context = {
        stepType: StepType.RESUMEN,
        iJson,
        instructionPrompt: 'Genera un resumen del inmueble',
        previousMarkdowns: undefined,
      };

      const prompt = openaiService['buildPrompt'](context);
      
      expect(prompt).toContain('Genera un resumen del inmueble');
      expect(prompt).toContain('Property data:');
      expect(prompt).toContain('"id": "proj-1"');
    });

    it('debería construir prompt para pasos 7-9 (I-JSON + Markdowns previos)', () => {
      const previousMarkdowns = new Map<StepType, string>();
      previousMarkdowns.set(StepType.RESUMEN, '# Resumen del inmueble');
      previousMarkdowns.set(StepType.DATOS_CLAVE, '## Datos clave');
      
      const context = {
        stepType: StepType.LECTURA_INVERSOR,
        iJson,
        instructionPrompt: 'Genera una lectura para inversores',
        previousMarkdowns,
      };

      const prompt = openaiService['buildPrompt'](context);
      
      expect(prompt).toContain('Genera una lectura para inversores');
      expect(prompt).toContain('<property_data>');
      expect(prompt).toContain('<resumen>');
      expect(prompt).toContain('# Resumen del inmueble');
      expect(prompt).toContain('<datos_clave>');
      expect(prompt).toContain('## Datos clave');
    });

    it('debería lanzar error para pasos 7-9 sin Markdowns previos', () => {
      const context = {
        stepType: StepType.LECTURA_INVERSOR,
        iJson,
        instructionPrompt: 'Genera una lectura para inversores',
        previousMarkdowns: undefined,
      };

      expect(() => openaiService['buildPrompt'](context)).toThrow('Previous Markdowns required for step type');
    });

    it('debería incluir los Markdowns previos correctos para lectura_inversor', () => {
      const previousMarkdowns = new Map<StepType, string>();
      previousMarkdowns.set(StepType.RESUMEN, '# Resumen');
      previousMarkdowns.set(StepType.DATOS_CLAVE, '## Datos');
      previousMarkdowns.set(StepType.ACTIVO_FISICO, '## Físico');
      previousMarkdowns.set(StepType.ACTIVO_ESTRATEGICO, '## Estratégico');
      previousMarkdowns.set(StepType.ACTIVO_FINANCIERO, '## Financiero');
      previousMarkdowns.set(StepType.ACTIVO_REGULADO, '## Regulado');
      
      const context = {
        stepType: StepType.LECTURA_INVERSOR,
        iJson,
        instructionPrompt: 'Genera lectura inversor',
        previousMarkdowns,
      };

      const prompt = openaiService['buildPrompt'](context);
      
      expect(prompt).toContain('<resumen>');
      expect(prompt).toContain('<datos_clave>');
      expect(prompt).toContain('<activo_fisico>');
      expect(prompt).toContain('<activo_estrategico>');
      expect(prompt).toContain('<activo_financiero>');
      expect(prompt).toContain('<activo_regulado>');
    });

    it('debería incluir los Markdowns previos correctos para lectura_emprendedor', () => {
      const previousMarkdowns = new Map<StepType, string>();
      previousMarkdowns.set(StepType.RESUMEN, '# Resumen');
      previousMarkdowns.set(StepType.DATOS_CLAVE, '## Datos');
      previousMarkdowns.set(StepType.ACTIVO_FISICO, '## Físico');
      previousMarkdowns.set(StepType.ACTIVO_ESTRATEGICO, '## Estratégico');
      previousMarkdowns.set(StepType.ACTIVO_FINANCIERO, '## Financiero');
      previousMarkdowns.set(StepType.ACTIVO_REGULADO, '## Regulado');
      previousMarkdowns.set(StepType.LECTURA_INVERSOR, '## Inversor');
      
      const context = {
        stepType: StepType.LECTURA_EMPRENDEDOR,
        iJson,
        instructionPrompt: 'Genera lectura emprendedor',
        previousMarkdowns,
      };

      const prompt = openaiService['buildPrompt'](context);
      
      expect(prompt).toContain('<lectura_inversor>');
    });

    it('debería incluir los Markdowns previos correctos para lectura_propietario', () => {
      const previousMarkdowns = new Map<StepType, string>();
      previousMarkdowns.set(StepType.RESUMEN, '# Resumen');
      previousMarkdowns.set(StepType.DATOS_CLAVE, '## Datos');
      previousMarkdowns.set(StepType.ACTIVO_FISICO, '## Físico');
      previousMarkdowns.set(StepType.ACTIVO_ESTRATEGICO, '## Estratégico');
      previousMarkdowns.set(StepType.ACTIVO_FINANCIERO, '## Financiero');
      previousMarkdowns.set(StepType.ACTIVO_REGULADO, '## Regulado');
      previousMarkdowns.set(StepType.LECTURA_INVERSOR, '## Inversor');
      previousMarkdowns.set(StepType.LECTURA_EMPRENDEDOR, '## Emprendedor');
      
      const context = {
        stepType: StepType.LECTURA_PROPIETARIO,
        iJson,
        instructionPrompt: 'Genera lectura propietario',
        previousMarkdowns,
      };

      const prompt = openaiService['buildPrompt'](context);
      
      expect(prompt).toContain('<lectura_inversor>');
      expect(prompt).toContain('<lectura_emprendedor>');
    });
  });

  describe('processResponse', () => {
    it('debería procesar respuesta con formato output array', () => {
      const response = createMockOpenAIResponse('# Test Markdown Content');
      
      const content = openaiService['processResponse'](response);
      
      expect(content).toBe('# Test Markdown Content');
    });

    it('debería procesar respuesta con formato choices array', () => {
      const response = {
        id: 'resp-1',
        object: 'response',
        created: Date.now(),
        model: 'gpt-5.2',
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: '# Test Content from Choices',
            },
            finish_reason: 'stop',
          },
        ],
      };
      
      const content = openaiService['processResponse'](response);
      
      expect(content).toBe('# Test Content from Choices');
    });

    it('debería procesar respuesta con formato choices.text', () => {
      const response = {
        id: 'resp-1',
        object: 'response',
        created: Date.now(),
        model: 'gpt-5.2',
        choices: [
          {
            index: 0,
            text: '# Test Content from Text',
            finish_reason: 'stop',
          },
        ],
      };
      
      const content = openaiService['processResponse'](response);
      
      expect(content).toBe('# Test Content from Text');
    });

    it('debería lanzar error si la respuesta contiene error', () => {
      const response = createMockOpenAIError('Invalid request');
      
      expect(() => openaiService['processResponse'](response)).toThrow('OpenAI API error: Invalid request');
    });

    it('debería lanzar error si la respuesta no tiene contenido', () => {
      const response = {
        id: 'resp-1',
        object: 'response',
        created: Date.now(),
        model: 'gpt-5.2',
      };
      
      expect(() => openaiService['processResponse'](response)).toThrow('Invalid response from OpenAI API');
    });
  });

  describe('executeRequest', () => {
    const iJson = {
      id: 'proj-1',
      nombre: 'Test Property',
    };

    const context = {
      stepType: StepType.RESUMEN,
      iJson,
      instructionPrompt: 'Genera un resumen',
      previousMarkdowns: undefined,
    };

    it('debería ejecutar request exitosamente', async () => {
      mockOpenAIResponse(createMockOpenAIResponse('# Test Content'));
      
      const result = await openaiService['executeRequest'](context);
      
      expect(result.success).toBe(true);
      expect(result.markdownContent).toBe('# Test Content');
      expect(result.retryCount).toBe(0);
    });

    it('debería reintentar en caso de error 429 (rate limit)', async () => {
      let attempt = 0;
      vi.mocked(global.fetch).mockImplementation(async () => {
        attempt++;
        if (attempt === 1) {
          return {
            ok: false,
            status: 429,
            text: async () => 'Rate limit exceeded',
          } as any;
        }
        return {
          ok: true,
          json: async () => createMockOpenAIResponse('# Test Content'),
        } as any;
      });
      
      const result = await openaiService['executeRequest'](context);
      
      expect(result.success).toBe(true);
      expect(result.retryCount).toBe(1);
    });

    it('debería reintentar en caso de error 5xx', async () => {
      let attempt = 0;
      vi.mocked(global.fetch).mockImplementation(async () => {
        attempt++;
        if (attempt === 1) {
          return {
            ok: false,
            status: 500,
            text: async () => 'Internal server error',
          } as any;
        }
        return {
          ok: true,
          json: async () => createMockOpenAIResponse('# Test Content'),
        } as any;
      });
      
      const result = await openaiService['executeRequest'](context);
      
      expect(result.success).toBe(true);
      expect(result.retryCount).toBe(1);
    });

    it('debería fallar después de max reintentos', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: false,
        status: 429,
        text: async () => 'Rate limit exceeded',
      } as any);
      
      const result = await openaiService['executeRequest'](context);
      
      expect(result.success).toBe(false);
      expect(result.errorMessage).toContain('Rate limit exceeded');
      expect(result.retryCount).toBe(3);
    });

    it('debería fallar en error no reintentable', async () => {
      mockOpenAIError(401, 'Unauthorized');
      
      const result = await openaiService['executeRequest'](context);
      
      expect(result.success).toBe(false);
      expect(result.errorMessage).toContain('Unauthorized');
      expect(result.retryCount).toBe(0);
    });
  });

  describe('callOpenAI', () => {
    const iJson = {
      id: 'proj-1',
      nombre: 'Test Property',
    };

    it('debería llamar a OpenAI API correctamente', async () => {
      mockOpenAIResponse(createMockOpenAIResponse('# Test Content'));
      
      const result = await openaiService.callOpenAI(
        StepType.RESUMEN,
        iJson,
        'Genera un resumen',
        undefined
      );
      
      expect(result.success).toBe(true);
      expect(result.markdownContent).toBe('# Test Content');
    });

    it('debería pasar Markdowns previos para pasos 7-9', async () => {
      const previousMarkdowns = new Map<StepType, string>();
      previousMarkdowns.set(StepType.RESUMEN, '# Resumen');
      
      mockOpenAIResponse(createMockOpenAIResponse('# Inversor Content'));
      
      const result = await openaiService.callOpenAI(
        StepType.LECTURA_INVERSOR,
        iJson,
        'Genera lectura inversor',
        previousMarkdowns
      );
      
      expect(result.success).toBe(true);
      expect(result.markdownContent).toBe('# Inversor Content');
    });
  });

  describe('isRetryableError', () => {
    it('debería identificar error 429 como reintentable', () => {
      const isRetryable = openaiService['isRetryableError'](429, 'Rate limit exceeded');
      expect(isRetryable).toBe(true);
    });

    it('debería identificar errores 5xx como reintentables', () => {
      expect(openaiService['isRetryableError'](500, 'Internal server error')).toBe(true);
      expect(openaiService['isRetryableError'](502, 'Bad gateway')).toBe(true);
      expect(openaiService['isRetryableError'](503, 'Service unavailable')).toBe(true);
    });

    it('debería identificar errores específicos en texto como reintentables', () => {
      expect(openaiService['isRetryableError'](400, 'rate_limit_exceeded')).toBe(true);
      expect(openaiService['isRetryableError'](400, 'insufficient_quota')).toBe(true);
      expect(openaiService['isRetryableError'](400, 'timeout')).toBe(true);
      expect(openaiService['isRetryableError'](400, 'service_unavailable')).toBe(true);
    });

    it('debería identificar errores no reintentables', () => {
      expect(openaiService['isRetryableError'](400, 'Bad request')).toBe(false);
      expect(openaiService['isRetryableError'](401, 'Unauthorized')).toBe(false);
      expect(openaiService['isRetryableError'](404, 'Not found')).toBe(false);
    });
  });

  describe('isRetryableException', () => {
    it('debería identificar AbortError como reintentable', () => {
      const error = new Error('Test');
      error.name = 'AbortError';
      const isRetryable = openaiService['isRetryableException'](error);
      expect(isRetryable).toBe(true);
    });

    it('debería identificar NetworkError como reintentable', () => {
      const error = new Error('Test');
      error.name = 'NetworkError';
      const isRetryable = openaiService['isRetryableException'](error);
      expect(isRetryable).toBe(true);
    });

    it('debería identificar TimeoutError como reintentable', () => {
      const error = new Error('Test');
      error.name = 'TimeoutError';
      const isRetryable = openaiService['isRetryableException'](error);
      expect(isRetryable).toBe(true);
    });

    it('debería identificar FetchError como reintentable', () => {
      const error = new Error('Test');
      error.name = 'FetchError';
      const isRetryable = openaiService['isRetryableException'](error);
      expect(isRetryable).toBe(true);
    });

    it('debería identificar errores no reintentables', () => {
      const error = new Error('Test');
      error.name = 'ValidationError';
      const isRetryable = openaiService['isRetryableException'](error);
      expect(isRetryable).toBe(false);
    });
  });

  describe('calculateBackoffDelay', () => {
    it('debería calcular delay con backoff exponencial', () => {
      const delay0 = openaiService['calculateBackoffDelay'](0);
      const delay1 = openaiService['calculateBackoffDelay'](1);
      const delay2 = openaiService['calculateBackoffDelay'](2);
      
      // Base delay = 1000ms
      // Retry 0: 1000 * (2^0) + jitter = 1000 + jitter
      // Retry 1: 1000 * (2^1) + jitter = 2000 + jitter
      // Retry 2: 1000 * (2^2) + jitter = 4000 + jitter
      expect(delay0).toBeGreaterThanOrEqual(1000);
      expect(delay0).toBeLessThan(2000);
      expect(delay1).toBeGreaterThanOrEqual(2000);
      expect(delay1).toBeLessThan(3000);
      expect(delay2).toBeGreaterThanOrEqual(4000);
      expect(delay2).toBeLessThan(5000);
    });
  });
});
