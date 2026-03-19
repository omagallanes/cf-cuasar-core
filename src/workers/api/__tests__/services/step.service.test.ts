/**
 * Step Service Tests
 *
 * Tests para el servicio de gestión de pasos de workflows.
 * Prueba operaciones CRUD y consultas especializadas.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { StepService } from '../../services/step.service';
import { createMockEnv } from '../mocks';

describe('StepService', () => {
  let stepService: StepService;
  let mockEnv: any;

  beforeEach(() => {
    mockEnv = createMockEnv();
    stepService = new StepService(mockEnv);
  });

  afterEach(() => {
    mockEnv.CF_B_DB_INMO.clear();
  });

  describe('create', () => {
    it('debería crear un nuevo paso correctamente', async () => {
      const input = {
        id: 'test-step-id',
        ejecucion_id: 'test-execution-id',
        tipo_paso: 'resumen' as const,
        orden: 1,
        fecha_inicio: new Date().toISOString(),
      };

      const result = await stepService.create(input);

      expect(result).toBeDefined();
      expect(result.id).toBe(input.id);
      expect(result.ejecucion_id).toBe(input.ejecucion_id);
      expect(result.tipo_paso).toBe(input.tipo_paso);
      expect(result.orden).toBe(input.orden);
      expect(result.estado).toBe('pendiente');
    });

    it('debería lanzar error si el binding D1 no está disponible', () => {
      const invalidEnv: any = {
        CF_B_KV_SECRETS: mockEnv.CF_B_KV_SECRETS,
        CF_B_DB_INMO: null,
        CF_B_R2_INMO: mockEnv.CF_B_R2_INMO,
      };

      expect(() => new StepService(invalidEnv as any)).toThrow('D1 binding CF_B_DB_INMO is required');
    });

    it('debería inicializar campos opcionales como null', async () => {
      const input = {
        id: 'test-step-id',
        ejecucion_id: 'test-execution-id',
        tipo_paso: 'resumen' as const,
        orden: 1,
        fecha_inicio: new Date().toISOString(),
      };

      const result = await stepService.create(input);

      expect(result.fecha_fin).toBeNull();
      expect(result.error_mensaje).toBeNull();
      expect(result.ruta_archivo_r2).toBeNull();
    });
  });

  describe('read', () => {
    it('debería leer un paso existente por ID', async () => {
      const input = {
        id: 'test-step-id',
        ejecucion_id: 'test-execution-id',
        tipo_paso: 'resumen' as const,
        orden: 1,
        fecha_inicio: new Date().toISOString(),
      };

      await stepService.create(input);
      const result = await stepService.read(input.id);

      expect(result).toBeDefined();
      expect(result?.id).toBe(input.id);
      expect(result?.ejecucion_id).toBe(input.ejecucion_id);
    });

    it('debería retornar null para un paso inexistente', async () => {
      const result = await stepService.read('non-existent-id');

      expect(result).toBeNull();
    });

    it('debería retornar todos los campos del paso', async () => {
      const input = {
        id: 'test-step-id',
        ejecucion_id: 'test-execution-id',
        tipo_paso: 'resumen' as const,
        orden: 1,
        fecha_inicio: new Date().toISOString(),
      };

      await stepService.create(input);
      const result = await stepService.read(input.id);

      expect(result).toBeDefined();
      expect(result?.id).toBeDefined();
      expect(result?.ejecucion_id).toBeDefined();
      expect(result?.tipo_paso).toBeDefined();
      expect(result?.orden).toBeDefined();
      expect(result?.estado).toBeDefined();
      expect(result?.fecha_inicio).toBeDefined();
      expect(result?.fecha_fin).toBeDefined();
      expect(result?.error_mensaje).toBeDefined();
      expect(result?.ruta_archivo_r2).toBeDefined();
    });
  });

  describe('update', () => {
    it('debería actualizar un paso existente', async () => {
      const input = {
        id: 'test-step-id',
        ejecucion_id: 'test-execution-id',
        tipo_paso: 'resumen' as const,
        orden: 1,
        fecha_inicio: new Date().toISOString(),
      };

      await stepService.create(input);

      const updateData = {
        estado: 'correcto' as const,
        fecha_fin: new Date().toISOString(),
        ruta_archivo_r2: 'r2-almacen/dir-api-inmo/test-project/resumen.md',
      };

      const result = await stepService.update(input.id, updateData);

      expect(result).toBeDefined();
      expect(result?.estado).toBe(updateData.estado);
      expect(result?.fecha_fin).toBe(updateData.fecha_fin);
      expect(result?.ruta_archivo_r2).toBe(updateData.ruta_archivo_r2);
    });

    it('debería retornar null al actualizar un paso inexistente', async () => {
      const result = await stepService.update('non-existent-id', { estado: 'correcto' });

      expect(result).toBeNull();
    });

    it('debería actualizar solo los campos proporcionados', async () => {
      const input = {
        id: 'test-step-id',
        ejecucion_id: 'test-execution-id',
        tipo_paso: 'resumen' as const,
        orden: 1,
        fecha_inicio: new Date().toISOString(),
      };

      await stepService.create(input);

      const updateData = {
        estado: 'en_ejecucion' as const,
      };

      const result = await stepService.update(input.id, updateData);

      expect(result).toBeDefined();
      expect(result?.estado).toBe(updateData.estado);
      expect(result?.fecha_fin).toBeNull();
    });

    it('debería actualizar el estado del paso', async () => {
      const input = {
        id: 'test-step-id',
        ejecucion_id: 'test-execution-id',
        tipo_paso: 'resumen' as const,
        orden: 1,
        fecha_inicio: new Date().toISOString(),
      };

      await stepService.create(input);

      const result = await stepService.update(input.id, { estado: 'en_ejecucion' });

      expect(result).toBeDefined();
      expect(result?.estado).toBe('en_ejecucion');
    });

    it('debería actualizar el mensaje de error', async () => {
      const input = {
        id: 'test-step-id',
        ejecucion_id: 'test-execution-id',
        tipo_paso: 'resumen' as const,
        orden: 1,
        fecha_inicio: new Date().toISOString(),
      };

      await stepService.create(input);

      const result = await stepService.update(input.id, {
        estado: 'error',
        error_mensaje: 'Error en el paso',
      });

      expect(result).toBeDefined();
      expect(result?.estado).toBe('error');
      expect(result?.error_mensaje).toBe('Error en el paso');
    });
  });

  describe('delete', () => {
    it('debería eliminar un paso existente', async () => {
      const input = {
        id: 'test-step-id',
        ejecucion_id: 'test-execution-id',
        tipo_paso: 'resumen' as const,
        orden: 1,
        fecha_inicio: new Date().toISOString(),
      };

      await stepService.create(input);
      await stepService.delete(input.id);

      const result = await stepService.read(input.id);
      expect(result).toBeNull();
    });

    it('debería retornar true al eliminar un paso existente', async () => {
      const input = {
        id: 'test-step-id',
        ejecucion_id: 'test-execution-id',
        tipo_paso: 'resumen' as const,
        orden: 1,
        fecha_inicio: new Date().toISOString(),
      };

      await stepService.create(input);
      const result = await stepService.delete(input.id);

      expect(result).toBe(true);
    });

    it('debería retornar false al eliminar un paso inexistente', async () => {
      const result = await stepService.delete('non-existent-id');

      expect(result).toBe(false);
    });
  });

  describe('list', () => {
    it('debería listar todos los pasos', async () => {
      const steps = [
        {
          id: 'step-1',
          ejecucion_id: 'execution-1',
          tipo_paso: 'resumen' as const,
          orden: 1,
          fecha_inicio: new Date().toISOString(),
        },
        {
          id: 'step-2',
          ejecucion_id: 'execution-2',
          tipo_paso: 'datos_clave' as const,
          orden: 2,
          fecha_inicio: new Date().toISOString(),
        },
      ];

      for (const step of steps) {
        await stepService.create(step);
      }

      const result = await stepService.list();

      expect(result).toBeDefined();
      expect(result.data).toHaveLength(2);
      expect(result.data[0].id).toBe('step-1');
      expect(result.data[1].id).toBe('step-2');
    });

    it('debería retornar una lista vacía si no hay pasos', async () => {
      const result = await stepService.list();

      expect(result).toBeDefined();
      expect(result.data).toHaveLength(0);
    });

    it('debería incluir información de paginación', async () => {
      const steps = [
        {
          id: 'step-1',
          ejecucion_id: 'execution-1',
          tipo_paso: 'resumen' as const,
          orden: 1,
          fecha_inicio: new Date().toISOString(),
        },
      ];

      await stepService.create(steps[0]);

      const result = await stepService.list();

      expect(result.pagination).toBeDefined();
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(20);
      expect(result.pagination.total).toBe(1);
    });
  });

  describe('getByExecutionId', () => {
    it('debería filtrar pasos por ejecución', async () => {
      const steps = [
        {
          id: 'step-1',
          ejecucion_id: 'execution-1',
          tipo_paso: 'resumen' as const,
          orden: 1,
          fecha_inicio: new Date().toISOString(),
        },
        {
          id: 'step-2',
          ejecucion_id: 'execution-2',
          tipo_paso: 'datos_clave' as const,
          orden: 2,
          fecha_inicio: new Date().toISOString(),
        },
      ];

      await stepService.create(steps[0]);
      await stepService.create(steps[1]);

      const result = await stepService.getByExecutionId('execution-1');

      expect(result).toBeDefined();
      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe('step-1');
    });

    it('debería ordenar pasos por orden', async () => {
      const steps = [
        {
          id: 'step-1',
          ejecucion_id: 'execution-1',
          tipo_paso: 'resumen' as const,
          orden: 2,
          fecha_inicio: new Date().toISOString(),
        },
        {
          id: 'step-2',
          ejecucion_id: 'execution-1',
          tipo_paso: 'datos_clave' as const,
          orden: 1,
          fecha_inicio: new Date().toISOString(),
        },
      ];

      await stepService.create(steps[0]);
      await stepService.create(steps[1]);

      const result = await stepService.getByExecutionId('execution-1');

      expect(result).toBeDefined();
      expect(result.data).toHaveLength(2);
      expect(result.data[0].orden).toBe(1);
      expect(result.data[1].orden).toBe(2);
    });

    it('debería incluir información de paginación', async () => {
      const steps = [
        {
          id: 'step-1',
          ejecucion_id: 'execution-1',
          tipo_paso: 'resumen' as const,
          orden: 1,
          fecha_inicio: new Date().toISOString(),
        },
      ];

      await stepService.create(steps[0]);

      const result = await stepService.getByExecutionId('execution-1');

      expect(result.pagination).toBeDefined();
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(20);
      expect(result.pagination.total).toBe(1);
    });

    it('debería retornar lista vacía si no hay pasos de la ejecución', async () => {
      const result = await stepService.getByExecutionId('non-existent-execution');

      expect(result).toBeDefined();
      expect(result.data).toHaveLength(0);
    });
  });

  describe('getAllByExecutionId', () => {
    it('debería obtener todos los pasos de una ejecución sin paginación', async () => {
      const steps = [
        {
          id: 'step-1',
          ejecucion_id: 'execution-1',
          tipo_paso: 'resumen' as const,
          orden: 1,
          fecha_inicio: new Date().toISOString(),
        },
        {
          id: 'step-2',
          ejecucion_id: 'execution-1',
          tipo_paso: 'datos_clave' as const,
          orden: 2,
          fecha_inicio: new Date().toISOString(),
        },
      ];

      await stepService.create(steps[0]);
      await stepService.create(steps[1]);

      const result = await stepService.getAllByExecutionId('execution-1');

      expect(result).toBeDefined();
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('step-1');
      expect(result[1].id).toBe('step-2');
    });

    it('debería ordenar pasos por orden', async () => {
      const steps = [
        {
          id: 'step-1',
          ejecucion_id: 'execution-1',
          tipo_paso: 'resumen' as const,
          orden: 2,
          fecha_inicio: new Date().toISOString(),
        },
        {
          id: 'step-2',
          ejecucion_id: 'execution-1',
          tipo_paso: 'datos_clave' as const,
          orden: 1,
          fecha_inicio: new Date().toISOString(),
        },
      ];

      await stepService.create(steps[0]);
      await stepService.create(steps[1]);

      const result = await stepService.getAllByExecutionId('execution-1');

      expect(result).toBeDefined();
      expect(result).toHaveLength(2);
      expect(result[0].orden).toBe(1);
      expect(result[1].orden).toBe(2);
    });

    it('debería retornar lista vacía si no hay pasos de la ejecución', async () => {
      const result = await stepService.getAllByExecutionId('non-existent-execution');

      expect(result).toBeDefined();
      expect(result).toHaveLength(0);
    });
  });

  describe('exists', () => {
    it('debería retornar true si el paso existe', async () => {
      const input = {
        id: 'test-step-id',
        ejecucion_id: 'test-execution-id',
        tipo_paso: 'resumen' as const,
        orden: 1,
        fecha_inicio: new Date().toISOString(),
      };

      await stepService.create(input);
      const result = await stepService.exists(input.id);

      expect(result).toBe(true);
    });

    it('debería retornar false si el paso no existe', async () => {
      const result = await stepService.exists('non-existent-id');

      expect(result).toBe(false);
    });
  });

  describe('getByExecutionAndType', () => {
    it('debería obtener un paso por ejecución y tipo', async () => {
      const steps = [
        {
          id: 'step-1',
          ejecucion_id: 'execution-1',
          tipo_paso: 'resumen' as const,
          orden: 1,
          fecha_inicio: new Date().toISOString(),
        },
        {
          id: 'step-2',
          ejecucion_id: 'execution-1',
          tipo_paso: 'datos_clave' as const,
          orden: 2,
          fecha_inicio: new Date().toISOString(),
        },
      ];

      await stepService.create(steps[0]);
      await stepService.create(steps[1]);

      const result = await stepService.getByExecutionAndType('execution-1', 'resumen');

      expect(result).toBeDefined();
      expect(result?.id).toBe('step-1');
      expect(result?.tipo_paso).toBe('resumen');
    });

    it('debería retornar null si el paso no existe', async () => {
      const result = await stepService.getByExecutionAndType('non-existent-execution', 'resumen');

      expect(result).toBeNull();
    });
  });

  describe('getByEstado', () => {
    it('debería filtrar pasos por estado', async () => {
      const steps = [
        {
          id: 'step-1',
          ejecucion_id: 'execution-1',
          tipo_paso: 'resumen' as const,
          orden: 1,
          fecha_inicio: new Date().toISOString(),
        },
        {
          id: 'step-2',
          ejecucion_id: 'execution-2',
          tipo_paso: 'datos_clave' as const,
          orden: 2,
          fecha_inicio: new Date().toISOString(),
        },
      ];

      await stepService.create(steps[0]);
      await stepService.create(steps[1]);

      await stepService.update('step-1', { estado: 'correcto' });

      const result = await stepService.getByEstado('correcto');

      expect(result).toBeDefined();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('step-1');
    });

    it('debería retornar lista vacía si no hay pasos con el estado', async () => {
      const result = await stepService.getByEstado('correcto');

      expect(result).toBeDefined();
      expect(result).toHaveLength(0);
    });
  });

  describe('updateState', () => {
    it('debería actualizar el estado de un paso', async () => {
      const input = {
        id: 'test-step-id',
        ejecucion_id: 'test-execution-id',
        tipo_paso: 'resumen' as const,
        orden: 1,
        fecha_inicio: new Date().toISOString(),
      };

      await stepService.create(input);

      const result = await stepService.updateState(input.id, 'en_ejecucion');

      expect(result).toBeDefined();
      expect(result?.estado).toBe('en_ejecucion');
    });

    it('debería actualizar el estado con fecha de finalización', async () => {
      const input = {
        id: 'test-step-id',
        ejecucion_id: 'test-execution-id',
        tipo_paso: 'resumen' as const,
        orden: 1,
        fecha_inicio: new Date().toISOString(),
      };

      await stepService.create(input);
      const fechaFin = new Date().toISOString();

      const result = await stepService.updateState(input.id, 'correcto', fechaFin);

      expect(result).toBeDefined();
      expect(result?.estado).toBe('correcto');
      expect(result?.fecha_fin).toBe(fechaFin);
    });

    it('debería actualizar el estado con mensaje de error', async () => {
      const input = {
        id: 'test-step-id',
        ejecucion_id: 'test-execution-id',
        tipo_paso: 'resumen' as const,
        orden: 1,
        fecha_inicio: new Date().toISOString(),
      };

      await stepService.create(input);

      const result = await stepService.updateState(input.id, 'error', undefined, 'Error en el paso');

      expect(result).toBeDefined();
      expect(result?.estado).toBe('error');
      expect(result?.error_mensaje).toBe('Error en el paso');
    });

    it('debería retornar null si el paso no existe', async () => {
      const result = await stepService.updateState('non-existent-id', 'en_ejecucion');

      expect(result).toBeNull();
    });
  });
});
