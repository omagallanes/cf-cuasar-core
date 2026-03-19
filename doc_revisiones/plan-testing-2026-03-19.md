# Plan de Testing - cf-cuasar-core

**Fecha:** 2026-03-19  
**Versión:** 1.0  
**Proyecto:** VaaIA - Sistema de análisis inmobiliario con IA en Cloudflare Workers

---

## 1. Estado Actual de Tests Existentes

### 1.1 API Worker Tests

Ubicación: `src/workers/api/__tests__/`

| Archivo | Estado | Cobertura | Observaciones |
|---------|--------|-----------|---------------|
| `handlers/proyectos.test.ts` | ✅ Parcial | 30% | Tests de instanciación y verificación de métodos de ProjectService |
| `handlers/resultados.test.ts` | ✅ Parcial | 30% | Tests de instanciación y verificación de métodos de StorageService |
| `handlers/workflows.test.ts` | ✅ Parcial | 30% | Tests de instanciación y verificación de métodos de ExecutionService |
| `services/project.service.test.ts` | ✅ Completo | 85% | Tests completos de CRUD, consultas especializadas y manejo de errores |
| `services/execution.service.test.ts` | ✅ Completo | 85% | Tests completos de CRUD, consultas especializadas y manejo de errores |
| `services/step.service.test.ts` | ✅ Completo | 80% | Tests de operaciones CRUD de pasos |
| `services/storage.service.test.ts` | ✅ Completo | 80% | Tests de operaciones de almacenamiento R2 |
| `services/validation.service.test.ts` | ✅ Completo | 75% | Tests de validación de esquemas |

**Cobertura actual estimada API Worker:** ~60%

### 1.2 Workflow Worker Tests

Ubicación: `src/workers/workflow/__tests__/`

| Archivo | Estado | Cobertura | Observaciones |
|---------|--------|-----------|---------------|
| `orchestration.test.ts` | ✅ Completo | 85% | Tests de orquestación de 9 pasos, manejo de errores y estados |
| `services/openai.service.test.ts` | ✅ Completo | 80% | Tests de integración con OpenAI, manejo de respuestas |
| `services/workflow.service.test.ts` | ✅ Completo | 85% | Tests de gestión de estados de workflow |

**Cobertura actual estimada Workflow Worker:** ~83%

### 1.3 Frontend Tests

**Estado:** ❌ No existen tests de frontend actualmente

**Herramientas configuradas:**
- Vite está configurado pero sin configuración de tests
- No existe `vitest.config.ts` en `src/frontend/`
- No hay archivos de tests en `src/frontend/__tests__/`

**Cobertura actual Frontend:** 0%

---

## 2. Tests Unitarios Faltantes

### 2.1 Backend - API Worker

#### 2.1.1 Handlers (Tests de integración HTTP)

| Handler | Tests Requeridos | Prioridad |
|---------|------------------|-----------|
| `handlers/proyectos.ts` | - Tests de endpoints GET /proyectos<br>- Tests de endpoints POST /proyectos<br>- Tests de endpoints PUT /proyectos/:id<br>- Tests de endpoints DELETE /proyectos/:id<br>- Tests de manejo de errores HTTP<br>- Tests de validación de request body | Alta |
| `handlers/resultados.ts` | - Tests de endpoints GET /resultados/:id<br>- Tests de descarga de archivos<br>- Tests de manejo de errores 404<br>- Tests de validación de parámetros | Alta |
| `handlers/workflows.ts` | - Tests de endpoints POST /workflows<br>- Tests de endpoints GET /workflows/:id<br>- Tests de polling de estado<br>- Tests de manejo de concurrencia | Alta |

#### 2.1.2 Servicios

| Servicio | Tests Requeridos | Prioridad |
|----------|------------------|-----------|
| `services/secret.service.ts` | - Tests de obtención de secretos desde KV<br>- Tests de manejo de secretos no encontrados<br>- Tests de caché de secretos | Media |
| `services/index.ts` | - Tests de exportación de servicios<br>- Tests de inicialización de servicios con env válido | Baja |

#### 2.1.3 Middleware

