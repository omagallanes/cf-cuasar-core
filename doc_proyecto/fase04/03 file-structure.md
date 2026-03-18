# Estructura de Archivos — FASE 4

> **Documento:** FASE 4 — Planificación Técnica (Execution Plan)  
> **Fuente principal:** [`implementation-plan.md`](./implementation-plan.md)  
> **Referencia:** [`.governance/inventario_recursos.md`](../../.governance/inventario_recursos.md)  
> **Versión:** 1.0  
> **Fecha:** 2026-03-18

---

## Resumen

Este documento define la estructura de archivos y directorios del proyecto VaaIA, estableciendo convenciones claras para evitar que la IA cree archivos en rutas incorrectas o use nombres inconsistentes.

---

## Directorio Raíz

```
/ (raíz del proyecto)
├── .gitignore
├── .dev.vars.example
├── .env.example
├── package.json
├── tsconfig.json
├── wrangler.toml
├── wrangler.jsonc
├── README.md
├── .governance/
│   ├── inventario_recursos.md
│   ├── reglas_proyecto.md
│   ├── metodo_despliegue.md
│   └── orquestador.md
├── doc_proyecto/
│   ├── fase01/
│   ├── fase02/
│   ├── fase03/
│   └── fase04/
├── src/
│   ├── workers/
│   │   ├── api/
│   │   │   ├── index.ts
│   │   │   ├── handlers/
│   │   │   │   ├── proyectos/
│   │   │   │   │   ├── list.handler.ts
│   │   │   │   │   ├── create.handler.ts
│   │   │   │   │   ├── get.handler.ts
│   │   │   │   │   ├── update.handler.ts
│   │   │   │   │   └── delete.handler.ts
│   │   │   ├── workflows/
│   │   │   │   ├── execute.handler.ts
│   │   │   │   ├── list.handler.ts
│   │   │   │   └── get.handler.ts
│   │   │   ├── results/
│   │   │   │   ├── get-all.handler.ts
│   │   │   │   └── get-specific.handler.ts
│   │   │   ├── services/
│   │   │   │   ├── project.service.ts
│   │   │   │   ├── execution.service.ts
│   │   │   │   ├── results.service.ts
│   │   │   │   ├── storage.service.ts
│   │   │   │   ├── secret.service.ts
│   │   │   │   └── validation.service.ts
│   │   │   ├── middleware/
│   │   │   │   ├── cors.middleware.ts
│   │   │   │   ├── logger.middleware.ts
│   │   │   │   └── error.middleware.ts
│   │   │   ├── errors/
│   │   │   │   ├── api-error.ts
│   │   │   │   ├── validation-error.ts
│   │   │   │   └── not-found-error.ts
│   │   │   ├── types/
│   │   │   │   ├── project.types.ts
│   │   │   │   ├── execution.types.ts
│   │   │   │   ├── step.types.ts
│   │   │   │   └── api.types.ts
│   │   │   ├── utils/
│   │   │   │   ├── logger.ts
│   │   │   │   └── constants.ts
│   │   └── workflow/
│   │       ├── index.ts
│   │       ├── steps/
│   │       │   ├── orchestration.step.ts
│   │       │   ├── openai.step.ts
│   │       │   ├── storage.step.ts
│   │       │   └── error-handling.step.ts
│   │       ├── services/
│   │       │   ├── workflow.service.ts
│   │       │   ├── openai.service.ts
│   │       │   └── storage.service.ts
│   │       ├── errors/
│   │       │   ├── step-error.ts
│   │       │   ├── openai-error.ts
│   │       │   ├── storage-error.ts
│   │       │   └── database-error.ts
│   │       └── types/
│   │           └── workflow.types.ts
│   └── frontend/
│       ├── main.tsx
│       ├── App.tsx
│       ├── components/
│       │   ├── projects/
│       │   │   ├── ProjectList.tsx
│       │   │   ├── ProjectCard.tsx
│       │   │   ├── ProjectForm.tsx
│       │   │   ├── ProjectDetail.tsx
│       │   │   └── StatusBadge.tsx
│       │   ├── results/
│       │   │   ├── ResultsTabs.tsx
│       │   │   ├── ReportViewer.tsx
│       │   │   ├── StepStatus.tsx
│       │   │   └── DownloadButton.tsx
│       │   ├── ui/
│       │   │   ├── ErrorAlert.tsx
│       │   │   ├── ErrorBoundary.tsx
│       │   │   └── LoadingSpinner.tsx
│       │   ├── services/
│       │   │   ├── project.service.ts
│       │   │   ├── workflow.service.ts
│       │   │   ├── results.service.ts
│       │   │   └── api-client.service.ts
│       │   ├── hooks/
│       │   │   ├── useProjects.ts
│       │   │   ├── useWorkflow.ts
│       │   │   └── useResults.ts
│       │   ├── config/
│       │   │   ├── texts.ts
│       │   │   ├── errors.ts
│       │   │   └── validation.ts
│       │   ├── lib/
│       │   │   ├── api-client.ts
│       │   │   └── markdown-renderer.ts
│       │   ├── styles/
│       │   │   └── index.css
│       └── pages/
│           ├── projects/
│           │   ├── index.tsx
│           │   ├── create.tsx
│           │   └── detail.tsx
│           └── results/
│               ├── index.tsx
│               └── report.tsx
├── tests/
│   ├── unit/
│   │   ├── api/
│   │   │   ├── handlers/
│   │   │   │   ├── projects/
│   │   │   │   │   ├── list.handler.test.ts
│   │   │   │   │   ├── create.handler.test.ts
│   │   │   │   │   ├── get.handler.test.ts
│   │   │   │   │   ├── update.handler.test.ts
│   │   │   │   │   └── delete.handler.test.ts
│   │   │   ├── workflows/
│   │   │   │   ├── execute.handler.test.ts
│   │   │   │   ├── list.handler.test.ts
│   │   │   │   └── get.handler.test.ts
│   │   │   ├── results/
│   │   │   │   ├── get-all.handler.test.ts
│   │   │   │   └── get-specific.handler.test.ts
│   │   │   ├── services/
│   │   │   │   ├── project.service.test.ts
│   │   │   │   ├── execution.service.test.ts
│   │   │   │   ├── results.service.test.ts
│   │   │   │   ├── storage.service.test.ts
│   │   │   │   ├── secret.service.test.ts
│   │   │   │   └── validation.service.test.ts
│   │   │   └── middleware/
│   │   │       ├── cors.middleware.test.ts
│   │   │       ├── logger.middleware.test.ts
│   │   │       └── error.middleware.test.ts
│   │   └── workflow/
│   │       ├── orchestration.step.test.ts
│   │       ├── openai.step.test.ts
│   │       ├── storage.step.test.ts
│   │       └── error-handling.step.test.ts
│   │   └── services/
│   │           ├── workflow.service.test.ts
│   │           ├── openai.service.test.ts
│   │           └── storage.service.test.ts
│   └── e2e/
│       ├── frontend/
│       │   ├── components/
│       │   │   ├── projects/
│       │   │   │   ├── ProjectList.test.tsx
│       │   │   │   ├── ProjectCard.test.tsx
│       │   │   │   ├── ProjectForm.test.tsx
│       │   │   │   ├── ProjectDetail.test.tsx
│       │   │   │   └── StatusBadge.test.tsx
│       │   │   ├── results/
│       │   │   │   ├── ResultsTabs.test.tsx
│       │   │   │   ├── ReportViewer.test.tsx
│       │   │   │   ├── StepStatus.test.tsx
│       │   │   │   └── DownloadButton.test.tsx
│       │   │   ├── ui/
│       │   │   │   ├── ErrorAlert.test.tsx
│       │   │   │   ├── ErrorBoundary.test.tsx
│       │   │   │   └── LoadingSpinner.test.tsx
│       │   │   └── services/
│       │   │       ├── project.service.test.ts
│       │   │       ├── workflow.service.test.ts
│       │   │       ├── results.service.test.ts
│       │   │       └── api-client.service.test.ts
│       │   └── hooks/
│       │           ├── useProjects.test.ts
│       │           ├── useWorkflow.test.ts
│       │           └── useResults.test.ts
│   └── integration/
│           ├── api-worker.test.ts
│           ├── workflow-worker.test.ts
│           └── end-to-end.test.ts
└── scripts/
    ├── build.sh
    └── deploy.sh
```

