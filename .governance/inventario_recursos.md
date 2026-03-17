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

## 2. GitHub Secrets (CI/CD)

| Secret | Uso | Consume | Estado |
|--------|-----|---------|--------|
| `CF_API_TOKEN` | Token para API de Cloudflare | GitHub Actions / wrangler | 🔲 |
| `CF_ACCOUNT_ID` | Identificador de cuenta para despliegues | GitHub Actions / wrangler | 🔲 |
| `[AGREGAR]` | [Descripción] | [Worker/Service] | 🔲 |

> **Nota:** Los valores de secrets nunca se documentan en este archivo. Usar `wrangler secret put` para gestión local.

---

## 3. Secrets de Desarrollo Local

### 3.1. Backend (`.dev.vars`)

| Variable | Uso | Sensible | Estado |
|----------|-----|----------|--------|
| `[VAR_NAME]` | [Descripción del uso] | Sí | 🔲 |

### 3.2. Frontend (`.env`)

| Variable | Uso | Sensible | Estado |
|----------|-----|----------|--------|
| `[VAR_NAME]` | [Descripción del uso] | Sí | 🔲 |

> **Nota:** Usar `.dev.vars.example` y `.env.example` como plantillas versionadas sin valores reales.

---

## 4. Recursos Cloudflare

### 4.1 Workers

| Nombre | Binding | App/Proyecto | Puerto Dev | Estado CF | Último Deploy |
|--------|---------|--------------|------------|-----------|---------------|
| `[WORKER_NAME]` | `[BINDING]` | [Proyecto] | [8787] | 🔲 | [YYYY-MM-DD] |

### 4.2 KV Namespaces

| Nombre en CF | ID | Binding | App | Estado |
|--------------|----|---------|-----|--------|
| `[NOMBRE_KV]` | [ID] | [BINDING_NAME] | [Worker/App] | 🔲 |

**Keys en `[NOMBRE_KV]`**

| Key | Descripción | Estado |
|-----|-------------|--------|
| `[KEY_NAME]` | [Propósito de la key] | 🔲 |

### 4.3 Bases de Datos (D1)

| Nombre | Binding | App | ID | Estado |
|--------|---------|-----|----|--------|
| `[DB_NAME]` | [BINDING] | [Worker] | [ID] | 🔲 |

### 4.4 Buckets R2

| Nombre | Binding | App | Estado |
|--------|---------|-----|--------|
| `[BUCKET_NAME]` | [BINDING] | [Worker] | 🔲 |

### 4.5 Queues

| Nombre | Binding (Productor) | Binding (Consumidor) | App | Estado |
|--------|---------------------|----------------------|-----|--------|
| `[QUEUE_NAME]` | [PRODUCER_BINDING] | [CONSUMER_BINDING] | [Worker] | 🔲 |

### 4.6 Workflows

| Nombre | Binding | Clase | Worker Asociado | Estado |
|--------|---------|-------|-----------------|--------|
| `[WORKFLOW_NAME]` | [BINDING] | [CLASS_NAME] | [WORKER] | 🔲 |

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
| `[PAGES_NAME]` | [URL] | [APP] | [GitHub/GitLab] | 🔲 |

---

## 5. Wrangler y Despliegue

| Campo | Valor |
|-------|-------|
| **Uso de Wrangler** | [Sí/No] |
| **Archivo de configuración** | [wrangler.toml / wrangler.jsonc] |
| **Método de autenticación** | [GitHub Actions + wrangler-action / wrangler login / Manual] |
| **Environments configurados** | [dev, staging, production] |
| **account_id** | No documentado (resolver vía login) |

### 5.1 Bindings y Variables de Entorno (wrangler)

| Clave o Binding | Tipo | Estado | Ubicación | Observaciones |
|-----------------|------|--------|-----------|---------------|
| `[BINDING_NAME]` | [KV/D1/R2/Queue/AI] | 🔲 | wrangler.toml/jsonc | [Descripción] |

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
| `[SERVICIO]` | [Descripción] | `[VAR_1, VAR_2]` | 🔲 |

**Integraciones comunes (referencia):**

| Servicio | Propósito | Variables típicas |
|----------|-----------|-------------------|
| OpenAI | Inferencia IA | `OPENAI_API_KEY` |
| Anthropic | Inferencia IA | `ANTHROPIC_API_KEY` |
| Clerk | Autenticación | `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY` |
| Google | OAuth/IA | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` |

---

## 8. Contratos entre Servicios

| Servicio Origen | Servicio Destino | Endpoint | Método | Request | Response | Estado |
|-----------------|------------------|----------|--------|---------|----------|--------|
| `[ORIGEN]` | `[DESTINO]` | `[RUTA]` | [GET/POST/etc.] | `[FORMATO]` | `[FORMATO]` | 🔲 |

---

## 9. Stack Tecnológico

| Capa | Tecnología | Versión | Estado |
|------|------------|---------|--------|
| Lenguaje | TypeScript | [latest] | 🔲 |
| Framework | Hono | [4.x] | 🔲 |
| Frontend | React | [19.x] | 🔲 |
| Build tool | Vite | [latest] | 🔲 |
| UI Components | shadcn/ui | [latest] | 🔲 |
| Styling | Tailwind CSS | [v4.x] | 🔲 |
| Router | React Router | [v7] | 🔲 |
| Testing | Vitest | [latest] | 🔲 |
| Validación | Zod | [latest] | 🔲 |
| IA (opcional) | AI SDK | [5.x] | 🔲 |

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
- Configuración de CI/CD y GitHub Secrets

---

## 13. Historial de Cambios

| Fecha | Cambio | Responsable | Aprobado Por |
|-------|--------|-------------|--------------|
| [YYYY-MM-DD] | [Descripción del cambio] | [Nombre] | [Nombre] |

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
