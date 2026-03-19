/**
 * Validation Service Tests
 *
 * Tests para el servicio de validación de I-JSON.
 * Prueba validaciones de estructura y contenido para I-JSON.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ValidationService } from '../../services/validation.service';

describe('ValidationService', () => {
  let validationService: ValidationService;

  beforeEach(() => {
    validationService = new ValidationService();
  });

  describe('validateIJson', () => {
    it('debería validar un I-JSON válido correctamente', () => {
      const validIJson = {
        titulo_anuncio: 'Piso en venta en Valencia',
        descripcion: 'Hermoso piso en el centro de Valencia',
        tipo_operacion: 'venta',
        tipo_inmueble: 'piso',
        precio: '250000',
        ciudad: 'València',
      };

      const result = validationService.validateIJson(validIJson);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('debería validar I-JSON con campos obligatorios faltantes', () => {
      const invalidIJson = {
        titulo_anuncio: 'Piso en venta',
        // Faltan campos obligatorios
      };

      const result = validationService.validateIJson(invalidIJson);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      const missingFields = result.errors.map(e => e.campo);
      expect(missingFields).toContain('descripcion');
      expect(missingFields).toContain('tipo_operacion');
      expect(missingFields).toContain('tipo_inmueble');
      expect(missingFields).toContain('precio');
      expect(missingFields).toContain('ciudad');
    });

    it('debería validar tipo_operacion inválido', () => {
      const invalidIJson = {
        titulo_anuncio: 'Piso en venta',
        descripcion: 'Hermoso piso',
        tipo_operacion: 'invalido',
        tipo_inmueble: 'piso',
        precio: '250000',
        ciudad: 'València',
      };

      const result = validationService.validateIJson(invalidIJson);

      expect(result.valid).toBe(false);
      const tipoOperacionError = result.errors.find(e => e.campo === 'tipo_operacion');
      expect(tipoOperacionError).toBeDefined();
    });

    it('debería aceptar valores válidos de tipo_operacion', () => {
      const validValues = ['venta', 'alquiler', 'traspaso'];

      for (const tipoOperacion of validValues) {
        const iJson = {
          titulo_anuncio: 'Piso en venta',
          descripcion: 'Hermoso piso',
          tipo_operacion: tipoOperacion,
          tipo_inmueble: 'piso',
          precio: '250000',
          ciudad: 'València',
        };

        const result = validationService.validateIJson(iJson);
        const tipoOperacionError = result.errors.find(e => e.campo === 'tipo_operacion');
        expect(tipoOperacionError).toBeUndefined();
      }
    });

    it('debería validar precio inválido', () => {
      const invalidIJson = {
        titulo_anuncio: 'Piso en venta',
        descripcion: 'Hermoso piso',
        tipo_operacion: 'venta',
        tipo_inmueble: 'piso',
        precio: 'precio_invalido',
        ciudad: 'València',
      };

      const result = validationService.validateIJson(invalidIJson);

      expect(result.valid).toBe(false);
      const precioError = result.errors.find(e => e.campo === 'precio');
      expect(precioError).toBeDefined();
    });

    it('debería validar ciudad inválida', () => {
      const invalidIJson = {
        titulo_anuncio: 'Piso en venta',
        descripcion: 'Hermoso piso',
        tipo_operacion: 'venta',
        tipo_inmueble: 'piso',
        precio: '250000',
        ciudad: 'Madrid', // Ciudad inválida
      };

      const result = validationService.validateIJson(invalidIJson);

      expect(result.valid).toBe(false);
      const ciudadError = result.errors.find(e => e.campo === 'ciudad');
      expect(ciudadError).toBeDefined();
    });

    it('debería validar URL inválida', () => {
      const invalidIJson = {
        titulo_anuncio: 'Piso en venta',
        descripcion: 'Hermoso piso',
        tipo_operacion: 'venta',
        tipo_inmueble: 'piso',
        precio: '250000',
        ciudad: 'València',
        url_fuente: 'not-a-valid-url', // URL inválida
      };

      const result = validationService.validateIJson(invalidIJson);

      expect(result.valid).toBe(false);
      const urlError = result.errors.find(e => e.campo === 'url_fuente');
      expect(urlError).toBeDefined();
    });

    it('debería validar superficie_construida_m2 inválida', () => {
      const invalidIJson = {
        titulo_anuncio: 'Piso en venta',
        descripcion: 'Hermoso piso',
        tipo_operacion: 'venta',
        tipo_inmueble: 'piso',
        precio: '250000',
        ciudad: 'València',
        superficie_construida_m2: '-100', // Negativa
      };

      const result = validationService.validateIJson(invalidIJson);

      expect(result.valid).toBe(false);
      const superficieError = result.errors.find(e => e.campo === 'superficie_construida_m2');
      expect(superficieError).toBeDefined();
    });

    it('debería aceptar campos opcionales válidos', () => {
      const validIJson = {
        titulo_anuncio: 'Piso en venta',
        descripcion: 'Hermoso piso',
        tipo_operacion: 'venta',
        tipo_inmueble: 'piso',
        precio: '250000',
        ciudad: 'València',
        superficie_construida_m2: '100',
        url_fuente: 'https://example.com/piso',
        habitaciones: '3',
        banos: '2',
      };

      const result = validationService.validateIJson(validIJson);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('debería rechazar I-JSON nulo', () => {
      const result = validationService.validateIJson(null as any);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].campo).toBe('i_json');
    });

    it('debería rechazar I-JSON undefined', () => {
      const result = validationService.validateIJson(undefined as any);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].campo).toBe('i_json');
    });

    it('debería validar múltiples errores simultáneamente', () => {
      const invalidIJson = {
        titulo_anuncio: '', // Vacío
        descripcion: '', // Vacío
        tipo_operacion: 'invalido',
        tipo_inmueble: '', // Vacío
        precio: 'abc', // No es número
        ciudad: 'Madrid', // Inválida
      };

      const result = validationService.validateIJson(invalidIJson);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(3);
    });
  });
});
