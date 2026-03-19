/**
 * Tests for Workflow Orchestration
 *
 * Tests para el orquestador de workflow que maneja la ejecución de los 9 pasos.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WorkflowOrchestrator } from '../orchestration';
import { WorkflowService, ExecutionState, StepState, ProjectState, StepType } from '../services/workflow.service';
import { OpenAIService } from '../services/openai.service';
import { MockD1Database, MockR2Bucket, MockKVNamespace, mockOpenAIResponse, createMockOpenAIResponse } from './mocks';

describe('WorkflowOrchestrator', () => {
  let mockDb: MockD1Database;
  let mockR2: MockR2Bucket;
  let mockKV: MockKVNamespace;
  let mockEnv: any;
  let orchestrator: WorkflowOrchestrator;
  let projectId: string;
  let propertyData: Record<string, unknown>;

  beforeEach(() => {
    mockDb = new MockD1Database();
    mockR2 = new MockR2Bucket();
    mockKV = new MockKVNamespace();
    
    mockEnv = {
      CF_B_DB_INMO: mockDb,
      CF_B_R2_INMO: mockR2,
      CF_B_KV_SECRETS: mockKV,
    };
    
    projectId = 'proj-1';
    propertyData = {
      id: 'proj-1',
      nombre: 'Test Property',
      direccion: '123 Test Street',
      precio: 100000,
      superficie: 100,
    };
    
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
    
    // Configurar proyecto de prueba
    const projects = [
      { id: 'proj-1', nombre: 'Test Project', estado: 'creado', fecha_creacion: new Date().toISOString(), fecha_actualizacion: new Date().toISOString() },
    ];
    mockDb.setData('ani_proyectos', projects);
    
    // Configurar I-JSON de prueba en R2
    mockR2.setData('dir-api-inmo/proj-1/proj-1.json', JSON.stringify(propertyData));
    
    // Mock fetch para OpenAI
    mockOpenAIResponse(createMockOpenAIResponse('# Test Markdown Content'));
    
    orchestrator = new WorkflowOrchestrator(mockEnv, projectId, propertyData, 'test-api-key');
  });

  describe('execute', () => {
    it('debería ejecutar el workflow completo exitosamente', async () => {
      const result = await orchestrator.execute();
      
      expect(result.success).toBe(true);
      expect(result.executionId).toBeDefined();
      expect(result.projectId).toBe(projectId);
      expect(result.steps).toHaveLength(9);
      expect(result.errorMessage).toBeUndefined();
    });

    it('debería crear una ejecución en D1', async () => {
      const result = await orchestrator.execute();
      
      const executions = mockDb.getData('ani_ejecuciones');
      expect(executions).toHaveLength(1);
      expect(executions[0].id).toBe(result.executionId);
      expect(executions[0].proyecto_id).toBe(projectId);
    });

    it('debería actualizar el estado de la ejecución a FINALIZADA_CORRECTAMENTE', async () => {
      const result = await orchestrator.execute();
      
      const executions = mockDb.getData('ani_ejecuciones');
      expect(executions[0].estado).toBe(ExecutionState.FINALIZADA_CORRECTAMENTE);
      expect(executions[0].fecha_fin).toBeDefined();
    });

    it('debería actualizar el estado del proyecto a ANALISIS_FINALIZADO', async () => {
      const result = await orchestrator.execute();
      
      const projects = mockDb.getData('ani_proyectos');
      expect(projects[0].estado).toBe(ProjectState.ANALISIS_FINALIZADO);
      expect(projects[0].fecha_analisis_fin).toBeDefined();
    });

    it('debería crear 9 pasos en D1', async () => {
      await orchestrator.execute();
      
      const steps = mockDb.getData('ani_pasos');
      expect(steps).toHaveLength(9);
    });

    it('debería almacenar los reportes en R2', async () => {
      const result = await orchestrator.execute();
      
      for (const stepResult of result.steps) {
        if (stepResult.success) {
          const r2Path = `dir-api-inmo/${projectId}/${stepResult.stepType}.md`;
          const content = mockR2.getData(r2Path);
          expect(content).toBe('# Test Markdown Content');
        }
      }
    });

    it('debería almacenar el log en R2', async () => {
      await orchestrator.execute();
      
      const logContent = mockR2.getData(`dir-api-inmo/${projectId}/log.txt`);
      expect(logContent).toBeDefined();
      expect(logContent).toContain('Starting workflow execution');
    });

    it('debería manejar error en ejecución de paso', async () => {
      // Mock para que el primer paso falle
      vi.mocked(global.fetch).mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => 'Internal server error',
      } as any);
      
      const result = await orchestrator.execute();
      
      expect(result.success).toBe(false);
      expect(result.errorMessage).toBeDefined();
      
      const executions = mockDb.getData('ani_ejecuciones');
      expect(executions[0].estado).toBe(ExecutionState.FINALIZADA_CON_ERROR);
      
      const projects = mockDb.getData('ani_proyectos');
      expect(projects[0].estado).toBe(ProjectState.ANALISIS_CON_ERROR);
    });

    it('debería detener ejecución al encontrar un error', async () => {
      // Mock para que el segundo paso falle
      let callCount = 0;
      vi.mocked(global.fetch).mockImplementation(async () => {
        callCount++;
        if (callCount === 2) {
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
      
      const result = await orchestrator.execute();
      
      expect(result.success).toBe(false);
      expect(result.steps).toHaveLength(2);
      expect(result.steps[0].success).toBe(true);
      expect(result.steps[1].success).toBe(false);
    });

    it('debería actualizar el estado del paso a CORRECTO al completar', async () => {
      await orchestrator.execute();
      
      const steps = mockDb.getData('ani_pasos');
      for (const step of steps) {
        expect(step.estado).toBe(StepState.CORRECTO);
        expect(step.fecha_fin).toBeDefined();
        expect(step.ruta_archivo_r2).toBeDefined();
      }
    });

    it('debería actualizar el estado del paso a ERROR al fallar', async () => {
      // Mock para que el primer paso falle
      vi.mocked(global.fetch).mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => 'Internal server error',
      } as any);
      
      await orchestrator.execute();
      
      const steps = mockDb.getData('ani_pasos');
      expect(steps[0].estado).toBe(StepState.ERROR);
      expect(steps[0].error_mensaje).toBeDefined();
    });
  });

  describe('executeStep', () => {
    it('debería ejecutar un paso exitosamente', async () => {
      const execution = await new WorkflowService(mockDb as any).createExecution(projectId);
      const steps = await new WorkflowService(mockDb as any).createSteps(execution.id);
      
      const stepResult = await orchestrator['executeStep'](steps[0]);
      
      expect(stepResult.success).toBe(true);
      expect(stepResult.stepId).toBe(steps[0].id);
      expect(stepResult.stepType).toBe(steps[0].tipo_paso);
      expect(stepResult.markdownContent).toBe('# Test Markdown Content');
      expect(stepResult.r2Path).toBeDefined();
    });

    it('debería manejar error cuando la instrucción no existe', async () => {
      const execution = await new WorkflowService(mockDb as any).createExecution(projectId);
      const steps = await new WorkflowService(mockDb as any).createSteps(execution.id);
      
      // Eliminar instrucciones
      mockDb.setData('ani_instrucciones', []);
      
      const stepResult = await orchestrator['executeStep'](steps[0]);
      
      expect(stepResult.success).toBe(false);
      expect(stepResult.errorMessage).toContain('Instruction not found');
    });

    it('debería manejar error cuando el I-JSON no existe en R2', async () => {
      const execution = await new WorkflowService(mockDb as any).createExecution(projectId);
      const steps = await new WorkflowService(mockDb as any).createSteps(execution.id);
      
      // Eliminar I-JSON de R2
      mockR2.clear();
      
      const stepResult = await orchestrator['executeStep'](steps[0]);
      
      expect(stepResult.success).toBe(false);
      expect(stepResult.errorMessage).toContain('I-JSON not found in R2');
    });

    it('debería manejar error de OpenAI API', async () => {
      const execution = await new WorkflowService(mockDb as any).createExecution(projectId);
      const steps = await new WorkflowService(mockDb as any).createSteps(execution.id);
      
      // Mock error de OpenAI
      vi.mocked(global.fetch).mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => 'Internal server error',
      } as any);
      
      const stepResult = await orchestrator['executeStep'](steps[0]);
      
      expect(stepResult.success).toBe(false);
      expect(stepResult.errorMessage).toBeDefined();
    });
  });

  describe('handleWorkflowSuccess', () => {
    it('debería actualizar estados a finalizado correctamente', async () => {
      const execution = await new WorkflowService(mockDb as any).createExecution(projectId);
      const steps = await new WorkflowService(mockDb as any).createSteps(execution.id);
      
      await orchestrator['handleWorkflowSuccess']([]);
      
      const updatedExecution = await new WorkflowService(mockDb as any).getExecution(execution.id);
      expect(updatedExecution?.estado).toBe(ExecutionState.FINALIZADA_CORRECTAMENTE);
      
      const project = mockDb.getData('ani_proyectos')[0];
      expect(project.estado).toBe(ProjectState.ANALISIS_FINALIZADO);
    });
  });

  describe('handleWorkflowError', () => {
    it('debería actualizar estados a finalizado con error', async () => {
      const execution = await new WorkflowService(mockDb as any).createExecution(projectId);
      const steps = await new WorkflowService(mockDb as any).createSteps(execution.id);
      
      const stepResults = [
        { stepId: steps[0].id, stepType: steps[0].tipo_paso, order: 1, success: false, errorMessage: 'Test error' },
      ];
      
      await orchestrator['handleWorkflowError'](stepResults);
      
      const updatedExecution = await new WorkflowService(mockDb as any).getExecution(execution.id);
      expect(updatedExecution?.estado).toBe(ExecutionState.FINALIZADA_CON_ERROR);
      expect(updatedExecution?.error_mensaje).toBe('Test error');
      
      const project = mockDb.getData('ani_proyectos')[0];
      expect(project.estado).toBe(ProjectState.ANALISIS_CON_ERROR);
    });
  });

  describe('readIJsonFromR2', () => {
    it('debería leer el I-JSON desde R2', async () => {
      const iJson = await orchestrator['readIJsonFromR2']();
      
      expect(iJson).toEqual(propertyData);
    });

    it('debería lanzar error si el I-JSON no existe', async () => {
      mockR2.clear();
      
      await expect(orchestrator['readIJsonFromR2']()).rejects.toThrow('I-JSON not found in R2');
    });
  });

  describe('storeReportInR2', () => {
    it('debería almacenar el reporte en R2', async () => {
      const markdownContent = '# Test Report';
      const r2Path = await orchestrator['storeReportInR2'](StepType.RESUMEN, markdownContent);
      
      expect(r2Path).toBe(`dir-api-inmo/${projectId}/${StepType.RESUMEN}.md`);
      
      const content = mockR2.getData(r2Path);
      expect(content).toBe(markdownContent);
    });
  });

  describe('storeLogInR2', () => {
    it('debería almacenar el log en R2', async () => {
      orchestrator['log']('Test log message');
      
      await orchestrator['storeLogInR2']();
      
      const logContent = mockR2.getData(`dir-api-inmo/${projectId}/log.txt`);
      expect(logContent).toContain('Test log message');
    });
  });

  describe('log', () => {
    it('debería agregar mensajes de log', () => {
      orchestrator['log']('Test message');
      
      const logMessages = orchestrator['logMessages'];
      expect(logMessages).toHaveLength(1);
      expect(logMessages[0]).toContain('Test message');
      expect(logMessages[0]).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/);
    });
  });
});