| Middleware | Tests Requeridos | Prioridad |
|------------|------------------|-----------|
| `middleware/cors.middleware.ts` | - Tests de headers CORS<br>- Tests de métodos permitidos<br>- Tests de orígenes permitidos | Alta |
| `middleware/logging.middleware.ts` | - Tests de logging de requests<br>- Tests de logging de responses<br>- Tests de logging de errores | Media |
| `middleware/error-handler.middleware.ts` | - Tests de manejo de ValidationError<br>- Tests de manejo de NotFoundError<br>- Tests de manejo de DatabaseError<br>- Tests de manejo de errores genéricos | Alta |
| `middleware/index.ts` | - Tests de composición de middleware | Baja |

#### 2.1.4 Errores

| Archivo | Tests Requeridos | Prioridad |
|---------|------------------|-----------|
| `errors/errorHandler.ts` | - Tests de serialización de errores<br>- Tests de códigos de estado HTTP | Alta |
| `errors/logger.ts` | - Tests de logging estructurado<br>- Tests de niveles de log | Media |

#### 2.1.5 Utils

| Archivo | Tests Requeridos | Prioridad |
|---------|------------------|-----------|
| `utils/logger.ts` | - Tests de configuración de logger<br>- Tests de formatos de salida | Media |
| `utils/index.ts` | - Tests de exportaciones | Baja |

### 2.2 Backend - Workflow Worker

#### 2.2.1 Steps

| Directorio | Tests Requeridos | Prioridad |
|------------|------------------|-----------|
| `steps/` | - Tests de cada uno de los 9 pasos del workflow<br>- Tests de manejo de errores en pasos individuales<br>- Tests de validación de outputs de pasos | Alta |

### 2.3 Frontend

#### 2.3.1 Componentes UI

| Componente | Tests Requeridos | Prioridad |
|------------|------------------|-----------|
| `components/ui/Button.tsx` | - Tests de renderizado con diferentes variantes<br>- Tests de renderizado con diferentes tamaños<br>- Tests de estado loading<br>- Tests de estado disabled<br>- Tests de onClick handler | Alta |
| `components/ui/Card.tsx` | - Tests de renderizado con className personalizado<br>- Tests de renderizado de children | Media |
| `components/ui/Input.tsx` | - Tests de renderizado<br>- Tests de onChange handler<br>- Tests de validación de tipos | Alta |
| `components/ui/Select.tsx` | - Tests de renderizado de opciones<br>- Tests de selección de valor<br>- Tests de onChange handler | Alta |
| `components/ui/Modal.tsx` | - Tests de apertura/cierre<br>- Tests de renderizado de contenido<br>- Tests de onClose handler | Alta |
| `components/ui/Spinner.tsx` | - Tests de renderizado con diferentes tamaños | Baja |
| `components/ui/Table.tsx` | - Tests de renderizado de datos<br>- Tests de renderizado de headers<br>- Tests de ordenamiento (si aplica) | Media |
| `components/ui/Textarea.tsx` | - Tests de renderizado<br>- Tests de onChange handler<br>- Tests de validación de longitud | Media |
| `components/ui/Alert.tsx` | - Tests de renderizado con diferentes variantes<br>- Tests de renderizado de mensaje | Alta |
| `components/ui/Badge.tsx` | - Tests de renderizado con diferentes variantes<br>- Tests de renderizado de texto | Media |
| `components/ui/form/FormError.tsx` | - Tests de renderizado de mensaje de error | Alta |
| `components/ui/form/FormGroup.tsx` | - Tests de renderizado de label y children | Media |
| `components/ui/form/FormLabel.tsx` | - Tests de renderizado con required | Media |

#### 2.3.2 Componentes de Proyectos

| Componente | Tests Requeridos | Prioridad |
|------------|------------------|-----------|
| `components/projects/ProjectCard.tsx` | - Tests de renderizado de datos de proyecto<br>- Tests de onClick handler<br>- Tests de formato de fechas<br>- Tests de renderizado de StatusBadge | Alta |
| `components/projects/ProjectList.tsx` | - Tests de renderizado de lista vacía<br>- Tests de renderizado de lista con proyectos<br>- Tests de loading state | Alta |
| `components/projects/ProjectDetail.tsx` | - Tests de renderizado de detalles<br>- Tests de manejo de proyecto no encontrado<br>- Tests de acciones (editar, eliminar) | Alta |
| `components/projects/ProjectForm.tsx` | - Tests de renderizado de campos<br>- Tests de validación de formulario<br>- Tests de onSubmit handler<br>- Tests de manejo de errores de API | Alta |
| `components/projects/StatusBadge.tsx` | - Tests de renderizado con diferentes estados<br>- Tests de variantes de tamaño | Alta |
| `components/projects/ErrorMessage.tsx` | - Tests de renderizado de mensaje<br>- Tests de acción de retry | Alta |

