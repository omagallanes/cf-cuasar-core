# Inventario de Recursos y Configuración

> **Finalidad:** Fuente única de verdad para recursos Cloudflare, CI/CD, bindings, variables de entorno y configuración operativa del proyecto.  
> **Versión:** 5.0  
> **Importante:** Este archivo es gestionado exclusivamente por el agente `inventariador`. Las modificaciones directas serán rechazadas.

---

## Leyenda de Estado

| Símbolo | Significado |
|---------|-------------|
| ✅ | Existe en Cloudflare y está referenciado correctamente en el repositorio |
| ⚠️ | Existe en Cloudflare pero hay discrepancia con el repositorio |
| 🔲 | Declarado en configuración pero NO creado en Cloudflare |
| 🚫 | Servicio Cloudflare no habilitado en la cuenta |
| 🗑️ | Existe en Cloudflare pero sin referencia en el repositorio (huérfano) |

---

## Reglas de Uso

- No inventar valores.
- No incluir secretos ni credenciales en texto plano.
- **Solo el agente `inventariador` puede actualizar este archivo.**
- Todo agente debe consultarlo antes de ejecutar trabajo con impacto operativo.
- Para solicitar cambios, usa el prompt: "Necesito actualizar el inventario: [detalles]"

---

## 0. Método de Despliegue Activo

| Campo | Valor |
|-------|-------|
| **Método** | Despliegue directo con Wrangler desde terminal |
| **Agente responsable** | `cloudflare-wrangler-deploy` |
| **CI/CD (GitHub Actions)** | No utilizado (disponible como referencia) |
| **Fecha de decisión** | 2026-03-17 |
| **Documento dedicado** | `.governance/metodo_despliegue.md` |

> **Importante:** Este proyecto usa **despliegue directo con Wrangler desde terminal**. El agente responsable es `cloudflare-wrangler-deploy`. **No se utilizan GitHub Actions ni CI/CD de GitHub para despliegues.** Para más detalles, consultar `.governance/metodo_despliegue.md`.

---

## 1. Resumen del Proyecto

| Campo | Valor |
|-------|-------|
| **Nombre del proyecto** | [Nombre del proyecto] |
| **Finalidad** | [Descripción breve del propósito] |
| **Entorno de trabajo** | [VS Code, GitHub Codespaces, etc.] |
| **Lenguaje base** | [TypeScript, JavaScript, etc.] |
| **Entornos de despliegue** | [dev, staging, production] |
| **CI/CD y GitHub Secrets** | [Por definir / Configurado] |
| **Estructura del proyecto** | [Código en raíz / apps/, packages/] |

---

## 2. Secrets para Despliegue Directo

| Secret | Uso | Consume | Estado |
|--------|-----|---------|--------|
| `CLOUDFLARE_API_TOKEN` | Token para API de Cloudflare | wrangler CLI / GitHub Codespaces | ✅ |
| `CLOUDFLARE_ACCOUNT_ID` | Identificador de cuenta para despliegues | wrangler CLI / GitHub Codespaces | ✅ |
| `[AGREGAR]` | [Descripción] | [Worker/Service] | 🔲 |

> **Importante:** Este proyecto usa despliegue directo con Wrangler desde terminal. Los secrets se gestionan mediante:
> - `wrangler secret put` para secrets remotos (producción)
> - GitHub Codespaces Secrets para entorno de desarrollo en Codespaces
> - **No se usa GitHub Actions ni CI/CD de GitHub para despliegues**

> **Nota:** Los valores de secrets nunca se documentan en este archivo. Usar `wrangler secret put` para gestión local.

---

## 3. Secrets de Desarrollo Local

### 3.1. Backend (`.dev.vars`)

| Variable | Uso | Sensible | Estado |
|----------|-----|----------|--------|
| `OPENAI_API_KEY` | Clave de API para inferencia OpenAI (almacenada en KV "secrets-api-inmo") | Sí | ✅ |

### 3.2. Frontend (`.env`)

