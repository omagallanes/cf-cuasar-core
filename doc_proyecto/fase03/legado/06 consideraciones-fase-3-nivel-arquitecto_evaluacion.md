# Consideraciones de Arquitectura — FASE 3

> **Documento:** FASE 3 — Diseño  
> **Fuente principal:** [`01 architecture.md`](./01%20architecture.md)  
> **Versión:** 1.0  
> **Fecha:** 2026-03-18

---

## Resumen

Este documento documenta las consideraciones arquitectónicas del proyecto VaaIA a nivel de diseño, identificando decisiones ya tomadas, decisiones pendientes y políticas transversales que deben guiar la implementación.

---

## Decisiones Arquitectónicas Ya Tomadas

### DA-01: Frontend — Stack y Plantilla Base

**Estado:** ✅ Accepted (decisión tomada en consideraciones previas)

**Decisión:**
- Adoptar **TailAdmin free-react-tailwind-admin-dashboard** como plantilla base para el frontend
- **Stack:** React + TypeScript + Tailwind CSS v4
- **Tipo:** SPA administrativa

**Justificación:**
- Aceleración del desarrollo con componentes preconstruidos
- Consistencia visual y funcional probada
- Reducción de tiempo de desarrollo de UI administrativa
- Acceso a patrones de diseño establecidos
- Compatibilidad con arquitectura serverless de Cloudflare Workers