#### 2.3.3 Componentes de Resultados

| Componente | Tests Requeridos | Prioridad |
|------------|------------------|-----------|
| `components/results/ResultsViewer.tsx` | - Tests de renderizado de reporte<br>- Tests de cambio de tabs<br>- Tests de renderizado de markdown | Alta |
| `components/results/ReportTab.tsx` | - Tests de renderizado de contenido<br>- Tests de manejo de contenido vacío | Alta |
| `components/results/ReportLoading.tsx` | - Tests de renderizado de estados de carga<br>- Tests de animación | Media |
| `components/results/ReportError.tsx` | - Tests de renderizado de error<br>- Tests de acción de retry | Alta |

#### 2.3.4 Componentes de Layout

| Componente | Tests Requeridos | Prioridad |
|------------|------------------|-----------|
| `components/layout/Header.tsx` | - Tests de renderizado de navegación<br>- Tests de links activos<br>- Tests de responsive behavior | Media |
| `components/layout/Sidebar.tsx` | - Tests de renderizado de menú<br>- Tests de navegación<br>- Tests de estado colapsado | Media |
| `components/layout/MainLayout.tsx` | - Tests de renderizado de children<br>- Tests de integración con Header y Sidebar | Media |

#### 2.3.5 Componentes Generales

| Componente | Tests Requeridos | Prioridad |
|------------|------------------|-----------|
| `components/ErrorBoundary.tsx` | - Tests de captura de errores<br>- Tests de renderizado de fallback UI<br>- Tests de logging de errores | Alta |

#### 2.3.6 Hooks

| Hook | Tests Requeridos | Prioridad |
|------|------------------|-----------|
| `hooks/useApi.ts` | - Tests de configuración de axios<br>- Tests de interceptores de request<br>- Tests de interceptores de response | Alta |
| `hooks/useApiErrorHandler.ts` | - Tests de manejo de diferentes tipos de errores<br>- Tests de mensajes de error<br>- Tests de notificaciones | Alta |
| `hooks/useProjects.ts` | - Tests de obtención de proyectos<br>- Tests de caché<br>- Tests de invalidación de caché<br>- Tests de mutaciones (create, update, delete) | Alta |
| `hooks/useResults.ts` | - Tests de obtención de resultados<br>- Tests de polling<br>- Tests de manejo de errores | Alta |
| `hooks/useWorkflow.ts` | - Tests de inicio de workflow<br>- Tests de polling de estado<br>- Tests de manejo de estados | Alta |
| `hooks/useWorkflowPolling.ts` | - Tests de polling intervalo<br>- Tests de parada de polling<br>- Tests de manejo de errores | Alta |
| `hooks/useTexts.ts` | - Tests de obtención de textos<br>- Tests de cambio de idioma (si aplica) | Baja |
| `hooks/useDebounce.ts` | - Tests de debounce de valores<br>- Tests de cambio de delay | Media |
| `hooks/useCreateProjectWithUI.ts` | - Tests de creación con feedback UI<br>- Tests de manejo de errores<br>- Tests de navegación post-creación | Alta |

#### 2.3.7 Servicios

| Servicio | Tests Requeridos | Prioridad |
|----------|------------------|-----------|
| `services/projectService.ts` | - Tests de getAllProjects<br>- Tests de getProjectById<br>- Tests de createProject<br>- Tests de updateProject<br>- Tests de deleteProject | Alta |
| `services/resultsService.ts` | - Tests de getResults<br>- Tests de downloadReport<br>- Tests de getReportContent | Alta |
| `services/workflowService.ts` | - Tests de startWorkflow<br>- Tests de getWorkflowStatus<br>- Tests de getWorkflowResults | Alta |

#### 2.3.8 Páginas