| Variable | Uso | Sensible | Estado |
|----------|-----|----------|--------|
| `VITE_API_BASE_URL` | URL base de la API del backend | No | ✅ |
| `VITE_PAGES_URL` | URL de Cloudflare Pages para el frontend | No | ✅ |
| `VITE_CORS_ORIGINS` | Orígenes permitidos para CORS | No | ✅ |
| `VITE_WORKFLOW_POLLING_INTERVAL` | Intervalo de polling para estado de workflow (segundos) | No | ✅ |
| `VITE_WORKFLOW_POLLING_MAX_ATTEMPTS` | Máximo de intentos de polling para workflow | No | ✅ |

**Archivos de configuración:**
- `src/frontend/.env` (desarrollo)
- `src/frontend/.env.production` (producción)
- `src/frontend/.env.example` (plantilla)

> **Nota:** Usar `.dev.vars.example` y `.env.example` como plantillas versionadas sin valores reales.

---

## 4. Recursos Cloudflare

### 4.1 Workers

| Nombre | Bindings | App/Proyecto | Puerto Dev | Estado CF | Último Deploy | URL |
|--------|----------|--------------|------------|-----------|---------------|-----|
| `wk-api-inmo` | CF_B_KV_SECRETS, CF_B_DB-INMO, CF_B_R2_INMO | API Worker | 8787 | ✅ | 2026-03-19 | https://wk-api-inmo.levantecofem.workers.dev |
| `wk-proceso-inmo` | CF_B_KV_SECRETS, CF_B_DB-INMO, CF_B_R2_INMO | Workflow Worker | 8788 | ✅ | 2026-03-19 | https://wk-proceso-inmo.levantecofem.workers.dev |

### 4.2 KV Namespaces

| Nombre en CF | ID | Binding | App | Estado |
|--------------|----|---------|-----|--------|
| `secrets-api-inmo` | b9e80742f2a74d89b3e9083245b35709 | [BINDING_NAME] | [Worker/App] | ✅ |

**Keys en `secrets-api-inmo`**

| Key | Descripción | Estado |
|-----|-------------|--------|
| `OPENAI_API_KEY` | Clave de API para inferencia OpenAI | ✅ |

### 4.3 Bases de Datos (D1)

| Nombre | Binding | App | ID | Estado |
|--------|---------|-----|----|--------|
| `db-inmo` | `CF_B_DB-INMO` | `wk-api-inmo`, `wk-proceso-inmo` | `871d7b6b-39b0-404b-9066-1ba1a7b8f50a` | ✅ |

### 4.4 Buckets R2

| Nombre | Binding | App | Estado |
|--------|---------|-----|--------|
| `r2-almacen` | `CF_B_R2_INMO` | `wk-api-inmo`, `wk-proceso-inmo` | ✅ |

**Estructura de almacenamiento en R2:**

- **Ruta base:** `r2-almacen/dir-api-inmo/{proyecto_id}/`
- **Archivos generados:**
  - `resumen.md`
  - `datos_clave.md`
  - `activo_fisico.md`
  - `activo_estrategico.md`
  - `activo_financiero.md`
  - `activo_regulado.md`
  - `lectura_inversor.md`
  - `lectura_emprendedor.md`
  - `lectura_propietario.md`

### 4.5 Queues

| Nombre | Binding (Productor) | Binding (Consumidor) | App | Estado |
|--------|---------------------|----------------------|-----|--------|
| `[QUEUE_NAME]` | [PRODUCER_BINDING] | [CONSUMER_BINDING] | [Worker] | 🔲 |

### 4.6 Workflows

| Nombre | Binding | Clase | Worker Asociado | Estado |
|--------|---------|-------|-----------------|--------|
| `analysis-workflow` | `ANALYSIS_WORKFLOW` | `AnalysisWorkflow` | `wk-proceso-inmo` | ✅ |

### 4.7 Workers AI

| Binding | Modelo | App | Estado |
|---------|--------|-----|--------|
| `[AI_BINDING]` | [Modelo] | [Worker] | 🔲 |

### 4.8 Vectorize (opcional)

| Nombre | Binding | Dimensiones | Métrica | Estado |
|--------|---------|-------------|---------|--------|
| `[VECTORIZE_NAME]` | [BINDING] | [1536] | [cosine] | 🔲 |

### 4.9 Cloudflare Pages / Frontend

| Proyecto | URL | App Asociada | Proveedor Git | Estado |
|----------|-----|--------------|---------------|--------|
| `cb-consulting` | https://cb-consulting.pages.dev/ | [APP] | GitHub | ✅ |

