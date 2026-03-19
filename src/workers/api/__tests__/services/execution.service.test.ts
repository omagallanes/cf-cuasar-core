/**
 * Execution Service Tests
 *
 * Tests para el servicio de gestión de ejecuciones de workflows.
 * Prueba operaciones CRUD y consultas especializadas.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ExecutionService } from '../../services/execution.service';
import { createMockEnv } from '../mocks';

describe('ExecutionService', () => {
  let executionService: ExecutionService;
  let mockEnv: any;

  beforeEach(() => {
    mockEnv = createMockEnv();
    executionService = new ExecutionService(mockEnv);
  });

  afterEach(() => {
    mockEnv.CF_B_DB_INMO.clear();
  });

  describe('create', () => {
    it('debería crear una nueva ejecución correctamente', async () => {
      const input = {
        id: 'test-execution-id',
        proyecto_id: 'test-project-id',
        fecha_inicio: new Date().toISOString(),
      };

      const result = await executionService.create(input);

      expect(result).toBeDefined();
      expect(result.id).toBe(input.id);
      expect(result.proyecto_id).toBe(input.proyecto_id);
      expect(result.estado).toBe('iniciada');
      expect(result.fecha_inicio).toBe(input.fecha_inicio);
    });

    it('debería lanzar error si el binding D1 no está disponible', () => {
      const invalidEnv: any = {
        CF_B_KV_SECRETS: mockEnv.CF_B_KV_SECRETS,
        CF_B_DB_INMO: null,
        CF_B_R2_INMO: mockEnv.CF_B_R2_INMO,
      };

      expect(() => new ExecutionService(invalidEnv as any)).toThrow('D1 binding CF_B_DB_INMO is required');
    });

    it('debería inicializar campos opcionales como null', async () => {
      const input = {
        id: 'test-execution-id',
        proyecto_id: 'test-project-id',
        fecha_inicio: new Date().toISOString(),
      };

      const result = await executionService.create(input);

      expect(result.fecha_fin).toBeNull();
      expect(result.error_mensaje).toBeNull();
    });
  });

  describe('read', () => {
    it('debería leer una ejecución existente por ID', async () => {
      const input = {
        id: 'test-execution-id',
        proyecto_id: 'test-project-id',
        fecha_inicio: new Date().toISOString(),
      };

      await executionService.create(input);
      const result = await executionService.read(input.id);

      expect(result).toBeDefined();
      expect(result?.id).toBe(input.id);
      expect(result?.proyecto_id).toBe(input.proyecto_id);
    });

    it('debería retornar null para una ejecución inexistente', async () => {
      const result = await executionService.read('non-existent-id');

      expect(result).toBeNull();
    });

    it('debería retornar todos los campos de la ejecución', async () => {
      const input = {
        id: 'test-execution-id',
        proyecto_id: 'test-project-id',
        fecha_inicio: new Date().toISOString(),
      };

      await executionService.create(input);
      const result = await executionService.read(input.id);

      expect(result).toBeDefined();
      expect(result?.id).toBeDefined();
      expect(result?.proyecto_id).toBeDefined();
      expect(result?.estado).toBeDefined();
      expect(result?.fecha_inicio).toBeDefined();
      expect(result?.fecha_fin).toBeDefined();
      expect(result?.error_mensaje).toBeDefined();
    });
  });

  describe('update', () => {
    it('debería actualizar una ejecución existente', async () => {
      const input = {
        id: 'test-execution-id',
        proyecto_id: 'test-project-id',
        fecha_inicio: new Date().toISOString(),
      };

      await executionService.create(input);

      const updateData = {
        estado: 'finalizada_correctamente' as const,
        fecha_fin: new Date().toISOString(),
      };

      const result = await executionService.update(input.id, updateData);

      expect(result).toBeDefined();
      expect(result?.estado).toBe(updateData.estado);
      expect(result?.fecha_fin).toBe(updateData.fecha_fin);
    });

    it('debería retornar null al actualizar una ejecución inexistente', async () => {
      const result = await executionService.update('non-existent-id', { estado: 'finalizada_correctamente' });

      expect(result).toBeNull();
    });

    it('debería actualizar solo los campos proporcionados', async () => {
      const input = {
        id: 'test-execution-id',
        proyecto_id: 'test-project-id',
        fecha_inicio: new Date().toISOString(),
      };

      await executionService.create(input);

      const updateData = {
        estado: 'en_ejecucion' as const,
      };

      const result = await executionService.update(input.id, updateData);

      expect(result).toBeDefined();
      expect(result?.estado).toBe(updateData.estado);
      expect(result?.fecha_fin).toBeNull();
    });

    it('debería actualizar el estado de la ejecución', async () => {
      const input = {
        id: 'test-execution-id',
        proyecto_id: 'test-project-id',
        fecha_inicio: new Date().toISOString(),
      };

      await executionService.create(input);

      const result = await executionService.update(input.id, { estado: 'en_ejecucion' });

      expect(result).toBeDefined();
      expect(result?.estado).toBe('en_ejecucion');
    });

    it('debería actualizar el mensaje de error', async () => {
      const input = {
        id: 'test-execution-id',
        proyecto_id: 'test-project-id',
        fecha_inicio: new Date().toISOString(),
      };

      await executionService.create(input);

      const result = await executionService.update(input.id, {
        estado: 'finalizada_con_error',
        error_mensaje: 'Error en la ejecución',
      });

      expect(result).toBeDefined();
      expect(result?.estado).toBe('finalizada_con_error');
      expect(result?.error_mensaje).toBe('Error en la ejecución');
    });
  });

  describe('delete', () => {
    it('debería eliminar una ejecución existente', async () => {
      const input = {
        id: 'test-execution-id',
        proyecto_id: 'test-project-id',
        fecha_inicio: new Date().toISOString(),
      };

      await executionService.create(input);
      await executionService.delete(input.id);

      const result = await executionService.read(input.id);
      expect(result).toBeNull();
    });

    it('debería retornar true al eliminar una ejecución existente', async () => {
      const input = {
        id: 'test-execution-id',
        proyecto_id: 'test-project-id',
        fecha_inicio: new Date().toISOString(),
      };

      await executionService.create(input);
      const result = await executionService.delete(input.id);

      expect(result).toBe(true);
    });

    it('debería retornar false al eliminar una ejecución inexistente', async () => {
      const result = await executionService.delete('non-existent-id');

      expect(result).toBe(false);
    });
  });

  describe('list', () => {
    it('debería listar todas las ejecuciones', async () => {
      const executions = [
        {
          id: 'execution-1',
          proyecto_id: 'project-1',
          fecha_inicio: new Date().toISOString(),
        },
        {
          id: 'execution-2',
          proyecto_id: 'project-2',
          fecha_inicio: new Date().toISOString(),
        },
      ];

      for (const execution of executions) {
        await executionService.create(execution);
      }

      const result = await executionService.list();

      expect(result).toBeDefined();
      expect(result.data).toHaveLength(2);
      expect(result.data[0].id).toBe('execution-1');
      expect(result.data[1].id).toBe('execution-2');
    });

    it('debería retornar una lista vacía si no hay ejecuciones', async () => {
      const result = await executionService.list();

      expect(result).toBeDefined();
      expect(result.data).toHaveLength(0);
    });

    it('debería incluir información de paginación', async () => {
      const executions = [
        {
          id: 'execution-1',
          proyecto_id: 'project-1',
          fecha_inicio: new Date().toISOString(),
        },
      ];

      await executionService.create(executions[0]);

      const result = await executionService.list();

      expect(result.pagination).toBeDefined();
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(20);
      expect(result.pagination.total).toBe(1);
    });

    it('debería respetar el límite de paginación', async () => {
      const executions = Array.from({ length: 25 }, (_, i) => ({
        id: `execution-${i}`,
        proyecto_id: `project-${i}`,
        fecha_inicio: new Date().toISOString(),
      }));

      for (const execution of executions) {
        await executionService.create(execution);
      }

      const result = await executionService.list({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(10);
    });
  });

  describe('getByProjectId', () => {
    it('debería filtrar ejecuciones por proyecto', async () => {
      const executions = [
        {
          id: 'execution-1',
          proyecto_id: 'project-1',
          fecha_inicio: new Date().toISOString(),
        },
        {
          id: 'execution-2',
          proyecto_id: 'project-2',
          fecha_inicio: new Date().toISOString(),
        },
      ];

      await executionService.create(executions[0]);
      await executionService.create(executions[1]);

      const result = await executionService.getByProjectId('project-1');

      expect(result).toBeDefined();
      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe('execution-1');
    });

    it('debería retornar lista vacía si no hay ejecuciones del proyecto', async () => {
      const result = await executionService.getByProjectId('non-existent-project');

      expect(result).toBeDefined();
      expect(result.data).toHaveLength(0);
    });

    it('debería incluir información de paginación', async () => {
      const executions = [
        {
          id: 'execution-1',
          proyecto_id: 'project-1',
          fecha_inicio: new Date().toISOString(),
        },
      ];

      await executionService.create(executions[0]);

      const result = await executionService.getByProjectId('project-1');

      expect(result.pagination).toBeDefined();
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(20);
      expect(result.pagination.total).toBe(1);
    });
  });

  describe('getLatestByProjectId', () => {
    it('debería obtener la última ejecución de un proyecto', async () => {
      const executions = [
        {
          id: 'execution-1',
          proyecto_id: 'project-1',
          fecha_inicio: '2024-01-01T00:00:00.000Z',
        },
        {
          id: 'execution-2',
          proyecto_id: 'project-1',
          fecha_inicio: '2024-01-02T00:00:00.000Z',
        },
      ];

      await executionService.create(executions[0]);
      await executionService.create(executions[1]);

      const result = await executionService.getLatestByProjectId('project-1');

      expect(result).toBeDefined();
      expect(result?.id).toBe('execution-2');
    });

    it('debería retornar null si no hay ejecuciones del proyecto', async () => {
      const result = await executionService.getLatestByProjectId('non-existent-project');

      expect(result).toBeNull();
    });
  });

  describe('exists', () => {
    it('debería retornar true si la ejecución existe', async () => {
      const input = {
        id: 'test-execution-id',
        proyecto_id: 'test-project-id',
        fecha_inicio: new Date().toISOString(),
      };

      await executionService.create(input);
      const result = await executionService.exists(input.id);

      expect(result).toBe(true);
    });

    it('debería retornar false si la ejecución no existe', async () => {
      const result = await executionService.exists('non-existent-id');

      expect(result).toBe(false);
    });
  });

  describe('getByEstado', () => {
    it('debería filtrar ejecuciones por estado', async () => {
      const executions = [
        {
          id: 'execution-1',
          proyecto_id: 'project-1',
          fecha_inicio: new Date().toISOString(),
        },
        {
          id: 'execution-2',
          proyecto_id: 'project-2',
          fecha_inicio: new Date().toISOString(),
        },
      ];

      await executionService.create(executions[0]);
      await executionService.create(executions[1]);

      await executionService.update('execution-1', { estado: 'finalizada_correctamente' });

      const result = await executionService.getByEstado('finalizada_correctamente');

      expect(result).toBeDefined();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('execution-1');
    });

    it('debería retornar lista vacía si no hay ejecuciones con el estado', async () => {
      const result = await executionService.getByEstado('finalizada_correctamente');

      expect(result).toBeDefined();
      expect(result).toHaveLength(0);
    });
  });

  describe('hasActiveExecution', () => {
    it('debería detectar ejecución activa de un proyecto', async () => {
      const input = {
        id: 'test-execution-id',
        proyecto_id: 'test-project-id',
        fecha_inicio: new Date().toISOString(),
      };

      await executionService.create(input);
      const result = await executionService.hasActiveExecution('test-project-id');

      expect(result).toBe(true);
    });

    it('debería retornar false si no hay ejecución activa', async () => {
      const input = {
        id: 'test-execution-id',
        proyecto_id: 'test-project-id',
        fecha_inicio: new Date().toISOString(),
      };

      await executionService.create(input);
      await executionService.update(input.id, { estado: 'finalizada_correctamente' });

      const result = await executionService.hasActiveExecution('test-project-id');

      expect(result).toBe(false);
    });

    it('debería retornar false si el proyecto no tiene ejecuciones', async () => {
      const result = await executionService.hasActiveExecution('non-existent-project');

      expect(result).toBe(false);
    });
  });
});