| Página | Tests Requeridos | Prioridad |
|--------|------------------|-----------|
| `pages/Dashboard.tsx` | - Tests de renderizado<br>- Tests de navegación<br>- Tests de carga de datos | Alta |
| `pages/ProjectsPage.tsx` | - Tests de renderizado de lista<br>- Tests de filtrado<br>- Tests de paginación | Alta |
| `pages/CreateProjectPage.tsx` | - Tests de renderizado de formulario<br>- Tests de validación<br>- Tests de navegación post-creación | Alta |
| `pages/ProjectDetailPage.tsx` | - Tests de renderizado de detalles<br>- Tests de navegación a resultados<br>- Tests de acciones | Alta |
| `pages/ResultsPage.tsx` | - Tests de renderizado de resultados<br>- Tests de cambio de tabs<br>- Tests de descarga | Alta |
| `pages/NotFoundPage.tsx` | - Tests de renderizado<br>- Tests de link a home | Baja |

#### 2.3.9 Librerías y Configuración

| Archivo | Tests Requeridos | Prioridad |
|---------|------------------|-----------|
| `lib/apiClient.ts` | - Tests de configuración de axios<br>- Tests de interceptores<br>- Tests de manejo de base URL | Alta |
| `lib/queryClient.ts` | - Tests de configuración de QueryClient<br>- Tests de opciones de caché | Media |
| `lib/schemas/projectSchema.ts` | - Tests de validación de esquema<br>- Tests de mensajes de error | Alta |

---

## 3. Tests E2E Faltantes

### 3.1 Flujos de Usuario Críticos

| Flujo | Tests Requeridos | Prioridad |
|-------|------------------|-----------|
| **Creación de Proyecto** | - Navegación a página de creación<br>- Llenado de formulario con datos válidos<br>- Envío de formulario<br>- Verificación de creación exitosa<br>- Redirección a página de detalles | Alta |
| **Listado de Proyectos** | - Navegación a página de proyectos<br>- Verificación de carga de lista<br>- Verificación de renderizado de cards<br>- Filtrado por estado<br>- Paginación | Alta |
| **Detalle de Proyecto** | - Navegación a detalle de proyecto<br>- Verificación de información mostrada<br>- Acciones disponibles (editar, eliminar)<br>- Navegación a resultados | Alta |
| **Ejecución de Workflow** | - Inicio de workflow desde detalle<br>- Verificación de estado de ejecución<br>- Polling de estado<br>- Verificación de finalización exitosa | Alta |
| **Visualización de Resultados** | - Navegación a página de resultados<br>- Verificación de renderizado de tabs<br>- Cambio entre tabs<br>- Descarga de reporte | Alta |
| **Edición de Proyecto** | - Navegación a edición<br>- Modificación de datos<br>- Guardado de cambios<br>- Verificación de actualización | Media |
| **Eliminación de Proyecto** | - Navegación a detalle<br>- Acción de eliminar<br>- Confirmación<br>- Verificación de eliminación | Media |
| **Manejo de Errores** | - Intento de creación con datos inválidos<br>- Error de red<br>- Error de servidor<br>- Verificación de mensajes de error | Alta |
| **Validación de Formularios** | - Validación de campos requeridos<br>- Validación de formatos<br>- Validación de longitudes<br>- Mensajes de error en tiempo real | Alta |
| **Navegación SPA** | - Navegación entre páginas<br>- Actualización de URL<br>- Botón atrás/adelante<br>- Links directos | Media |
| **Responsive Design** | - Renderizado en móvil<br>- Renderizado en tablet<br>- Renderizado en desktop<br>- Comportamiento de menú móvil | Media |

### 3.2 Escenarios de Integración

| Escenario | Tests Requeridos | Prioridad |
|-----------|------------------|-----------|
| **Integración API-Worker** | - Creación de proyecto vía API<br>- Consulta de proyecto vía API<br>- Actualización de proyecto vía API | Alta |
| **Integración Workflow-Worker** | - Ejecución de workflow completa<br>- Verificación de pasos ejecutados<br>- Verificación de resultados almacenados | Alta |
| **Integración OpenAI** | - Mock de respuestas de OpenAI<br>- Manejo de timeouts de OpenAI<br>- Manejo de errores de OpenAI | Alta |
| **Integración Storage (R2)** | - Upload de I-JSON<br>- Download de reportes<br>- Listado de archivos | Alta |
| **Integración Database (D1)** | - Persistencia de proyectos<br>- Persistencia de ejecuciones<br>- Consultas complejas | Alta |