**Frontend React (Sprint 4):**

| Campo | Valor |
|-------|-------|
| **Ubicación** | `src/frontend/` |
| **Framework** | React 19.x |
| **Build tool** | Vite 5.x |
| **Styling** | Tailwind CSS 4.x |
| **Router** | React Router 7.x |
| **Configuración** | `vite.config.ts`, `tsconfig.json`, `tailwind.config.js` |

**Estructura de directorios del frontend:**

```
src/frontend/
├── src/
│   ├── components/       # Componentes React
│   │   ├── layout/       # MainLayout, Sidebar, Header
│   │   ├── ui/           # Button, Input, Select, Textarea, Card, Table, Modal, Spinner, Badge, Alert
│   │   ├── ui/form/      # FormGroup, FormLabel, FormError
│   │   ├── projects/     # ProjectList, ProjectCard, ProjectForm, ProjectDetail, StatusBadge, ErrorMessage
│   │   ├── results/      # ResultsViewer, ReportTab, ReportLoading, ReportError
│   │   ├── ErrorBoundary.tsx
│   │   └── index.ts
│   ├── pages/            # Dashboard, ProjectsPage, CreateProjectPage, ProjectDetailPage, ResultsPage
│   ├── services/         # projectService.ts, workflowService.ts, resultsService.ts
│   ├── hooks/            # useProjects, useWorkflow, useResults, useApi, useTexts, useCreateProjectWithUI, useWorkflowPolling, useDebounce, useApiErrorHandler
│   ├── config/           # texts.ts, errors.ts, validation.ts, navigation.ts, reports.ts
│   ├── types/            # project.ts, workflow.ts, api.ts, components.ts, errors.ts, index.ts
│   ├── lib/              # apiClient.ts, queryClient.ts, queryProvider.tsx, schemas/projectSchema.ts
│   └── styles/           # globals.css
├── public/               # Archivos estáticos
├── .env                  # Variables de entorno (desarrollo)
├── .env.production       # Variables de entorno (producción)
├── .env.example          # Plantilla de variables de entorno
├── index.html            # HTML entry point
├── vite.config.ts        # Configuración Vite
├── tsconfig.json         # Configuración TypeScript
└── tailwind.config.js    # Configuración Tailwind CSS
```

**Componentes implementados:**

- **Layout:** MainLayout, Sidebar, Header
- **UI:** Button, Input, Select, Textarea, Card, Table, Modal, Spinner, Badge, Alert
- **Form:** FormGroup, FormLabel, FormError
- **Projects:** ProjectList, ProjectCard, ProjectForm, ProjectDetail, StatusBadge, ErrorMessage
- **Results:** ResultsViewer, ReportTab, ReportLoading, ReportError

**Páginas implementadas:**

- Dashboard
- ProjectsPage
- CreateProjectPage
- ProjectDetailPage
- ResultsPage

**Servicios implementados:**

- projectService.ts
- workflowService.ts
- resultsService.ts

**Hooks implementados:**

- useProjects
- useWorkflow
- useResults
- useApi
- useTexts

**Configuraciones implementadas:**

- texts.ts (textos de la aplicación)
- errors.ts (mensajes de error)
- validation.ts (esquemas de validación Zod)
- navigation.ts (configuración de navegación)
- reports.ts (configuración de reportes)

---

## 5. Wrangler y Despliegue

| Campo | Valor |
|-------|-------|
| **Método de despliegue activo** | Despliegue directo con Wrangler desde terminal |
| **Agente responsable** | `cloudflare-wrangler-deploy` |
| **CI/CD automatizado** | No utilizado |
| **Uso de Wrangler** | Sí |
| **Archivo de configuración** | wrangler.toml / wrangler.jsonc |
| **Método de autenticación** | `wrangler login` (interactivo) |
| **Environments configurados** | dev, production |
| **account_id** | No documentado (resolver vía login) |

> **Importante:** Este proyecto usa **despliegue directo con Wrangler desde terminal**. El agente responsable es `cloudflare-wrangler-deploy`. **No se utilizan GitHub Actions ni CI/CD de GitHub para despliegues.**

### 5.1 Bindings y Variables de Entorno (wrangler)

