/**
 * Vitest Configuration for API Worker
 *
 * Configuración de Vitest para testing del API Worker de VaaIA.
 * Incluye configuración de mocks para Cloudflare Workers (D1, R2, KV).
 */

import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    // Configuración de entorno
    environment: 'node',
    
    // Directorio de tests
    include: ['**/__tests__/**/*.test.ts'],
    
    // Directorio raíz para los tests
    root: path.resolve(__dirname),
    
    // Configuración de cobertura
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        '__tests__/',
        '**/*.test.ts',
        '**/*.spec.ts',
        'vitest.config.ts',
        'dist/',
      ],
      // Cobertura mínima requerida: 60%
      thresholds: {
        lines: 60,
        functions: 60,
        branches: 60,
        statements: 60,
      },
    },
    
    // Configuración de timeouts
    testTimeout: 10000,
    hookTimeout: 10000,
    
    // Configuración de salida
    reporters: ['verbose'],
    
    // Configuración de globals
    globals: true,
    
    // Archivos de setup
    setupFiles: ['./__tests__/setup.ts'],
  },
  
  // Resolución de módulos
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      '@services': path.resolve(__dirname, './services'),
      '@handlers': path.resolve(__dirname, './handlers'),
      '@utils': path.resolve(__dirname, './utils'),
      '@errors': path.resolve(__dirname, './errors'),
    },
  },
});
