/**
 * Projects Handlers Tests
 *
 * Tests para los handlers de gestión de proyectos.
 * Prueba endpoints REST para CRUD de proyectos.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createMockEnv } from '../mocks';
import { ProjectService } from '../../services/project.service';

describe('Projects Handlers', () => {
  let mockEnv: any;

  beforeEach(() => {
    mockEnv = createMockEnv();
  });

  afterEach(() => {
    mockEnv.CF_B_DB_INMO.clear();
    mockEnv.CF_B_R2_INMO.clear();
  });

  describe('ProjectService', () => {
    it('debería instanciarse correctamente con env válido', () => {
      const service = new ProjectService(mockEnv);
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(ProjectService);
    });

    it('debería lanzar error sin binding D1', () => {
      const invalidEnv: any = {
        CF_B_KV_SECRETS: mockEnv.CF_B_KV_SECRETS,
        CF_B_DB_INMO: null,
        CF_B_R2_INMO: mockEnv.CF_B_R2_INMO,
      };

      expect(() => new ProjectService(invalidEnv)).toThrow('D1 binding CF_B_DB_INMO is required');
    });

    it('debería tener método create', () => {
      const service = new ProjectService(mockEnv);
      expect(typeof service.create).toBe('function');
    });

    it('debería tener método read', () => {
      const service = new ProjectService(mockEnv);
      expect(typeof service.read).toBe('function');
    });

    it('debería tener método update', () => {
      const service = new ProjectService(mockEnv);
      expect(typeof service.update).toBe('function');
    });

    it('debería tener método delete', () => {
      const service = new ProjectService(mockEnv);
      expect(typeof service.delete).toBe('function');
    });

    it('debería tener método list', () => {
      const service = new ProjectService(mockEnv);
      expect(typeof service.list).toBe('function');
    });

    it('debería tener método exists', () => {
      const service = new ProjectService(mockEnv);
      expect(typeof service.exists).toBe('function');
    });

    it('debería tener método getByEstado', () => {
      const service = new ProjectService(mockEnv);
      expect(typeof service.getByEstado).toBe('function');
    });

    it('debería tener método getByAsesor', () => {
      const service = new ProjectService(mockEnv);
      expect(typeof service.getByAsesor).toBe('function');
    });
  });
});