| Clave o Binding | Tipo | Estado | Ubicación | Observaciones |
|-----------------|------|--------|-----------|---------------|
| `CF_B_KV_SECRETS` | KV | ✅ | wrangler.toml | Binding para KV de secretos (sigue convención R16) |
| `CF_B_DB-INMO` | D1 | ✅ | wrangler.toml | Binding para base de datos D1 (sigue convención R16) |
| `CF_B_R2_INMO` | R2 | ✅ | wrangler.toml | Binding para bucket R2 (sigue convención R16) |

---

## 6. Variables de Entorno por App

### `[Nombre de la App/Worker]`

| Variable | Tipo | Sensible | Descripción | Estado |
|----------|------|----------|-------------|--------|
| `[VAR_NAME]` | [String/Number/Boolean] | [Sí/No] | [Descripción] | 🔲 |

---

## 7. Integraciones Externas

| Servicio | Propósito | Variables Requeridas | Estado |
|----------|-----------|---------------------|--------|
| OpenAI | Inferencia IA para análisis de proyectos inmobiliarios | `OPENAI_API_KEY` (almacenada en KV `secrets-api-inmo`) | ✅ |

**Integraciones comunes (referencia):**

| Servicio | Propósito | Variables típicas |
|----------|-----------|-------------------|
| OpenAI | Inferencia IA | `OPENAI_API_KEY` |
| Anthropic | Inferencia IA | `ANTHROPIC_API_KEY` |
| Clerk | Autenticación | `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY` |
| Google | OAuth/IA | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` |

**Configuración de OpenAI (Sprint 3):**

- **API Endpoint:** `https://api.openai.com/v1/responses`
- **Modelo:** `gpt-5.2`
- **Almacenamiento de secret:** `OPENAI_API_KEY` en KV namespace `secrets-api-inmo`
- **Implementación:** `src/workers/workflow/services/openai.service.ts`

---

## 8. Contratos entre Servicios

| Servicio Origen | Servicio Destino | Endpoint | Método | Request | Response | Estado |
|-----------------|------------------|----------|--------|---------|----------|--------|
| `[ORIGEN]` | `[DESTINO]` | `[RUTA]` | [GET/POST/etc.] | `[FORMATO]` | `[FORMATO]` | 🔲 |

---

## 9. Stack Tecnológico

| Capa | Tecnología | Versión | Estado |
|------|------------|---------|--------|
| Lenguaje | TypeScript | 5.x | ✅ |
| Framework Backend | Hono | 4.x | ✅ |
| Frontend | React | 19.x | ✅ |
| Build tool | Vite | 5.x | ✅ |
| Styling | Tailwind CSS | 4.x | ✅ |
| Router | React Router | 7.x | ✅ |
| State Management | TanStack React Query | 5.x | ✅ |
| HTTP Client | Axios | 1.x | ✅ |
| Markdown Rendering | React Markdown | 9.x | ✅ |
| Code Syntax Highlighting | react-syntax-highlighter | 15.x | ✅ |
| Markdown Extensions | remark-gfm | 4.x | ✅ |
| Icons | Lucide React | 0.400.x | ✅ |
| Validación | Zod | 3.x | ✅ |
| Cloudflare Workers | Wrangler | 3.x | ✅ |
| Cloudflare Workers Types | @cloudflare/workers-types | 4.x | ✅ |
| Types | @types/react-syntax-highlighter | 15.x | ✅ |

---

## 10. Comandos de Desarrollo

### 10.1 Comandos Globales

```bash
# Build, lint, typecheck
npm run build
npm run lint
npm run typecheck

# Tests
npm run test
npm run test:coverage
```

### 10.2 Comandos por Servicio

| Servicio | Dev | Build | Test | Typecheck |
|----------|-----|-------|------|-----------|
| `[SERVICE]` | `npm run dev:[service]` | `npm run build:[service]` | `npm run test:[service]` | `npm run typecheck:[service]` |

### 10.3 Migraciones de Base de Datos

```bash
# Aplicar migraciones
wrangler d1 execute [DB_NAME] --file=[path].sql --remote

# Listar migraciones
wrangler d1 execute [DB_NAME] --command="SELECT * FROM d1_migrations"
```

### 10.4 Gestión de Secrets