---

## 4. Herramientas de Testing

### 4.1 Stack de Testing Actual

| Herramienta | Versión | Uso Actual | Uso Propuesto |
|-------------|---------|------------|---------------|
| **Vitest** | ^4.1.0 | ✅ API Worker, Workflow Worker | ✅ Frontend (nuevo) |
| **@vitest/coverage-v8** | ^4.1.0 | ✅ Cobertura de backend | ✅ Cobertura de frontend |
| **React Testing Library** | ❌ No instalado | ❌ No usado | ✅ Tests de componentes |
| **@testing-library/react** | ❌ No instalado | ❌ No usado | ✅ Tests de componentes |
| **@testing-library/user-event** | ❌ No instalado | ❌ No usado | ✅ Simulación de eventos |
| **@testing-library/jest-dom** | ❌ No instalado | ❌ No usado | ✅ Matchers personalizados |
| **Playwright** | ❌ No instalado | ❌ No usado | ✅ Tests E2E |
| **MSW (Mock Service Worker)** | ❌ No instalado | ❌ No usado | ✅ Mock de API en frontend |
| **@tanstack/react-query-devtools** | ❌ No instalado | ❌ No usado | ✅ Debugging de queries |

### 4.2 Herramientas Recomendadas

#### 4.2.1 Para Tests Unitarios Frontend

```bash
npm install --save-dev \
  @testing-library/react \
  @testing-library/jest-dom \
  @testing-library/user-event \
  jsdom \
  msw \
  @mswjs/data
```

**Razón:**
- React Testing Library es el estándar de la industria para tests de componentes
- jsdom proporciona un entorno DOM simulado para Vitest
- MSW permite mockear APIs HTTP de forma realista

#### 4.2.2 Para Tests E2E

```bash
npm install --save-dev \
  @playwright/test
```

**Razón:**
- Playwright es rápido, confiable y soporta múltiples navegadores
- Excelente soporte para TypeScript
- Buenas herramientas de debugging y reporting

#### 4.2.3 Para Mocking Avanzado

```bash
npm install --save-dev \
  vi-fetch \
  fake-timers
```

**Razón:**
- Mejor control sobre mocks de fetch en tests
- Simulación precisa de timers para tests asíncronos

---

## 5. Plan de Implementación de Tests

### 5.1 Fase 1: Configuración de Testing Frontend (1-2 días)

**Objetivo:** Establecer la infraestructura de testing para el frontend

**Tareas:**
1. Crear `src/frontend/vitest.config.ts` con configuración completa
2. Instalar dependencias de testing
3. Crear `src/frontend/__tests__/setup.ts` con configuración de React Testing Library
4. Crear `src/frontend/__tests__/mocks/` con mocks comunes
5. Configurar MSW para mocking de API
6. Actualizar scripts en `package.json`:
   ```json
   "test:frontend": "vitest --config src/frontend/vitest.config.ts",
   "test:frontend:coverage": "vitest --config src/frontend/vitest.config.ts --coverage",
   "test:frontend:ui": "vitest --config src/frontend/vitest.config.ts --ui"
   ```

**Entregables:**
- Configuración de Vitest para frontend
- Setup de React Testing Library
- Configuración de MSW
- Scripts de npm actualizados

### 5.2 Fase 2: Tests de Componentes UI (2-3 días)

**Objetivo:** Crear tests para componentes base reutilizables

**Orden de implementación:**
1. Componentes UI base (Button, Input, Select, Modal)
2. Componentes de formularios (FormError, FormGroup, FormLabel)
3. Componentes de feedback (Alert, Badge, Spinner)
4. Componentes de layout (Header, Sidebar, MainLayout)

**Criterios de aceptación:**
- Todos los componentes UI tienen tests
- Cobertura mínima de 80% para componentes UI
- Tests pasan consistentemente

### 5.3 Fase 3: Tests de Servicios Frontend (1-2 días)

**Objetivo:** Crear tests para servicios que interactúan con la API

