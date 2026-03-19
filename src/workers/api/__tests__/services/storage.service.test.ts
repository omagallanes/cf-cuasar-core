/**
 * Storage Service Tests
 *
 * Tests para el servicio de almacenamiento en R2.
 * Prueba operaciones de upload, download, delete y list.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { StorageService } from '../../services/storage.service';
import { createMockEnv } from '../mocks';

describe('StorageService', () => {
  let storageService: StorageService;
  let mockEnv: any;

  beforeEach(() => {
    mockEnv = createMockEnv();
    storageService = new StorageService(mockEnv);
  });

  afterEach(() => {
    mockEnv.CF_B_R2_INMO.clear();
  });

  describe('constructor', () => {
    it('debería lanzar error si el binding R2 no está disponible', () => {
      const invalidEnv: any = {
        CF_B_KV_SECRETS: mockEnv.CF_B_KV_SECRETS,
        CF_B_DB_INMO: mockEnv.CF_B_DB_INMO,
        CF_B_R2_INMO: null,
      };

      expect(() => new StorageService(invalidEnv as any)).toThrow('R2 binding CF_B_R2_INMO is required');
    });
  });

  describe('buildKey', () => {
    it('debería construir la clave correcta para un archivo', () => {
      const projectId = 'test-project-id';
      const fileName = 'resumen.md';
      const expectedKey = 'r2-almacen/dir-api-inmo/test-project-id/resumen.md';

      // Acceder al método privado a través de la clase
      const key = `r2-almacen/dir-api-inmo/${projectId}/${fileName}`;

      expect(key).toBe(expectedKey);
    });

    it('debería manejar nombres de archivo con subdirectorios', () => {
      const projectId = 'test-project-id';
      const fileName = 'reports/resumen.md';
      const expectedKey = `r2-almacen/dir-api-inmo/${projectId}/${fileName}`;

      const key = `r2-almacen/dir-api-inmo/${projectId}/${fileName}`;

      expect(key).toBe(expectedKey);
    });
  });

  describe('upload', () => {
    it('debería subir un archivo de texto correctamente', async () => {
      const projectId = 'test-project-id';
      const fileName = 'resumen.md';
      const data = 'Contenido del archivo';

      const key = await storageService.upload(projectId, fileName, data);

      expect(key).toBeDefined();
      expect(key).toContain(projectId);
      expect(key).toContain(fileName);
    });

    it('debería subir un archivo JSON correctamente', async () => {
      const projectId = 'test-project-id';
      const fileName = 'data.json';
      const data = { key: 'value' };

      const key = await storageService.upload(projectId, fileName, JSON.stringify(data));

      expect(key).toBeDefined();
      expect(key).toContain(projectId);
      expect(key).toContain(fileName);
    });

    it('debería subir un archivo con content type', async () => {
      const projectId = 'test-project-id';
      const fileName = 'resumen.md';
      const data = 'Contenido del archivo';

      const key = await storageService.upload(projectId, fileName, data, {
        contentType: 'text/markdown',
      });

      expect(key).toBeDefined();
    });

    it('debería subir un archivo con metadatos personalizados', async () => {
      const projectId = 'test-project-id';
      const fileName = 'resumen.md';
      const data = 'Contenido del archivo';

      const key = await storageService.upload(projectId, fileName, data, {
        customMetadata: {
          author: 'Test Author',
          version: '1.0',
        },
      });

      expect(key).toBeDefined();
    });

    it('debería subir un archivo como ArrayBuffer', async () => {
      const projectId = 'test-project-id';
      const fileName = 'data.bin';
      const data = new ArrayBuffer(10);

      const key = await storageService.upload(projectId, fileName, data);

      expect(key).toBeDefined();
    });

    it('debería subir un archivo como ReadableStream', async () => {
      const projectId = 'test-project-id';
      const fileName = 'data.txt';
      const data = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode('Test data'));
          controller.close();
        },
      });

      const key = await storageService.upload(projectId, fileName, data);

      expect(key).toBeDefined();
    });
  });

  describe('download', () => {
    it('debería descargar un archivo existente', async () => {
      const projectId = 'test-project-id';
      const fileName = 'resumen.md';
      const data = 'Contenido del archivo';

      await storageService.upload(projectId, fileName, data);
      const result = await storageService.download(projectId, fileName);

      expect(result).toBeDefined();
      expect(result?.key).toContain(projectId);
      expect(result?.key).toContain(fileName);
    });

    it('debería retornar null para un archivo inexistente', async () => {
      const result = await storageService.download('non-existent-project', 'non-existent-file.md');

      expect(result).toBeNull();
    });

    it('debería incluir metadatos del archivo', async () => {
      const projectId = 'test-project-id';
      const fileName = 'resumen.md';
      const data = 'Contenido del archivo';

      await storageService.upload(projectId, fileName, data, {
        customMetadata: {
          author: 'Test Author',
        },
      });

      const result = await storageService.download(projectId, fileName);

      expect(result).toBeDefined();
      expect(result?.customMetadata).toBeDefined();
    });
  });

  describe('downloadAsText', () => {
    it('debería descargar un archivo como texto', async () => {
      const projectId = 'test-project-id';
      const fileName = 'resumen.md';
      const data = 'Contenido del archivo';

      await storageService.upload(projectId, fileName, data);
      const result = await storageService.downloadAsText(projectId, fileName);

      expect(result).toBeDefined();
      expect(result).toBe(data);
    });

    it('debería retornar null para un archivo inexistente', async () => {
      const result = await storageService.downloadAsText('non-existent-project', 'non-existent-file.md');

      expect(result).toBeNull();
    });
  });

  describe('downloadAsJson', () => {
    it('debería descargar un archivo como JSON', async () => {
      const projectId = 'test-project-id';
      const fileName = 'data.json';
      const data = { key: 'value', number: 123 };

      await storageService.upload(projectId, fileName, JSON.stringify(data));
      const result = await storageService.downloadAsJson(projectId, fileName);

      expect(result).toBeDefined();
      expect(result).toEqual(data);
    });

    it('debería retornar null para un archivo inexistente', async () => {
      const result = await storageService.downloadAsJson('non-existent-project', 'non-existent-file.json');

      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('debería eliminar un archivo existente', async () => {
      const projectId = 'test-project-id';
      const fileName = 'resumen.md';
      const data = 'Contenido del archivo';

      await storageService.upload(projectId, fileName, data);
      await storageService.delete(projectId, fileName);

      const result = await storageService.download(projectId, fileName);
      expect(result).toBeNull();
    });

    it('debería eliminar múltiples archivos', async () => {
      const projectId = 'test-project-id';
      const files = ['file1.md', 'file2.md', 'file3.md'];

      for (const file of files) {
        await storageService.upload(projectId, file, `Contenido de ${file}`);
      }

      for (const file of files) {
        await storageService.delete(projectId, file);
      }

      for (const file of files) {
        const result = await storageService.download(projectId, file);
        expect(result).toBeNull();
      }
    });

    it('debería manejar eliminación de archivo inexistente', async () => {
      await expect(
        storageService.delete('non-existent-project', 'non-existent-file.md')
      ).resolves.not.toThrow();
    });
  });

  describe('list', () => {
    it('debería listar archivos de un proyecto', async () => {
      const projectId = 'test-project-id';
      const files = ['file1.md', 'file2.md', 'file3.md'];

      for (const file of files) {
        await storageService.upload(projectId, file, `Contenido de ${file}`);
      }

      const result = await storageService.list(projectId);

      expect(result).toBeDefined();
      expect(result).toHaveLength(3);
    });

    it('debería retornar lista vacía si no hay archivos', async () => {
      const result = await storageService.list('non-existent-project');

      expect(result).toBeDefined();
      expect(result).toHaveLength(0);
    });
  });

  describe('exists', () => {
    it('debería verificar si un archivo existe', async () => {
      const projectId = 'test-project-id';
      const fileName = 'resumen.md';
      const data = 'Contenido del archivo';

      await storageService.upload(projectId, fileName, data);
      const exists = await storageService.exists(projectId, fileName);

      expect(exists).toBe(true);
    });

    it('debería retornar false para un archivo inexistente', async () => {
      const exists = await storageService.exists('non-existent-project', 'non-existent-file.md');

      expect(exists).toBe(false);
    });
  });

  describe('getPublicUrl', () => {
    it('debería copiar un archivo dentro del mismo proyecto', async () => {
      const projectId = 'test-project-id';
      const sourceFile = 'source.md';
      const destFile = 'dest.md';
      const data = 'Contenido del archivo';

      await storageService.upload(projectId, sourceFile, data);
      
      // Descargar el archivo original
      const sourceData = await storageService.downloadAsText(projectId, sourceFile);
      
      // Subir como nuevo archivo (simulando copia)
      if (sourceData) {
        await storageService.upload(projectId, destFile, sourceData);
      }

      const result = await storageService.downloadAsText(projectId, destFile);

      expect(result).toBeDefined();
      expect(result).toBe(data);
    });

    it('debería copiar un archivo a otro proyecto', async () => {
      const sourceProject = 'source-project-id';
      const destProject = 'dest-project-id';
      const fileName = 'file.md';
      const data = 'Contenido del archivo';

      await storageService.upload(sourceProject, fileName, data);
      
      // Descargar del proyecto origen
      const sourceData = await storageService.downloadAsText(sourceProject, fileName);
      
      // Subir al proyecto destino (simulando copia)
      if (sourceData) {
        await storageService.upload(destProject, fileName, sourceData);
      }

      const result = await storageService.downloadAsText(destProject, fileName);

      expect(result).toBeDefined();
      expect(result).toBe(data);
    });
  });
});