---

## Convenciones de Nombres

### Archivos de Código

- **Extensiones:**
  - `.ts`: TypeScript
  - `.tsx`: TypeScript con JSX
  - `.js`: JavaScript
  - `.json`: JSON
  - `.sql`: SQL
  - `.md`: Markdown
  - `.toml`: Configuración de Wrangler
  - `.sh`: Scripts de shell
  - `.example`: Plantillas de configuración

- **Nombres de archivos:**
  - `kebab-case`: Para nombres de archivos (ej: `project.service.ts`)
  - `descriptivo`: Para nombres de clases (ej: `ProjectService`)
  - `snake_case`: Para variables de entorno (ej: `OPENAI_API_KEY`)

- **Sufijos por tipo:**
  - `*.handler.ts`: Para handlers de Hono
  - `*.service.ts`: Para servicios
  - `*.middleware.ts`: Para middleware
  - `*.types.ts`: Para definiciones de tipos
  - `*.test.ts`: Para pruebas unitarias
  - `*.test.tsx`: Para pruebas de componentes React
  - `*.step.ts`: Para pasos de workflow
  - `*.error.ts`: Para clases de error

### Directorios

- **Nombre en singular, minúsculas:**
  - `handlers/`, `services/`, `middleware/`, `errors/`, `types/`, `utils/`, `steps/`, `components/`, `hooks/`, `config/`, `lib/`, `pages/`