**Referencia:** [GitHub - TailAdmin free-react-tailwind-admin-dashboard](https://github.com/TailAdmin/free-react-tailwind-admin-dashboard)

---

### DA-02: Backend — Framework HTTP

**Estado:** ✅ Accepted (decisión tomada en consideraciones previas)

**Decisión:**
- Adoptar **Hono** como framework HTTP para el API Worker
- Arquitectura clara: middleware, handlers, servicios, bindings
- Routing HTTP con Hono

**Justificación:**
- Framework HTTP moderno y ligero para Cloudflare Workers
- Soporte nativo para TypeScript
- Compatibilidad con arquitectura serverless
- Ecosistema de plugins y middleware
- Routing declarativo y type-safe
- Integración directa con Cloudflare Workers bindings

**Referencia:** [Hono - Fast & minimal web framework](https://hono.dev/)

---

### DA-03: Política de Cero Hardcoding

**Estado:** ✅ Accepted (decisión tomada en consideraciones previas)

**Decisión:**
- Definir política de cero hardcoding como restricción arquitectónica crítica

**Justificación:**
- Cumple regla R2 del proyecto (Cero hardcoding)
- Evita dependencia de entornos específicos
- Facilita configuración y despliegue
- Permite cambios sin modificar código
- Alinea con mejores prácticas de Cloudflare Workers

**Reglas:**
- Valores de negocio: almacenados en D1 o KV
- Textos de UI: centralizados en catálogos o capas de configuración
- Mensajes de error: provenientes de capas definidas
- Parámetros operativos: resueltos desde configuración
- Feature toggles: controlados desde configuración
- IDs de recursos: resueltos desde inventario de recursos

---

### DA-04: Configuración y Valores Dinámicos

**Estado:** ✅ Accepted (decisión tomada en consideraciones previas)

**Decisión:**
- Definir política de configuración dinámica para el sistema

**Justificación:**
- Permite cambios sin modificar código
- Facilita ajustes operativos sin re-deploy
- Soporta diferentes entornos (dev, production)
- Habilita feature flags para control de funcionalidades

**Ámbitos:**
- **Mensajes de error:** Centralizados en capas de configuración
- **Textos de UI:** Centralizados en catálogos o capas de configuración
- **Parámetros operativos:** Resueltos desde configuración
- **Feature toggles:** Controlados desde configuración
- **IDs de recursos:** Resueltos desde inventario de recursos
- **Valores por defecto de dominio:** Resueltos desde configuración

**Implementación:**
- Capas de configuración en D1 (tabla `configuraciones`)
- Valores en D1 o KV según sensibilidad
- API para gestión de configuración

---

### DA-05: Integración Frontend-Backend

**Estado:** ✅ Accepted (decisión tomada en consideraciones previas)

**Decisión:**
- Definir patrón de comunicación entre frontend y backend
- Frontend como SPA administrativa
- Backend como API REST sobre Cloudflare Workers
- Comunicación vía HTTP/JSON

**Justificación:**
- Alinea con arquitectura serverless de Cloudflare Workers
- Simplicidad y consistencia
- Sin necesidad de eventos/sockets para el MVP
- Frontend puede ser desplegado independientemente (Cloudflare Pages)

**Patrones:**
- Frontend llama a API Worker
- Respuestas en formato JSON con estructura `{ data: ... }` o `{ error: "..." }`
- Manejo de estados en frontend basado en respuestas de la API
- Validación de I-JSON en frontend antes de enviar a backend

---

## Decisiones Pendientes

### DP-01: ADR de Framework HTTP (Hono)

**Estado:** 🔄 Pending Validation

**Descripción:**
Crear ADR formal documentando la decisión de adoptar Hono como framework HTTP para el API Worker.

**Contenido pendiente:**
- Contexto y alternativas evaluadas
- Decisión final y justificación detallada
- Impacto en arquitectura del sistema
- Patrones de implementación recomendados

---

### DP-02: ADR de Integración con TailAdmin

**Estado:** 🔄 Pending Validation

**Descripción:**
Crear ADR formal documentando la estrategia de integración con la plantilla TailAdmin.

**Contenido pendiente:**
- Análisis de componentes de TailAdmin a utilizar
- Estrategia de adaptación ("shell" + librería de bloques)
- Patrones de customización
- Límites de la plantilla a respetar
- Impacto en arquitectura del frontend

---

### DP-03: ADR de Política de Configuración Dinámica

**Estado:** 🔄 Pending Validation

**Descripción:**
Crear ADR formal documentando la política de configuración dinámica.

**Contenido pendiente:**
- Estructura de capas de configuración
- Mecanismo de resolución de valores
- Integración con componentes del sistema
- Prioridad de configuración vs. código

---

## Políticas Transversales

### PT-01: Separación de Responsabilidades

Cada componente del sistema tiene una responsabilidad clara y bien definida:

| Componente | Responsabilidad Principal |
|-----------|----------------------|
| Frontend | Interfaz de usuario, navegación, validaciones de UI |
| API Worker | Endpoints REST, validación de I-JSON |
| Workflow Worker | Ejecución de workflow secuencial |
| D1 | Persistencia de datos, consultas |
| R2 | Almacenamiento de archivos |
| KV | Almacenamiento de secrets |

### PT-02: Doc-First

La documentación guía las decisiones de diseño e implementación. Todo cambio significativo debe ser documentado antes de implementarse.

### PT-03: Validación antes de Implementación

Todo cambio en código debe ser validado antes de commit:
- Lint: Sin errores ni advertencias
- Typecheck: Sin errores de TypeScript
- Tests: Pasan si existen

### PT-04: Gestión de Estados

Los estados del sistema (proyecto, ejecución, pasos) deben gestionarse de forma consistente y trazable.

---

## Consideraciones por Capa

### Frontend

**Estado actual:** Pendiente de implementación

**Consideraciones:**
- La plantilla TailAdmin proporciona componentes preconstruidos, pero requiere adaptación
- Necesidad de definir qué componentes se utilizarán y cuáles se customizarán
- Estrategia de "shell" + librería de bloques para evitar dependencia excesiva
- Los textos de UI deben centralizarse en catálogos o capas de configuración
- La SPA debe ser administrativa, no pública

**Riesgos:**
- Sobreajuste con componentes no necesarios de la plantilla
- Dependencia excesiva de la plantilla TailAdmin
- Dificultad de customización profunda sin romper la estructura

---

### Backend (API Worker)

**Estado actual:** Pendiente de implementación

**Consideraciones:**
- Hono requiere definición de middleware, handlers, servicios y bindings
- Necesidad de definir estructura de handlers para cada endpoint
- Validación de I-JSON debe ser robusta y segura
- OpenAI API requiere manejo de errores y reintentos

**Riesgos:**
- Complejidad de configuración de Hono para el MVP
- Dificultad de orquestación de pasos con Cloudflare Workflows
- Timeout de OpenAI API puede detener el workflow

---

### Data (D1)

**Estado actual:** Pendiente de implementación

**Consideraciones:**
- Las migraciones SQL deben ser numeradas y secuenciales
- D1 tiene límite de 500MB, no ideal para datos grandes
- Estructura de tablas debe optimizarse para rendimiento

**Riesgos:**
- Límite de tamaño puede ser insuficiente
- Consultas complejas pueden ser lentas

---

### Storage (R2)

**Estado actual:** Pendiente de implementación

**Consideraciones:**
- Estructura de carpetas por proyecto debe implementarse correctamente
- URLs de archivos deben generarse y almacenarse
- Necesidad de política de retención de logs

**Riesgos:**
- Acumulación de archivos puede generar costos altos
- URLs pueden expirar si no se gestionan correctamente

---

### Secrets (KV)

**Estado actual:** Pendiente de implementación

**Consideraciones:**
- OPENAI_API_KEY debe almacenarse de forma segura
- No debe exponerse en el código ni en el repositorio
- Necesidad de política de rotación de keys

**Riesgos:**
- Exposición de keys puede comprometer seguridad
- Keys expiradas pueden causar fallos en producción

---

## Integraciones

### Frontend ↔ Backend

**Patrón actual:**
- Frontend llama a API Worker vía HTTP/JSON
- Backend responde en formato `{ data: ... }` o `{ error: "..." }`
- Estados del proyecto se gestionan en backend y se reflejan en frontend

**Consideraciones:**
- Frontend debe manejar estados de proyecto basándose en respuestas de la API
- Validación de I-JSON debe hacerse en frontend antes de enviar
- Errores de la API deben mostrarse de forma amigable en la UI

---

### OpenAI Integration

**Patrón actual:**
- Workflow Worker llama a OpenAI API para cada paso del workflow
- Prompt específico para cada tipo de análisis
- I-JSON del inmueble como contexto

**Consideraciones:**
- OpenAI API puede tener límites de rate limiting
- Timeout de API puede detener el workflow
- Necesidad de manejo de errores y reintentos
- Costo de la API debe monitorearse

---

## Evolución Futura

### Fase 1: MVP (Actual)

**Objetivo:**
- Crear proyectos a partir de I-JSON
- Ejecutar workflow de 9 pasos de análisis
- Generar informes Markdown
- Consultar resultados

**Arquitectura actual:**
- Frontend: React + TailAdmin (pendiente de implementación)
- Backend: API Worker + Hono (pendiente de implementación)
- Data: D1 (pendiente de implementación)
- Storage: R2 (pendiente de implementación)
- Secrets: KV (pendiente de implementación)

### Fase 2: Post-MVP (Futuro)

**Posibles evoluciones:**
- Añadir autenticación y permisos
- Ejecución parcial por módulos del workflow
- Versionado de prompts y resultados
- Comparadores complejos de escenarios
- Automatización masiva de captura de anuncios
- Evolución hacia producto para cliente final

**Consideraciones arquitectónicas:**
- La arquitectura actual debe soportar estas evoluciones
- Separación de responsabilidades debe mantenerse
- Documentación doc-first debe guiar las decisiones

---

## Análisis del Inventario de Recursos

> **Fuente:** [`.governance/inventario_recursos.md`](../../.governance/inventario_recursos.md)
> **Fecha de análisis:** 2026-03-18
> **Versión del inventario:** 5.0

### Resumen del Estado Actual

El inventario revela que la infraestructura base está parcialmente creada, pero el código y la configuración del proyecto aún no existen.

### Recursos Existentes (✅)

| Recurso | Nombre/ID | Detalles |
|---------|-----------|----------|
| **Secrets de Despliegue** | CLOUDFLARE_API_TOKEN | Configurado para wrangler CLI / GitHub Codespaces |
| | CLOUDFLARE_ACCOUNT_ID | Configurado para wrangler CLI / GitHub Codespaces |
| **KV Namespace** | secrets-api-inmo | ID: b9e80742f2a74d89b3e9083245b35709 |
| **Key en KV** | OPENAI_API_KEY | Clave de API para inferencia OpenAI |
| **R2 Bucket** | r2-almacen | Directorio `dir-api-inmo/` creado dentro |
| **Cloudflare Pages** | cb-consulting | URL: https://cb-consulting.pages.dev/ |

### Recursos Pendientes de Creación (🔲)

| Recurso | Estado | Observaciones |
|---------|--------|---------------|
| **Workers** | 🔲 No creados | API Worker, Workflow Worker pendientes |
| **D1 Bases de Datos** | 🔲 No creadas | Tablas de proyectos, ejecuciones, pasos pendientes |
| **Queues** | 🔲 No creadas | No requeridas para MVP |
| **Workflows** | 🔲 No creados | Orquestación de 9 pasos pendiente |
| **Workers AI** | 🔲 No creados | Binding de AI pendiente |
| **Vectorize** | 🔲 No creados | No requerido para MVP |

### Archivos de Configuración Pendientes (🔲)

| Archivo | Finalidad | Prioridad |
|---------|-----------|-----------|
| `package.json` | Dependencias y scripts | Alta |
| `tsconfig.json` | Configuración TypeScript | Alta |
| `wrangler.toml` o `wrangler.jsonc` | Configuración Wrangler | Alta |
| `schema.sql` | Esquema de base de datos | Alta |
| `.dev.vars.example` | Plantilla variables backend | Media |
| `.env.example` | Plantilla variables frontend | Media |
| `.gitignore` | Exclusiones de versionado | Media |
| `vite.config.ts` | Configuración Vite | Media |
| `tailwind.config.js` | Configuración Tailwind | Baja |
| `components.json` | Configuración shadcn/ui | Baja |

### Método de Despliegue

| Campo | Valor |
|-------|-------|
| **Método** | Despliegue directo con Wrangler desde terminal |
| **Agente responsable** | `cloudflare-wrangler-deploy` |
| **CI/CD (GitHub Actions)** | No utilizado (disponible como referencia) |
| **Fecha de decisión** | 2026-03-17 |

### Implicaciones para la Implementación

**Impacto en FASE 4 (Implementación):**

1. **Configuración inicial requerida:**
   - Crear `package.json` con dependencias base (Hono, React, TypeScript)
   - Crear `wrangler.toml` con bindings para KV, R2, D1
   - Crear `schema.sql` con migraciones de D1

2. **Creación de recursos:**
   - D1 database para persistencia
   - Workers (API Worker, Workflow Worker)
   - Workflows para orquestación

3. **Integración con recursos existentes:**
   - Conectar API Worker a KV `secrets-api-inmo` para `OPENAI_API_KEY`
   - Conectar Workflow Worker a R2 `r2-almacen` para almacenamiento de I-JSON
   - Desplegar frontend a Cloudflare Pages `cb-consulting`

4. **Priorización de tareas:**
   - Alta: Configuración base (package.json, wrangler.toml, schema.sql)
   - Alta: Creación de D1 database
   - Alta: Implementación de API Worker con Hono
   - Media: Implementación de Workflow Worker
   - Media: Integración con TailAdmin
   - Baja: Configuración de UI (tailwind.config.js, components.json)

### Brechas Identificadas

| Brecha | Descripción | Impacto |
|--------|-------------|---------|
| **B1:** Sin código base | No existe package.json ni código fuente | Alta - Bloquea inicio de desarrollo |
| **B2:** Sin D1 database | No existe base de datos para persistencia | Alta - Bloquea funcionalidad core |
| **B3:** Sin Workers | No existen workers para API y workflows | Alta - Bloquea funcionalidad core |
| **B4:** Sin wrangler.toml | No existe configuración de despliegue | Alta - Bloquea despliegue |
| **B5:** Sin schema.sql | No existe esquema de base de datos | Alta - Bloquea migraciones |

---

## Riesgos y Mitigaciones

| Riesgo | Impacto | Mitigación |
|--------|---------|-------------|
| **R1:** Dependencia excesiva de TailAdmin | Puede dificultar customización | Estrategia de "shell" + librería de bloques |
| **R2:** Complejidad de Hono para MVP | Puede extender tiempo de desarrollo | Implementar MVP primero, evolucionar después |
| **R3:** Timeout de OpenAI API | Workflow puede detenerse | Manejo de errores y reintentos |
| **R4:** Límite de tamaño de D1 | Puede ser insuficiente | Optimizar consultas y estructuras |
| **R5:** Acumulación de archivos en R2 | Costos altos de almacenamiento | Política de retención de logs |

---

> **Nota:** Este documento está basado en [`01 architecture.md`](./01%20architecture.md) y en las consideraciones previas analizadas.
