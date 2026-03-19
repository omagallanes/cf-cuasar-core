/**
 * Project Service Tests
 *
 * Tests para el servicio de gestión de proyectos.
 * Prueba operaciones CRUD y consultas especializadas.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ProjectService } from '../../services/project.service';
import { createMockEnv } from '../mocks';

describe('ProjectService', () => {
  let projectService: ProjectService;
  let mockEnv: any;

  beforeEach(() => {
    mockEnv = createMockEnv();
    projectService = new ProjectService(mockEnv);
  });

  afterEach(() => {
    mockEnv.CF_B_DB_INMO.clear();
  });

  describe('create', () => {
    it('debería crear un nuevo proyecto correctamente', async () => {
      const input = {
        id: 'test-project-id',
        nombre: 'Proyecto de prueba',
        descripcion: 'Descripción del proyecto',
        i_json: JSON.stringify({ titulo_anuncio: 'Test', descripcion: 'Test', tipo_operacion: 'venta', tipo_inmueble: 'piso', precio: '100000', ciudad: 'València' }),
        asesor_responsable: 'Asesor Test',
      };

      const result = await projectService.create(input);

      expect(result).toBeDefined();
      expect(result.id).toBe(input.id);
      expect(result.nombre).toBe(input.nombre);
      expect(result.descripcion).toBe(input.descripcion);
      expect(result.estado).toBe('creado');
      expect(result.asesor_responsable).toBe(input.asesor_responsable);
    });

    it('debería lanzar error si el binding D1 no está disponible', () => {
      const invalidEnv: any = {
        CF_B_KV_SECRETS: mockEnv.CF_B_KV_SECRETS,
        CF_B_DB_INMO: null,
        CF_B_R2_INMO: mockEnv.CF_B_R2_INMO,
      };

      expect(() => new ProjectService(invalidEnv as any)).toThrow('D1 binding CF_B_DB_INMO is required');
    });

    it('debería generar fechas de creación y actualización', async () => {
      const input = {
        id: 'test-project-id',
        nombre: 'Proyecto de prueba',
        descripcion: null,
        i_json: JSON.stringify({ titulo_anuncio: 'Test', descripcion: 'Test', tipo_operacion: 'venta', tipo_inmueble: 'piso', precio: '100000', ciudad: 'València' }),
        asesor_responsable: null,
      };

      const result = await projectService.create(input);

      expect(result.fecha_creacion).toBeDefined();
      expect(result.fecha_actualizacion).toBeDefined();
      expect(result.fecha_creacion).toBe(result.fecha_actualizacion);
    });

    it('debería inicializar campos opcionales como null', async () => {
      const input = {
        id: 'test-project-id',
        nombre: 'Proyecto de prueba',
        descripcion: null,
        i_json: JSON.stringify({ titulo_anuncio: 'Test', descripcion: 'Test', tipo_operacion: 'venta', tipo_inmueble: 'piso', precio: '100000', ciudad: 'València' }),
        asesor_responsable: null,
      };

      const result = await projectService.create(input);

      expect(result.descripcion).toBeNull();
      expect(result.asesor_responsable).toBeNull();
      expect(result.fecha_analisis_inicio).toBeNull();
      expect(result.fecha_analisis_fin).toBeNull();
      expect(result.i_json_url).toBeNull();
    });
  });

  describe('read', () => {
    it('debería leer un proyecto existente por ID', async () => {
      const input = {
        id: 'test-project-id',
        nombre: 'Proyecto de prueba',
        descripcion: 'Descripción del proyecto',
        i_json: JSON.stringify({ titulo_anuncio: 'Test', descripcion: 'Test', tipo_operacion: 'venta', tipo_inmueble: 'piso', precio: '100000', ciudad: 'València' }),
        asesor_responsable: 'Asesor Test',
      };

      await projectService.create(input);
      const result = await projectService.read(input.id);

      expect(result).toBeDefined();
      expect(result?.id).toBe(input.id);
      expect(result?.nombre).toBe(input.nombre);
    });

    it('debería retornar null para un proyecto inexistente', async () => {
      const result = await projectService.read('non-existent-id');

      expect(result).toBeNull();
    });

    it('debería retornar todos los campos del proyecto', async () => {
      const input = {
        id: 'test-project-id',
        nombre: 'Proyecto de prueba',
        descripcion: 'Descripción del proyecto',
        i_json: JSON.stringify({ titulo_anuncio: 'Test', descripcion: 'Test', tipo_operacion: 'venta', tipo_inmueble: 'piso', precio: '100000', ciudad: 'València' }),
        asesor_responsable: 'Asesor Test',
      };

      await projectService.create(input);
      const result = await projectService.read(input.id);

      expect(result).toBeDefined();
      expect(result?.id).toBeDefined();
      expect(result?.nombre).toBeDefined();
      expect(result?.descripcion).toBeDefined();
      expect(result?.i_json).toBeDefined();
      expect(result?.estado).toBeDefined();
      expect(result?.asesor_responsable).toBeDefined();
      expect(result?.fecha_creacion).toBeDefined();
      expect(result?.fecha_actualizacion).toBeDefined();
    });
  });

  describe('update', () => {
    it('debería actualizar un proyecto existente', async () => {
      const input = {
        id: 'test-project-id',
        nombre: 'Proyecto de prueba',
        descripcion: 'Descripción del proyecto',
        i_json: JSON.stringify({ titulo_anuncio: 'Test', descripcion: 'Test', tipo_operacion: 'venta', tipo_inmueble: 'piso', precio: '100000', ciudad: 'València' }),
        asesor_responsable: 'Asesor Test',
      };

      await projectService.create(input);

      const updateData = {
        nombre: 'Proyecto actualizado',
        descripcion: 'Nueva descripción',
      };

      const result = await projectService.update(input.id, updateData);

      expect(result).toBeDefined();
      expect(result?.nombre).toBe(updateData.nombre);
      expect(result?.descripcion).toBe(updateData.descripcion);
    });

    it('debería retornar null al actualizar un proyecto inexistente', async () => {
      const result = await projectService.update('non-existent-id', { nombre: 'Nuevo nombre' });

      expect(result).toBeNull();
    });

    it('debería actualizar solo los campos proporcionados', async () => {
      const input = {
        id: 'test-project-id',
        nombre: 'Proyecto de prueba',
        descripcion: 'Descripción original',
        i_json: JSON.stringify({ titulo_anuncio: 'Test', descripcion: 'Test', tipo_operacion: 'venta', tipo_inmueble: 'piso', precio: '100000', ciudad: 'València' }),
        asesor_responsable: 'Asesor Test',
      };

      await projectService.create(input);

      const updateData = {
        nombre: 'Nombre actualizado',
      };

      const result = await projectService.update(input.id, updateData);

      expect(result).toBeDefined();
      expect(result?.nombre).toBe(updateData.nombre);
      expect(result?.descripcion).toBe('Descripción original');
    });

    it('debería actualizar el estado del proyecto', async () => {
      const input = {
        id: 'test-project-id',
        nombre: 'Proyecto de prueba',
        descripcion: null,
        i_json: JSON.stringify({ titulo_anuncio: 'Test', descripcion: 'Test', tipo_operacion: 'venta', tipo_inmueble: 'piso', precio: '100000', ciudad: 'València' }),
        asesor_responsable: null,
      };

      await projectService.create(input);

      const result = await projectService.update(input.id, { estado: 'procesando_analisis' });

      expect(result).toBeDefined();
      expect(result?.estado).toBe('procesando_analisis');
    });
  });

  describe('delete', () => {
    it('debería eliminar un proyecto existente', async () => {
      const input = {
        id: 'test-project-id',
        nombre: 'Proyecto de prueba',
        descripcion: null,
        i_json: JSON.stringify({ titulo_anuncio: 'Test', descripcion: 'Test', tipo_operacion: 'venta', tipo_inmueble: 'piso', precio: '100000', ciudad: 'València' }),
        asesor_responsable: null,
      };

      await projectService.create(input);
      await projectService.delete(input.id);

      const result = await projectService.read(input.id);
      expect(result).toBeNull();
    });

    it('debería retornar true al eliminar un proyecto existente', async () => {
      const input = {
        id: 'test-project-id',
        nombre: 'Proyecto de prueba',
        descripcion: null,
        i_json: JSON.stringify({ titulo_anuncio: 'Test', descripcion: 'Test', tipo_operacion: 'venta', tipo_inmueble: 'piso', precio: '100000', ciudad: 'València' }),
        asesor_responsable: null,
      };

      await projectService.create(input);
      const result = await projectService.delete(input.id);

      expect(result).toBe(true);
    });

    it('debería retornar false al eliminar un proyecto inexistente', async () => {
      const result = await projectService.delete('non-existent-id');

      expect(result).toBe(false);
    });
  });

  describe('list', () => {
    it('debería listar todos los proyectos', async () => {
      const projects = [
        {
          id: 'project-1',
          nombre: 'Proyecto 1',
          descripcion: null,
          i_json: JSON.stringify({ titulo_anuncio: 'Test', descripcion: 'Test', tipo_operacion: 'venta', tipo_inmueble: 'piso', precio: '100000', ciudad: 'València' }),
          asesor_responsable: null,
        },
        {
          id: 'project-2',
          nombre: 'Proyecto 2',
          descripcion: null,
          i_json: JSON.stringify({ titulo_anuncio: 'Test', descripcion: 'Test', tipo_operacion: 'venta', tipo_inmueble: 'piso', precio: '100000', ciudad: 'València' }),
          asesor_responsable: null,
        },
      ];

      for (const project of projects) {
        await projectService.create(project);
      }

      const result = await projectService.list();

      expect(result).toBeDefined();
      expect(result.data).toHaveLength(2);
      expect(result.data[0].nombre).toBe('Proyecto 1');
      expect(result.data[1].nombre).toBe('Proyecto 2');
    });

    it('debería retornar una lista vacía si no hay proyectos', async () => {
      const result = await projectService.list();

      expect(result).toBeDefined();
      expect(result.data).toHaveLength(0);
    });

    it('debería incluir información de paginación', async () => {
      const projects = [
        {
          id: 'project-1',
          nombre: 'Proyecto 1',
          descripcion: null,
          i_json: JSON.stringify({ titulo_anuncio: 'Test', descripcion: 'Test', tipo_operacion: 'venta', tipo_inmueble: 'piso', precio: '100000', ciudad: 'València' }),
          asesor_responsable: null,
        },
      ];

      await projectService.create(projects[0]);

      const result = await projectService.list();

      expect(result.pagination).toBeDefined();
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(20);
      expect(result.pagination.total).toBe(1);
    });

    it('debería respetar el límite de paginación', async () => {
      const projects = Array.from({ length: 15 }, (_, i) => ({
        id: `project-${i}`,
        nombre: `Proyecto ${i}`,
        descripcion: null,
        i_json: JSON.stringify({ titulo_anuncio: 'Test', descripcion: 'Test', tipo_operacion: 'venta', tipo_inmueble: 'piso', precio: '100000', ciudad: 'València' }),
        asesor_responsable: null,
      }));

      for (const project of projects) {
        await projectService.create(project);
      }

      const result = await projectService.list({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(10);
    });
  });

  describe('getByEstado', () => {
    it('debería filtrar proyectos por estado', async () => {
      const projects = [
        {
          id: 'project-1',
          nombre: 'Proyecto 1',
          descripcion: null,
          i_json: JSON.stringify({ titulo_anuncio: 'Test', descripcion: 'Test', tipo_operacion: 'venta', tipo_inmueble: 'piso', precio: '100000', ciudad: 'València' }),
          asesor_responsable: null,
        },
        {
          id: 'project-2',
          nombre: 'Proyecto 2',
          descripcion: null,
          i_json: JSON.stringify({ titulo_anuncio: 'Test', descripcion: 'Test', tipo_operacion: 'venta', tipo_inmueble: 'piso', precio: '100000', ciudad: 'València' }),
          asesor_responsable: null,
        },
      ];

      await projectService.create(projects[0]);
      await projectService.create(projects[1]);

      await projectService.update('project-1', { estado: 'analisis_finalizado' });

      const result = await projectService.getByEstado('analisis_finalizado');

      expect(result).toBeDefined();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('project-1');
    });

    it('debería retornar lista vacía si no hay proyectos con el estado', async () => {
      const result = await projectService.getByEstado('analisis_finalizado');

      expect(result).toBeDefined();
      expect(result).toHaveLength(0);
    });
  });

  describe('exists', () => {
    it('debería retornar true si el proyecto existe', async () => {
      const input = {
        id: 'test-project-id',
        nombre: 'Proyecto de prueba',
        descripcion: null,
        i_json: JSON.stringify({ titulo_anuncio: 'Test', descripcion: 'Test', tipo_operacion: 'venta', tipo_inmueble: 'piso', precio: '100000', ciudad: 'València' }),
        asesor_responsable: null,
      };

      await projectService.create(input);
      const result = await projectService.exists(input.id);

      expect(result).toBe(true);
    });

    it('debería retornar false si el proyecto no existe', async () => {
      const result = await projectService.exists('non-existent-id');

      expect(result).toBe(false);
    });
  });

  describe('getByAsesor', () => {
    it('debería filtrar proyectos por asesor responsable', async () => {
      const projects = [
        {
          id: 'project-1',
          nombre: 'Proyecto 1',
          descripcion: null,
          i_json: JSON.stringify({ titulo_anuncio: 'Test', descripcion: 'Test', tipo_operacion: 'venta', tipo_inmueble: 'piso', precio: '100000', ciudad: 'València' }),
          asesor_responsable: 'Asesor 1',
        },
        {
          id: 'project-2',
          nombre: 'Proyecto 2',
          descripcion: null,
          i_json: JSON.stringify({ titulo_anuncio: 'Test', descripcion: 'Test', tipo_operacion: 'venta', tipo_inmueble: 'piso', precio: '100000', ciudad: 'València' }),
          asesor_responsable: 'Asesor 2',
        },
      ];

      await projectService.create(projects[0]);
      await projectService.create(projects[1]);

      const result = await projectService.getByAsesor('Asesor 1');

      expect(result).toBeDefined();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('project-1');
    });

    it('debería retornar lista vacía si no hay proyectos del asesor', async () => {
      const result = await projectService.getByAsesor('Non-existent Asesor');

      expect(result).toBeDefined();
      expect(result).toHaveLength(0);
    });
  });
});