- **Nombres descriptivos:**
  - `api/` para API Worker
  - `workflow/` para Workflow Worker
  - `frontend/` para React app
  - `tests/` para pruebas
  - `scripts/` para scripts de utilidad

---

## Convenciones de Código

### TypeScript

```typescript
// Tipos básicos
type UUID = string;
type DateTime = string; // ISO 8601 format

// Tipos de dominio
interface Project {
  id: UUID;
  nombre: string;
  descripcion: string | null;
  i_json: string;
  estado: ProjectState;
  asesor_responsable: string | null;
  fecha_creacion: DateTime;
  fecha_actualizacion: DateTime;
  fecha_analisis_inicio: DateTime | null;
  fecha_analisis_fin: DateTime | null;
  i_json_url: string | null;
}

interface Execution {
  id: UUID;
  proyecto_id: UUID;
  estado: ExecutionState;
  fecha_inicio: DateTime;
  fecha_fin: DateTime | null;
  error_mensaje: string | null;
}

interface Step {
  id: UUID;
  ejecucion_id: UUID;
  tipo_paso: StepType;
  orden: number;
  estado: StepState;
  fecha_inicio: DateTime;
  fecha_fin: DateTime | null;
  error_mensaje: string | null;
  ruta_archivo_r2: string | null;
}

// Enums
enum ProjectState {
  CREADO = 'creado',
  PROCESANDO_ANALISIS = 'procesando_analisis',
  ANALISIS_CON_ERROR = 'analisis_con_error',
  ANALISIS_FINALIZADO = 'analisis_finalizado'
}

enum ExecutionState {
  INICIADA = 'iniciada',
  EN_EJECUCION = 'en_ejecucion',
  FINALIZADA_CORRECTAMENTE = 'finalizada_correctamente',
  FINALIZADA_CON_ERROR = 'finalizada_con_error'
}

enum StepState {
  PENDIENTE = 'pendiente',
  EN_EJECUCION = 'en_ejecucion',
  CORRECTO = 'correcto',
  ERROR = 'error'
}

enum StepType {
  RESUMEN = 'resumen',
  DATOS_CLAVE = 'datos_clave',
  ACTIVO_FISICO = 'activo_fisico',
  ACTIVO_ESTRATEGICO = 'activo_estrategico',
  ACTIVO_FINANCIERO = 'activo_financiero',
  ACTIVO_REGULADO = 'activo_regulado',
  LECTURA_INVERSOR = 'lectura_inversor',
  LECTURA_EMPRENDEDOR = 'lectura_emprendedor',
  LECTURA_PROPIETARIO = 'lectura_propietario'
}
```