```bash
# Secret remoto (producción)
wrangler secret put [SECRET_NAME]

# Secret para entorno específico
wrangler secret put [SECRET_NAME] --env [dev/staging]
```

---

## 11. Archivos de Configuración

| Archivo | Finalidad | Estado |
|---------|-----------|--------|
| `package.json` | Dependencias y scripts | 🔲 |
| `tsconfig.json` | Configuración TypeScript | 🔲 |
| `vite.config.ts` | Configuración Vite | 🔲 |
| `wrangler.toml` o `wrangler.jsonc` | Configuración Wrangler | 🔲 |
| `tailwind.config.js` | Configuración Tailwind | 🔲 |
| `components.json` | Configuración shadcn/ui | 🔲 |
| `schema.sql` | Esquema de base de datos | 🔲 |
| `.dev.vars.example` | Plantilla variables backend | 🔲 |
| `.env.example` | Plantilla variables frontend | 🔲 |
| `.gitignore` | Exclusiones de versionado | 🔲 |

---

## 12. Vacíos Pendientes de Confirmación

| Elemento | Tipo | Observaciones | Responsable |
|----------|------|---------------|-------------|
| `[ELEMENTO]` | [Recurso/Variable/Config] | [Descripción de lo pendiente] | [Usuario/Equipo] |

**Vacíos comunes (referencia):**

- Nombre del proyecto final
- Dominio personalizado para producción
- Estrategia de pruebas (unitarias, integración, E2E)
- Configuración de CORS para orígenes permitidos
- Límites de rate limiting para la API
- Servicios opcionales a habilitar (auth, queues, vectorize, workflows)
- Configuración de autenticación Wrangler para todos los desarrolladores

---

## 13. Historial de Cambios

