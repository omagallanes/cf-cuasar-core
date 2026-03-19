/**
 * Workflows Handlers Tests
 *
 * Tests para los handlers de gestión de workflows.
 * Prueba endpoints REST para ejecución y consulta de workflows.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createMockEnv } from '../mocks';
import { ExecutionService } from '../../services/execution.service';

describe('Workflows Handlers', () => {
  let mockEnv: any;

  beforeEach(() => {
    mockEnv = createMockEnv();
  });

  afterEach(() => {
    mockEnv.CF_B_DB_INMO.clear();
    mockEnv.CF_B_R2_INMO.clear();
  });

  describe('ExecutionService', () => {
    it('debería instanciarse correctamente con env válido', () => {
      const service = new ExecutionService(mockEnv);
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(ExecutionService);
    });

    it('debería lanzar error sin binding D1', () => {
      const invalidEnv: any = {
        CF_B_KV_SECRETS: mockEnv.CF_B_KV_SECRETS,
        CF_B_DB_INMO: null,
        CF_B_R2_INMO: mockEnv.CF_B_R2_INMO,
      };

      expect(() => new ExecutionService(invalidEnv)).toThrow('D1 binding CF_B_DB_INMO is required');
    });

    it('debería tener método create', () => {
      const service = new ExecutionService(mockEnv);
      expect(typeof service.create).toBe('function');
    });

    it('debería tener método read', () => {
      const service = new ExecutionService(mockEnv);
      expect(typeof service.read).toBe('function');
    });

    it('debería tener método update', () => {
      const service = new ExecutionService(mockEnv);
      expect(typeof service.update).toBe('function');
    });

    it('debería tener método delete', () => {
      const service = new ExecutionService(mockEnv);
      expect(typeof service.delete).toBe('function');
    });

    it('debería tener método list', () => {
      const service = new ExecutionService(mockEnv);
      expect(typeof service.list).toBe('function');
    });

    it('debería tener método exists', () => {
      const service = new ExecutionService(mockEnv);
      expect(typeof service.exists).toBe('function');
    });

    it('debería tener método getByProjectId', () => {
      const service = new ExecutionService(mockEnv);
      expect(typeof service.getByProjectId).toBe('function');
    });

    it('debería tener método getLatestByProjectId', () => {
      const service = new ExecutionService(mockEnv);
      expect(typeof service.getLatestByProjectId).toBe('function');
    });

    it('debería tener método getByEstado', () => {
      const service = new ExecutionService(mockEnv);
      expect(typeof service.getByEstado).toBe('function');
    });

    it('debería tener método hasActiveExecution', () => {
      const service = new ExecutionService(mockEnv);
      expect(typeof service.hasActiveExecution).toBe('function');
    });
  });
});