### Respuestas de API

```typescript
interface ApiResponse<T> {
  data: T;
}

interface ApiError {
  error: string;
}

type ProjectListResponse = ApiResponse<Project[]>;
type ProjectResponse = ApiResponse<Project>;
type ExecutionListResponse = ApiResponse<Execution[]>;
type ExecutionResponse = ApiResponse<Execution>;
type ResultsResponse = ApiResponse<ResultsData>;

interface ResultsData {
  proyecto: Project;
  ejecuciones: Execution[];
  informes: Informe[];
}

interface Informe {
  tipo: StepType;
  contenido: string;
  ruta_archivo_r2: string;
}
```

---

## Convenciones de Configuración

### Variables de Entorno

```bash
# .dev.vars.example (para desarrollo local)
OPENAI_API_KEY=your_openai_api_key_here

# .env.example (para frontend)
VITE_API_BASE_URL=http://localhost:8787
```

### Wrangler Bindings

```toml
[[kv_namespaces]]
binding = "SECRETS"
id = "secrets-api-inmo"

[[r2_buckets]]
binding = "STORAGE"
bucket_name = "r2-almacen"

[[d1_databases]]
binding = "DB"
database_name = "vaaia-db"
database_id = "<database-id-from-inventory>"
```

---

## Convenciones de Pruebas

### Nombres de Archivos de Pruebas

- **Unit tests:** `*.test.ts` para pruebas unitarias
- **E2E tests:** `*.test.ts` para pruebas end-to-end
- **Test suites:** Organizados por módulo (api, workflow, frontend)
- **Mocks:** `*.mock.ts` para servicios externos

### Estructura de Test

```typescript
describe('ProjectService', () => {
  describe('create', () => {
    it('should create project', async () => {
      // test implementation
    });
  });

  describe('getById', () => {
    it('should return project by id', async () => {
      // test implementation
    });
  });
});
```

---

## Convenciones de Estilos

### Tailwind CSS

- **Utilizar clases de utilidad de Tailwind:**
  - `text-sm`, `text-base`, `text-lg`: Tamaños de texto
  - `bg-white`, `bg-gray-50`, `bg-gray-100`: Fondos
  - `text-gray-500`, `text-gray-700`: Textos
  - `border-gray-200`, `border-gray-300`: Bordes
  - `rounded-md`, `rounded-lg`: Bordes redondeados
- **Colores personalizados:**
  - `primary-600`: Color principal
  - `success-500`: Color de éxito
  - `danger-500`: Color de error

---

## Notas Importantes

1. **Prefijo de tablas:** Todas las tablas de D1 deben usar el prefijo `ani_` según la política del proyecto.

2. **Sin hardcoding:** Todos los textos de UI, mensajes de error y valores configurables deben venir de archivos de configuración, no estar hardcodeados en el código.

3. **Estructura de handlers:** Los handlers de Hono deben seguir el patrón de inyección de dependencias (services, utils, types).

4. **Separación de responsabilidades:** Cada módulo (api, workflow, frontend) debe tener su propia estructura y no depender de otros módulos excepto a través de interfaces bien definidas.

5. **Tipos estrictos:** TypeScript debe configurarse con `strict: true` para evitar errores comunes.

6. **Nombres descriptivos:** Usar nombres claros y descriptivos para archivos, clases y funciones. Evitar abreviaciones confusas.

7. **Testing primero:** Cada módulo debe tener pruebas unitarias antes de pasar al siguiente sprint.

8. **Documentación de cambios:** Al crear o modificar recursos de Cloudflare, actualizar el inventario de recursos inmediatamente.

---

> **Nota:** Esta estructura está basada en [`implementation-plan.md`](./implementation-plan.md) y [`sprints-tasks.md`](./sprints-tasks.md) y debe respetarse estrictamente durante la implementación.