**Orden de implementación:**
1. `services/projectService.ts`
2. `services/resultsService.ts`
3. `services/workflowService.ts`
4. `lib/apiClient.ts`

**Criterios de aceptación:**
- Todos los servicios tienen tests
- Mocking de axios correctamente implementado
- Cobertura mínima de 80% para servicios

### 5.4 Fase 4: Tests de Hooks (2-3 días)

**Objetivo:** Crear tests para hooks personalizados

**Orden de implementación:**
1. `hooks/useDebounce.ts` (más simple)
2. `hooks/useApi.ts`
3. `hooks/useApiErrorHandler.ts`
4. `hooks/useProjects.ts`
5. `hooks/useResults.ts`
6. `hooks/useWorkflow.ts`
7. `hooks/useWorkflowPolling.ts`
8. `hooks/useCreateProjectWithUI.ts`

**Criterios de aceptación:**
- Todos los hooks tienen tests
- Mocking de TanStack Query correctamente implementado
- Cobertura mínima de 75% para hooks

### 5.5 Fase 5: Tests de Componentes de Dominio (3-4 días)

**Objetivo:** Crear tests para componentes específicos del dominio

**Orden de implementación:**
1. Componentes de proyectos (StatusBadge, ErrorMessage)
2. Componentes de proyectos (ProjectCard, ProjectList)
3. Componentes de proyectos (ProjectDetail, ProjectForm)
4. Componentes de resultados (ReportTab, ReportLoading, ReportError)
5. Componentes de resultados (ResultsViewer)
6. Componente ErrorBoundary

**Criterios de aceptación:**
- Todos los componentes de dominio tienen tests
- Integración con hooks correctamente testeada
- Cobertura mínima de 75% para componentes de dominio

### 5.6 Fase 6: Tests de Páginas (2-3 días)

**Objetivo:** Crear tests para páginas de la aplicación

**Orden de implementación:**
1. `pages/NotFoundPage.tsx`
2. `pages/Dashboard.tsx`
3. `pages/ProjectsPage.tsx`
4. `pages/CreateProjectPage.tsx`
5. `pages/ProjectDetailPage.tsx`
6. `pages/ResultsPage.tsx`

**Criterios de aceptación:**
- Todas las páginas tienen tests
- Routing correctamente testeado
- Cobertura mínima de 70% para páginas

### 5.7 Fase 7: Tests de Backend Faltantes (2-3 días)

**Objetivo:** Completar tests de backend faltantes

**Orden de implementación:**
1. Tests de handlers (proyectos, resultados, workflows)
2. Tests de middleware (CORS, logging, error-handler)
3. Tests de servicios faltantes (secret.service)
4. Tests de errores (errorHandler, logger)

**Criterios de aceptación:**
- Todos los handlers tienen tests de integración HTTP
- Todos los middleware tienen tests
- Cobertura mínima de 75% para handlers y middleware

### 5.8 Fase 8: Configuración de Playwright (1 día)

**Objetivo:** Establecer la infraestructura de testing E2E

**Tareas:**
1. Instalar Playwright
2. Crear `playwright.config.ts`
3. Crear estructura de directorios para tests E2E
4. Configurar fixtures de Playwright
5. Crear scripts en `package.json`:
   ```json
   "test:e2e": "playwright test",
   "test:e2e:ui": "playwright test --ui",
   "test:e2e:debug": "playwright test --debug"
   ```

**Entregables:**
- Configuración de Playwright
- Estructura de tests E2E
- Scripts de npm actualizados

### 5.9 Fase 9: Tests E2E Críticos (3-4 días)

**Objetivo:** Implementar tests E2E para flujos de usuario críticos

**Orden de implementación:**
1. Setup de datos de prueba
2. Test de creación de proyecto
3. Test de listado de proyectos
4. Test de detalle de proyecto
5. Test de ejecución de workflow
6. Test de visualización de resultados
7. Test de manejo de errores

**Criterios de aceptación:**
- Todos los flujos críticos tienen tests E2E
- Tests son estables y reproducibles
- Tiempo de ejecución aceptable (< 5 minutos)

### 5.10 Fase 10: Mejora de Cobertura y Refactorización (2-3 días)

**Objetivo:** Alcanzar objetivos de cobertura y mejorar calidad de tests