| Fecha | Cambio | Responsable | Aprobado Por |
|-------|--------|-------------|--------------|
| 2026-03-19 | Sprint 5 completado: Workers desplegados exitosamente (wk-api-inmo: https://wk-api-inmo.levantecofem.workers.dev, wk-proceso-inmo: https://wk-proceso-inmo.levantecofem.workers.dev). Tareas completadas: 5.1 (Flujo de Creación de Proyecto), 5.2 (Flujo de Ejecución de Workflow), 5.3 (Visualización de Resultados), 5.4 (Gestión de Errores en Frontend), 5.5 (Optimizaciones). Archivos creados: src/frontend/src/lib/schemas/projectSchema.ts (esquema Zod para validación de I-JSON), src/frontend/src/hooks/useCreateProjectWithUI.ts (hook para creación de proyectos con estados de UI), src/frontend/src/hooks/useWorkflowPolling.ts (hook para polling de estado de workflow), src/frontend/src/hooks/useDebounce.ts (hook para debouncing), src/frontend/src/hooks/useApiErrorHandler.ts (hook para manejo de errores), src/frontend/src/types/errors.ts (tipos de error personalizados), src/frontend/src/components/ErrorBoundary.tsx (ErrorBoundary component). Archivos actualizados: ProjectForm, CreateProjectPage, ProjectDetail, ProjectDetailPage, ResultsPage, ResultsViewer, ReportTab, ProjectList, ProjectCard, StatusBadge, apiClient, queryClient, config/texts.ts, config/errors.ts, config/reports.ts, config/validation.ts, useProjects, useResults, useWorkflow, hooks/index.ts, types/index.ts, components/index.ts. Variables de entorno agregadas: VITE_WORKFLOW_POLLING_INTERVAL (10 segundos), VITE_WORKFLOW_POLLING_MAX_ATTEMPTS (3 intentos). Archivos de configuración actualizados: src/frontend/.env, src/frontend/.env.production, src/frontend/.env.example. Dependencias agregadas: react-syntax-highlighter, remark-gfm, @types/react-syntax-highlighter. Validación typecheck exitosa sin errores de TypeScript | inventariador | Usuario |
| 2026-03-18 | Sprint 4 completado: Frontend React configurado en `src/frontend/`. Estructura de directorios creada (components/, pages/, services/, hooks/, config/, types/, lib/, styles/, public/). Componentes UI implementados (Button, Input, Select, Textarea, Card, Table, Modal, Spinner, Badge, Alert, Form components). Layout components (MainLayout, Sidebar, Header). Projects components (ProjectList, ProjectCard, ProjectForm, ProjectDetail, StatusBadge, ErrorMessage). Results components (ResultsViewer, ReportTab, ReportLoading, ReportError). Páginas creadas (Dashboard, ProjectsPage, CreateProjectPage, ProjectDetailPage, ResultsPage). Servicios API (projectService.ts, workflowService.ts, resultsService.ts). Hooks personalizados (useProjects, useWorkflow, useResults, useApi, useTexts). Configuraciones (texts.ts, errors.ts, validation.ts, navigation.ts, reports.ts). Variables de entorno documentadas (VITE_API_BASE_URL, VITE_PAGES_URL, VITE_CORS_ORIGINS). Archivos de configuración: vite.config.ts, tsconfig.json, tailwind.config.js, .env, .env.production, .env.example. Dependencias agregadas: react 19.x, react-dom 19.x, react-router-dom 7.x, axios 1.x, react-markdown 9.x, zod 3.x, @tanstack/react-query 5.x, lucide-react 0.400.x, tailwindcss 4.x, vite 5.x. Validación typecheck exitosa sin errores de TypeScript | inventariador | Usuario |
| 2026-03-18 | Sprint 3 completado: Cloudflare Workflow `analysis-workflow` configurado en worker `wk-proceso-inmo`. Archivos creados: `src/workers/workflow/index.ts` (AnalysisWorkflow), `src/workers/workflow/orchestration.ts`, `src/workers/workflow/services/workflow.service.ts`, `src/workers/workflow/services/openai.service.ts`. Integración con OpenAI Responses API implementada (endpoint: https://api.openai.com/v1/responses, modelo: gpt-5.2). Estructura de almacenamiento R2 documentada (9 archivos markdown por proyecto). Bindings del workflow worker: KV (secrets-api-inmo), D1 (db-inmo), R2 (r2-almacen). Validación typecheck exitosa sin errores de TypeScript | inventariador | Usuario |
| 2026-03-18 | Sprint 1 completado: D1 Database `db-inmo` creada en Cloudflare con ID `871d7b6b-39b0-404b-9066-1ba1a7b8f50a`. Workers `wk-api-inmo` y `wk-proceso-inmo` configurados con bindings en wrangler.toml. Bindings actualizados: `CF_B_KV_SECRETS`, `CF_B_DB-INMO`, `CF_B_R2_INMO` | inventariador | Usuario |
| 2026-03-18 | Actualización de nombres de recursos: Workers (`wk-api-inmo`, `wk-proceso-inmo`), D1 Database (`db-inmo`), Bindings (`CF_B_KV_SECRETS`, `CF_B_DB_INMO`, `CF_B_R2_INMO`) siguiendo convenciones de nomenclatura | inventariador | Usuario |
| 2026-03-17 | Separación de agente wrangler: `cloudflare-wrangler-actions` (CI/CD) y `cloudflare-wrangler-deploy` (terminal directo). Añadida Sección 0 (Método de Despliegue) y archivo `.governance/metodo_despliegue.md` | orquestador | Usuario |
| 2026-03-17 | Actualización de recursos: GitHub Secrets (CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN), KV Namespace (secrets-api-inmo), OPENAI_API_KEY en KV, R2 Bucket (r2-almacen) con directorio dir-api-inmo/, Cloudflare Pages (cb-consulting) | inventariador | Usuario |

---

## Notas de Mantenimiento

1. **Actualización exclusiva:** Solo el agente `inventariador` puede actualizar este archivo.
2. **Solicitud de cambios:** Los usuarios deben solicitar cambios a través del orquestador.
3. **Auditoría periódica:** El agente `inventory-auditor` verifica consistencia con recursos reales en Cloudflare.
4. **Aprobación:** Los cambios críticos requieren aprobación explícita del usuario antes de commit.
5. **Consulta previa:** Todo agente debe consultar este inventario antes de generar código que referencie recursos.
6. **No hardcoding:** Toda la información configurable debe quedar fuera del código o en KV si fuera necesario.
7. **Sistema multidioma (i18n):** Usar código de idioma `es-ES` por defecto para mensajes al usuario.

---

> **Nota:** Este documento es una plantilla base. Completar con los valores reales del proyecto y mantener actualizado.
