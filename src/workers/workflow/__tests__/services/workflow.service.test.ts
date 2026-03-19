/**
 * Tests for Workflow Service
 *
 * Tests para el servicio de workflow que maneja operaciones de D1.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { WorkflowService, ExecutionState, StepState, ProjectState, StepType } from '../../services/workflow.service';
import { MockD1Database } from '../mocks';

describe('WorkflowService', () => {
  let mockDb: MockD1Database;
  let workflowService: WorkflowService;

  beforeEach(() => {
    mockDb = new MockD1Database();
    workflowService = new WorkflowService(mockDb as any);
  });

  describe('createExecution', () => {
    it('debería crear una ejecución correctamente', async () => {
      const projectId = 'proj-1';
      const execution = await workflowService.createExecution(projectId);

      expect(execution).toBeDefined();
      expect(execution.id).toBeDefined();
      expect(execution.proyecto_id).toBe(projectId);
      expect(execution.estado).toBe(ExecutionState.INICIADA);
      expect(execution.fecha_inicio).toBeDefined();
    });

    it('debería generar IDs únicos para cada ejecución', async () => {
      const execution1 = await workflowService.createExecution('proj-1');
      const execution2 = await workflowService.createExecution('proj-1');

      expect(execution1.id).not.toBe(execution2.id);
    });
  });

  describe('updateExecutionState', () => {
    it('debería actualizar el estado de una ejecución', async () => {
      const execution = await workflowService.createExecution('proj-1');
      
      await workflowService.updateExecutionState(execution.id, ExecutionState.EN_EJECUCION);
      
      const updatedExecution = await workflowService.getExecution(execution.id);
      expect(updatedExecution?.estado).toBe(ExecutionState.EN_EJECUCION);
    });

    it('debería establecer fecha_fin cuando el estado es finalizado', async () => {
      const execution = await workflowService.createExecution('proj-1');
      
      await workflowService.updateExecutionState(execution.id, ExecutionState.FINALIZADA_CORRECTAMENTE);
      
      const updatedExecution = await workflowService.getExecution(execution.id);
      expect(updatedExecution?.fecha_fin).toBeDefined();
    });

    it('debería incluir mensaje de error cuando se proporciona', async () => {
      const execution = await workflowService.createExecution('proj-1');
      const errorMessage = 'Test error message';
      
      await workflowService.updateExecutionState(
        execution.id,
        ExecutionState.FINALIZADA_CON_ERROR,
        errorMessage
      );
      
      const updatedExecution = await workflowService.getExecution(execution.id);
      expect(updatedExecution?.error_mensaje).toBe(errorMessage);
    });
  });

  describe('createSteps', () => {
    it('debería crear 9 pasos para una ejecución', async () => {
      const execution = await workflowService.createExecution('proj-1');
      const steps = await workflowService.createSteps(execution.id);

      expect(steps).toHaveLength(9);
      expect(steps[0].tipo_paso).toBe(StepType.RESUMEN);
      expect(steps[8].tipo_paso).toBe(StepType.LECTURA_PROPIETARIO);
    });

    it('debería asignar orden correcto a cada paso', async () => {
      const execution = await workflowService.createExecution('proj-1');
      const steps = await workflowService.createSteps(execution.id);

      for (let i = 0; i < steps.length; i++) {
        expect(steps[i].orden).toBe(i + 1);
      }
    });

    it('debería asignar estado pendiente a todos los pasos', async () => {
      const execution = await workflowService.createExecution('proj-1');
      const steps = await workflowService.createSteps(execution.id);

      for (const step of steps) {
        expect(step.estado).toBe(StepState.PENDIENTE);
      }
    });

    it('debería generar IDs únicos para cada paso', async () => {
      const execution = await workflowService.createExecution('proj-1');
      const steps = await workflowService.createSteps(execution.id);

      const ids = steps.map(s => s.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(9);
    });
  });

  describe('updateStepState', () => {
    it('debería actualizar el estado de un paso', async () => {
      const execution = await workflowService.createExecution('proj-1');
      const steps = await workflowService.createSteps(execution.id);
      
      await workflowService.updateStepState(steps[0].id, StepState.EN_EJECUCION);
      
      const updatedStep = await workflowService.getStepByOrder(execution.id, 1);
      expect(updatedStep?.estado).toBe(StepState.EN_EJECUCION);
    });

    it('debería establecer fecha_fin cuando el estado es finalizado', async () => {
      const execution = await workflowService.createExecution('proj-1');
      const steps = await workflowService.createSteps(execution.id);
      
      await workflowService.updateStepState(steps[0].id, StepState.CORRECTO);
      
      const updatedStep = await workflowService.getStepByOrder(execution.id, 1);
      expect(updatedStep?.fecha_fin).toBeDefined();
    });

    it('debería incluir mensaje de error cuando se proporciona', async () => {
      const execution = await workflowService.createExecution('proj-1');
      const steps = await workflowService.createSteps(execution.id);
      const errorMessage = 'Test error message';
      
      await workflowService.updateStepState(
        steps[0].id,
        StepState.ERROR,
        errorMessage
      );
      
      const updatedStep = await workflowService.getStepByOrder(execution.id, 1);
      expect(updatedStep?.error_mensaje).toBe(errorMessage);
    });

    it('debería incluir ruta R2 cuando se proporciona', async () => {
      const execution = await workflowService.createExecution('proj-1');
      const steps = await workflowService.createSteps(execution.id);
      const r2Path = 'dir-api-inmo/proj-1/resumen.md';
      
      await workflowService.updateStepState(
        steps[0].id,
        StepState.CORRECTO,
        undefined,
        r2Path
      );
      
      const updatedStep = await workflowService.getStepByOrder(execution.id, 1);
      expect(updatedStep?.ruta_archivo_r2).toBe(r2Path);
    });
  });

  describe('getStepByOrder', () => {
    it('debería obtener un paso por orden', async () => {
      const execution = await workflowService.createExecution('proj-1');
      const steps = await workflowService.createSteps(execution.id);
      
      const step = await workflowService.getStepByOrder(execution.id, 1);
      
      expect(step).toBeDefined();
      expect(step?.id).toBe(steps[0].id);
      expect(step?.orden).toBe(1);
    });

    it('debería retornar null si el paso no existe', async () => {
      const execution = await workflowService.createExecution('proj-1');
      
      const step = await workflowService.getStepByOrder(execution.id, 99);
      
      expect(step).toBeNull();
    });
  });

  describe('getStepsByExecution', () => {
    it('debería obtener todos los pasos de una ejecución', async () => {
      const execution = await workflowService.createExecution('proj-1');
      await workflowService.createSteps(execution.id);
      
      const steps = await workflowService.getStepsByExecution(execution.id);
      
      expect(steps).toHaveLength(9);
      expect(steps[0].orden).toBe(1);
      expect(steps[8].orden).toBe(9);
    });

    it('debería retornar array vacío si no hay pasos', async () => {
      const execution = await workflowService.createExecution('proj-1');
      
      const steps = await workflowService.getStepsByExecution(execution.id);
      
      expect(steps).toHaveLength(0);
    });
  });

  describe('getInstructionByStepType', () => {
    beforeEach(() => {
      // Configurar instrucciones de prueba
      const instructions = [
        { id: 'inst-1', nombre: 'Resumen', tipo_paso: StepType.RESUMEN, orden: 1, prompt_desarrollador: 'Genera un resumen', fecha_creacion: new Date().toISOString() },
        { id: 'inst-2', nombre: 'Datos Clave', tipo_paso: StepType.DATOS_CLAVE, orden: 2, prompt_desarrollador: 'Extrae datos clave', fecha_creacion: new Date().toISOString() },
      ];
      mockDb.setData('ani_instrucciones', instructions);
    });

    it('debería obtener una instrucción por tipo de paso', async () => {
      const instruction = await workflowService.getInstructionByStepType(StepType.RESUMEN);
      
      expect(instruction).toBeDefined();
      expect(instruction?.tipo_paso).toBe(StepType.RESUMEN);
      expect(instruction?.prompt_desarrollador).toBe('Genera un resumen');
    });

    it('debería retornar null si la instrucción no existe', async () => {
      const instruction = await workflowService.getInstructionByStepType(StepType.ACTIVO_FISICO);
      
      expect(instruction).toBeNull();
    });
  });

  describe('getAllInstructions', () => {
    beforeEach(() => {
      // Configurar instrucciones de prueba
      const instructions = [
        { id: 'inst-1', nombre: 'Resumen', tipo_paso: StepType.RESUMEN, orden: 1, prompt_desarrollador: 'Genera un resumen', fecha_creacion: new Date().toISOString() },
        { id: 'inst-2', nombre: 'Datos Clave', tipo_paso: StepType.DATOS_CLAVE, orden: 2, prompt_desarrollador: 'Extrae datos clave', fecha_creacion: new Date().toISOString() },
      ];
      mockDb.setData('ani_instrucciones', instructions);
    });

    it('debería obtener todas las instrucciones', async () => {
      const instructions = await workflowService.getAllInstructions();
      
      expect(instructions).toHaveLength(2);
      expect(instructions[0].orden).toBe(1);
      expect(instructions[1].orden).toBe(2);
    });

    it('debería retornar array vacío si no hay instrucciones', async () => {
      mockDb.setData('ani_instrucciones', []);
      
      const instructions = await workflowService.getAllInstructions();
      
      expect(instructions).toHaveLength(0);
    });
  });

  describe('updateProjectState', () => {
    beforeEach(() => {
      // Configurar proyecto de prueba
      const projects = [
        { id: 'proj-1', nombre: 'Test Project', estado: 'creado', fecha_creacion: new Date().toISOString(), fecha_actualizacion: new Date().toISOString() },
      ];
      mockDb.setData('ani_proyectos', projects);
    });

    it('debería actualizar el estado de un proyecto', async () => {
      await workflowService.updateProjectState('proj-1', ProjectState.PROCESANDO_ANALISIS);
      
      const project = mockDb.getData('ani_proyectos')[0];
      expect(project.estado).toBe(ProjectState.PROCESANDO_ANALISIS);
    });

    it('debería establecer fecha_analisis_inicio cuando el estado es PROCESANDO_ANALISIS', async () => {
      await workflowService.updateProjectState('proj-1', ProjectState.PROCESANDO_ANALISIS);
      
      const project = mockDb.getData('ani_proyectos')[0];
      expect(project.fecha_analisis_inicio).toBeDefined();
    });

    it('debería establecer fecha_analisis_fin cuando el estado es ANALISIS_FINALIZADO', async () => {
      await workflowService.updateProjectState('proj-1', ProjectState.ANALISIS_FINALIZADO);
      
      const project = mockDb.getData('ani_proyectos')[0];
      expect(project.fecha_analisis_fin).toBeDefined();
    });

    it('debería establecer fecha_analisis_fin cuando el estado es ANALISIS_CON_ERROR', async () => {
      await workflowService.updateProjectState('proj-1', ProjectState.ANALISIS_CON_ERROR);
      
      const project = mockDb.getData('ani_proyectos')[0];
      expect(project.fecha_analisis_fin).toBeDefined();
    });

    it('debería actualizar fecha_actualizacion', async () => {
      const projectBefore = mockDb.getData('ani_proyectos')[0];
      const fechaActualizacionBefore = projectBefore.fecha_actualizacion;
      
      // Esperar un poco para asegurar que cambie la fecha
      await new Promise(resolve => setTimeout(resolve, 10));
      
      await workflowService.updateProjectState('proj-1', ProjectState.PROCESANDO_ANALISIS);
      
      const projectAfter = mockDb.getData('ani_proyectos')[0];
      expect(projectAfter.fecha_actualizacion).not.toBe(fechaActualizacionBefore);
    });
  });

  describe('getProject', () => {
    beforeEach(() => {
      // Configurar proyecto de prueba
      const projects = [
        { id: 'proj-1', nombre: 'Test Project', estado: 'creado', fecha_creacion: new Date().toISOString(), fecha_actualizacion: new Date().toISOString() },
      ];
      mockDb.setData('ani_proyectos', projects);
    });

    it('debería obtener un proyecto por ID', async () => {
      const project = await workflowService.getProject('proj-1');
      
      expect(project).toBeDefined();
      expect(project?.id).toBe('proj-1');
      expect(project?.nombre).toBe('Test Project');
    });

    it('debería retornar null si el proyecto no existe', async () => {
      const project = await workflowService.getProject('non-existent');
      
      expect(project).toBeNull();
    });
  });

  describe('getExecution', () => {
    it('debería obtener una ejecución por ID', async () => {
      const execution = await workflowService.createExecution('proj-1');
      
      const retrievedExecution = await workflowService.getExecution(execution.id);
      
      expect(retrievedExecution).toBeDefined();
      expect(retrievedExecution?.id).toBe(execution.id);
      expect(retrievedExecution?.proyecto_id).toBe('proj-1');
    });

    it('debería retornar null si la ejecución no existe', async () => {
      const execution = await workflowService.getExecution('non-existent');
      
      expect(execution).toBeNull();
    });
  });
});