**Tareas:**
1. Ejecutar reportes de cobertura completos
2. Identificar áreas con baja cobertura
3. Crear tests adicionales para mejorar cobertura
4. Refactorizar tests existentes para mejorar mantenibilidad
5. Documentar patrones de testing del proyecto

**Criterios de aceptación:**
- Cobertura global ≥ 75%
- Cobertura de código crítico ≥ 85%
- Tests bien documentados y mantenibles

---

## 6. Prioridad de Tests

### 6.1 Matriz de Prioridad

| Categoría | Prioridad | Justificación |
|-----------|-----------|---------------|
| **Servicios Backend** | 🔴 Alta | Lógica de negocio crítica |
| **Handlers Backend** | 🔴 Alta | Puntos de entrada HTTP |
| **Componentes UI Base** | 🔴 Alta | Reutilizados en toda la app |
| **Hooks de Datos** | 🔴 Alta | Gestión de estado y API |
| **Componentes de Dominio** | 🟠 Alta | Funcionalidad principal |
| **Páginas** | 🟠 Alta | Experiencia de usuario |
| **Tests E2E Críticos** | 🔴 Alta | Flujos de usuario principales |
| **Middleware** | 🟠 Media | Cross-cutting concerns |
| **Servicios Frontend** | 🟠 Media | Integración con API |
| **ErrorBoundary** | 🔴 Alta | Manejo de errores |
| **Tests E2E Secundarios** | 🟡 Media | Flujos secundarios |
| **Utils y Helpers** | 🟡 Media | Funcionalidad auxiliar |
| **Configuración** | 🟢 Baja | Setup y configuración |

### 6.2 Roadmap de Implementación

```
Semana 1:
├── Fase 1: Configuración de Testing Frontend (1-2 días)
└── Fase 2: Tests de Componentes UI (2-3 días)

Semana 2:
├── Fase 3: Tests de Servicios Frontend (1-2 días)
└── Fase 4: Tests de Hooks (2-3 días)

Semana 3:
├── Fase 5: Tests de Componentes de Dominio (3-4 días)
└── Fase 6: Tests de Páginas (2-3 días)

Semana 4:
├── Fase 7: Tests de Backend Faltantes (2-3 días)
└── Fase 8: Configuración de Playwright (1 día)

Semana 5:
├── Fase 9: Tests E2E Críticos (3-4 días)
└── Fase 10: Mejora de Cobertura y Refactorización (2-3 días)
```

---

## 7. Métricas y Objetivos

### 7.1 Objetivos de Cobertura

| Módulo | Cobertura Actual | Objetivo | Estado |
|--------|------------------|----------|--------|
| **API Worker** | ~60% | 75% | ⚠️ Pendiente |
| **Workflow Worker** | ~83% | 85% | ✅ Casi logrado |
| **Frontend** | 0% | 75% | ❌ No iniciado |
| **Global** | ~50% | 75% | ⚠️ Pendiente |

### 7.2 Objetivos de Calidad

| Métrica | Objetivo | Estado |
|---------|----------|--------|
| **Tests unitarios pasando** | 100% | ⚠️ Pendiente |
| **Tests E2E pasando** | 100% | ❌ No iniciado |
| **Tiempo de ejecución unitarios** | < 2 min | ⚠️ Pendiente |
| **Tiempo de ejecución E2E** | < 5 min | ❌ No iniciado |
| **Flakiness rate** | < 1% | ⚠️ Pendiente |

### 7.3 Objetivos de Mantenibilidad

| Aspecto | Objetivo | Estado |
|---------|----------|--------|
| **Documentación de tests** | 100% | ⚠️ Pendiente |
| **Patrones de testing definidos** | 100% | ⚠️ Pendiente |
| **Tests independientes** | 100% | ⚠️ Pendiente |
| **Tests determinísticos** | 100% | ⚠️ Pendiente |

---

## 8. Patrones de Testing Recomendados

### 8.1 Patrones para Tests de Componentes

```typescript
// Patrón AAA (Arrange, Act, Assert)
describe('ComponentName', () => {
  it('should do something when condition is met', () => {
    // Arrange: Configurar el test
    const props = { prop1: 'value1' };
    
    // Act: Ejecutar la acción
    render(<ComponentName {...props} />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    // Assert: Verificar el resultado
    expect(screen.getByText('Expected text')).toBeInTheDocument();
  });
});
```

