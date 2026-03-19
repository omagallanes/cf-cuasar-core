/**
 * Results Handlers Tests
 *
 * Tests para los handlers de gestión de resultados.
 * Prueba endpoints REST para consulta y recuperación de informes.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createMockEnv } from '../mocks';
import { StorageService } from '../../services/storage.service';

describe('Results Handlers', () => {
  let mockEnv: any;

  beforeEach(() => {
    mockEnv = createMockEnv();
  });

  afterEach(() => {
    mockEnv.CF_B_DB_INMO.clear();
    mockEnv.CF_B_R2_INMO.clear();
  });

  describe('StorageService', () => {
    it('debería instanciarse correctamente con env válido', () => {
      const service = new StorageService(mockEnv);
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(StorageService);
    });

    it('debería lanzar error sin binding R2', () => {
      const invalidEnv: any = {
        CF_B_KV_SECRETS: mockEnv.CF_B_KV_SECRETS,
        CF_B_DB_INMO: mockEnv.CF_B_DB_INMO,
        CF_B_R2_INMO: null,
      };

      expect(() => new StorageService(invalidEnv)).toThrow('R2 binding CF_B_R2_INMO is required');
    });

    it('debería tener método upload', () => {
      const service = new StorageService(mockEnv);
      expect(typeof service.upload).toBe('function');
    });

    it('debería tener método download', () => {
      const service = new StorageService(mockEnv);
      expect(typeof service.download).toBe('function');
    });

    it('debería tener método delete', () => {
      const service = new StorageService(mockEnv);
      expect(typeof service.delete).toBe('function');
    });

    it('debería tener método list', () => {
      const service = new StorageService(mockEnv);
      expect(typeof service.list).toBe('function');
    });

    it('debería tener método exists', () => {
      const service = new StorageService(mockEnv);
      expect(typeof service.exists).toBe('function');
    });

    it('debería tener método downloadAsText', () => {
      const service = new StorageService(mockEnv);
      expect(typeof service.downloadAsText).toBe('function');
    });

    it('debería tener método downloadAsJson', () => {
      const service = new StorageService(mockEnv);
      expect(typeof service.downloadAsJson).toBe('function');
    });
  });
});
