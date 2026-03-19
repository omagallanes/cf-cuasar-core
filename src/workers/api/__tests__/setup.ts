/**
 * Test Setup for API Worker
 *
 * Configuración común para todos los tests del API Worker.
 * Inicializa mocks y configura el entorno de pruebas.
 */

import { vi, beforeEach, afterAll } from 'vitest';

/**
 * Mock de crypto.randomUUID para generar UUIDs consistentes en tests
 */
vi.stubGlobal('crypto', {
  randomUUID: () => {
    return '00000000-0000-4000-8000-000000000000';
  },
});

/**
 * Configuración global para todos los tests
 */
beforeEach(() => {
  // Limpiar todos los mocks antes de cada test
  vi.clearAllMocks();
});

/**
 * Limpieza global después de todos los tests
 */
afterAll(() => {
  // Restaurar todos los mocks
  vi.restoreAllMocks();
});