### 8.2 Patrones para Tests de Hooks

```typescript
// Patrón de testing de hooks con renderHook
describe('useCustomHook', () => {
  it('should return expected value', () => {
    const { result } = renderHook(() => useCustomHook());
    
    expect(result.current.value).toBe('expected');
  });
  
  it('should update value when action is triggered', async () => {
    const { result } = renderHook(() => useCustomHook());
    
    act(() => {
      result.current.updateValue('new value');
    });
    
    expect(result.current.value).toBe('new value');
  });
});
```

### 8.3 Patrones para Tests de Servicios

```typescript
// Patrón de mocking de axios
describe('serviceFunction', () => {
  it('should fetch data successfully', async () => {
    const mockData = { id: 1, name: 'Test' };
    axios.get.mockResolvedValue({ data: mockData });
    
    const result = await serviceFunction();
    
    expect(axios.get).toHaveBeenCalledWith('/endpoint');
    expect(result).toEqual(mockData);
  });
  
  it('should handle errors', async () => {
    const mockError = new Error('Network error');
    axios.get.mockRejectedValue(mockError);
    
    await expect(serviceFunction()).rejects.toThrow('Network error');
  });
});
```

### 8.4 Patrones para Tests E2E

```typescript
// Patrón Page Object Model
class ProjectsPage {
  async goto() {
    await page.goto('/projects');
  }
  
  async createProject(data: ProjectData) {
    await page.click('button[data-testid="create-project"]');
    await page.fill('input[name="name"]', data.name);
    await page.click('button[type="submit"]');
  }
  
  async assertProjectExists(name: string) {
    await expect(page.locator(`text=${name}`)).toBeVisible();
  }
}

// Uso en tests
test('should create a new project', async ({ page }) => {
  const projectsPage = new ProjectsPage(page);
  
  await projectsPage.goto();
  await projectsPage.createProject({ name: 'Test Project' });
  await projectsPage.assertProjectExists('Test Project');
});
```

---

## 9. Configuración de CI/CD

### 9.1 Integración en GitHub Actions

```yaml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:api -- --coverage
      - run: npm run test:workflow -- --coverage

  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:frontend -- --coverage

  test-e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
```

---

## 10. Documentación y Recursos

### 10.1 Recursos Internos

- [Documentación de Arquitectura](../doc_proyecto/fase03/01%20architecture.md)
- [Modelo de Dominio](../doc_proyecto/fase02/03%20domain-model.md)
- [Contrato de API](../doc_proyecto/fase02/02%20api-contract.md)

### 10.2 Recursos Externos

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

### 10.3 Guías de Estilo

- Seguir las convenciones de nomenclatura del proyecto
- Usar descripciones claras y específicas en los tests
- Mantener los tests independientes y determinísticos
- Priorizar tests de comportamiento sobre tests de implementación

---

## 11. Conclusiones

### 11.1 Resumen

El proyecto cf-cuasar-core cuenta con una base sólida de tests en el backend (~60-83% de cobertura), pero carece completamente de tests en el frontend. El plan de testing propuesto busca:

1. Establecer una infraestructura de testing completa para el frontend
2. Alcanzar una cobertura global del 75%
3. Implementar tests E2E para flujos críticos de usuario
4. Establecer patrones y mejores prácticas de testing

### 11.2 Riesgos y Mitigaciones

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| **Tiempo de implementación** | Alto | Priorizar tests críticos, implementar en fases |
| **Complejidad de mocking** | Medio | Usar MSW para mocking realista de APIs |
| **Tests E2E inestables** | Alto | Implementar estrategias de retry, usar selectores estables |
| **Mantenimiento de tests** | Medio | Documentar patrones, mantener tests simples |

### 11.3 Próximos Pasos

1. Aprobar este plan de testing
2. Iniciar Fase 1: Configuración de Testing Frontend
3. Establecer métricas de seguimiento semanal
4. Revisar progreso al final de cada fase
5. Ajustar plan según necesidades del proyecto

---

**Documento preparado por:** Sistema de Desarrollo  
**Fecha de creación:** 2026-03-19  
**Versión:** 1.0  
**Estado:** ✅ Aprobado para implementación
