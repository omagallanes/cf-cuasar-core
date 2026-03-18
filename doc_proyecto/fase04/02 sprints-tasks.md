# Tareas por Sprint — FASE 4

> **Documento:** FASE 4 — Planificación Técnica (Execution Plan)  
> **Fuente principal:** [`implementation-plan.md`](./implementation-plan.md)  
> **Versión:** 1.0  
> **Fecha:** 2026-03-18

---

## Resumen

Este documento descompone cada sprint en tareas específicas y ejecutables, proporcionando suficiente detalle para que un agente pueda implementar cada parte sin ambigüedad.

---

## Sprint 1: Configuración Base e Infraestructura de Datos

### Tarea 1.1: Crear package.json

**Descripción:** Crear el archivo package.json con todas las dependencias base necesarias para el proyecto.

**Especificaciones:**
- Dependencias de desarrollo:
  - `hono`: ^4.x para API Worker
  - `@cloudflare/workers-types`: Tipos para Cloudflare Workers
  - `typescript`: ^5.x para TypeScript
  - `vite`: ^5.x para frontend
  - `react`: ^19.x para frontend
  - `tailwindcss`: ^4.x para estilos
- Dependencias de desarrollo:
  - `@types/node`: Tipos de Node.js
  - `wrangler`: ^3.x para despliegue local
- Scripts:
  - `dev`: Para desarrollo local
  - `build`: Para construcción
  - `deploy`: Para despliegue con wrangler
  - `typecheck`: Para verificación de tipos
  - `lint`: Para verificación de código

**Pasos:**
1. Crear package.json en raíz del proyecto
2. Definir todas las dependencias
3. Definir scripts de desarrollo y despliegue
4. Configurar TypeScript como módulo ESNext

**Criterios de Completación:**
- ✅ package.json creado en raíz del proyecto
- ✅ Todas las dependencias definidas
- ✅ Scripts configurados correctamente
- ✅ TypeScript configurado

---

### Tarea 1.2: Crear wrangler.toml

**Descripción:** Crear el archivo de configuración de Wrangler con bindings para KV, R2 y D1.

**Especificaciones:**
- Configuración general:
  - `name`: "vaaia-api-worker" para API Worker
  - `main`: "src/workers/api/index.ts"
  - `compatibility_date`: "2024-01-01"
- Bindings para API Worker:
  - KV namespace: `secrets-api-inmo`
    - Binding name: `SECRETS`
  - D1 database: `vaaia-db`
    - Binding name: `DB`
  - R2 bucket: `r2-almacen`
    - Binding name: `STORAGE`
- Environments:
  - `dev`: Para desarrollo local
  - `production`: Para producción

**Pasos:**
1. Crear wrangler.toml en raíz del proyecto
2. Definir configuración general del worker
3. Configurar bindings para KV, D1, R2
4. Configurar environments

**Criterios de Completación:**
- ✅ wrangler.toml creado en raíz del proyecto
- ✅ Configuración general definida
- ✅ Bindings para KV, D1, R2 configurados
- ✅ Environments definidos

---

### Tarea 1.3: Crear schema.sql

**Descripción:** Crear el archivo de migraciones SQL con todas las tablas del modelo de datos con prefijo `ani_`.

**Especificaciones:**
- Tablas a crear:
  - `ani_proyectos`: Datos de proyectos
  - `ani_ejecuciones`: Historial de ejecuciones
  - `ani_pasos`: Pasos individuales de workflows
  - `ani_atributos`: Atributos genéricos del sistema
  - `ani_valores`: Valores posibles para atributos
- Índices a crear:
  - `idx_ani_proyectos_estado`
  - `idx_ani_proyectos_asesor`
  - `idx_ani_proyectos_fecha_creacion`
  - `idx_ani_ejecuciones_proyecto`
  - `idx_ani_ejecuciones_estado`
  - `idx_ani_ejecuciones_fecha_inicio`
  - `idx_ani_pasos_ejecucion`
  - `idx_ani_pasos_tipo`
  - `idx_ani_pasos_orden`
  - `idx_ani_atributos_nombre`
  - `idx_ani_valores_atributo`
  - `idx_ani_valores_valor`
- Constraints:
  - PRIMARY KEY en todas las tablas
  - FOREIGN KEY para relaciones
  - CHECK constraints para enums
  - UNIQUE constraints donde sea necesario

**Pasos:**
1. Crear schema.sql en directorio migrations/
2. Definir CREATE TABLE para `ani_proyectos`
3. Definir CREATE TABLE para `ani_ejecuciones`
4. Definir CREATE TABLE para `ani_pasos`
5. Definir CREATE TABLE para `ani_atributos`
6. Definir CREATE TABLE para `ani_valores`
7. Crear todos los índices
8. Crear constraints y checks
9. Insertar datos iniciales de atributos si es necesario

**Criterios de Completación:**
- ✅ schema.sql creado en migrations/
- ✅ Todas las tablas definidas con prefijo `ani_`
- ✅ Todos los índices definidos
- ✅ Constraints implementadas
- ✅ Datos iniciales definidos

---

### Tarea 1.4: Crear D1 Database

**Descripción:** Crear la base de datos D1 en Cloudflare y ejecutar las migraciones de schema.sql.

**Pasos:**
1. Ejecutar comando wrangler para crear D1:
   ```bash
   wrangler d1 create vaaia-db --remote
   ```
2. Verificar que la base de datos se creó correctamente
3. Ejecutar migraciones de schema.sql:
   ```bash
   wrangler d1 execute vaaia-db --file=migrations/schema.sql --remote
   ```
4. Verificar que todas las tablas se crearon
5. Actualizar inventario de recursos con ID de D1 database

**Criterios de Completación:**
- ✅ D1 database creada en Cloudflare
- ✅ Migraciones ejecutadas exitosamente
- ✅ Todas las tablas creadas con prefijo `ani_`
- ✅ Inventario de recursos actualizado con ID de D1

---

### Tarea 1.5: Crear Estructura de Directorios

**Descripción:** Crear la estructura de directorios del proyecto para organizar código fuente, workers y scripts.

**Especificaciones:**
- Estructura a crear:
  ```
  / (raíz)
  ├── package.json
  ├── wrangler.toml
  ├── tsconfig.json
  ├── src/
  │   ├── workers/
  │   │   ├── api/
  │   │   │   ├── index.ts (API Worker con Hono)
  │   │   │   ├── handlers/
  │   │   │   ├── services/
  │   │   │   └── middleware/
  │   │   └── workflow/
  │   │       ├── index.ts (Workflow Worker)
  │   │       └── steps/
  │   ├── frontend/
  │   │   ├── main.tsx (Entry point React)
  │   │   ├── components/
  │   │   ├── pages/
  │   │   ├── lib/
  │   │   └── styles/
  │   └── migrations/
  │       └── schema.sql
  └── .dev.vars.example
  ```

**Pasos:**
1. Crear directorio src/
2. Crear directorio src/workers/
3. Crear directorio src/workers/api/
4. Crear directorio src/workers/workflow/
5. Crear directorio src/frontend/
6. Crear directorio migrations/
7. Crear archivos .gitignore y .dev.vars.example

**Criterios de Completación:**
- ✅ Estructura de directorios creada
- ✅ Todos los subdirectorios necesarios existen
- ✅ Archivos de configuración creados

---

## Sprint 2: Backend Core — API Worker con Hono

### Tarea 2.1: Inicializar Proyecto Hono

**Descripción:** Crear la aplicación Hono base para el API Worker con configuración de middleware y routing.

**Especificaciones:**
- Framework: Hono ^4.x
- Middleware a configurar:
  - CORS para permitir solicitudes desde frontend
  - Logging para debugging
  - Error handling
  - Type validation
- Routing:
  - Prefijo `/api/v1`
  - Routes para proyectos, workflows, resultados

**Pasos:**
1. Crear archivo src/workers/api/index.ts
2. Inicializar aplicación Hono
3. Configurar middleware de CORS
4. Configurar middleware de logging
5. Configurar middleware de error handling
6. Configurar middleware de type validation
7. Definir estructura de rutas `/api/v1`

**Criterios de Completación:**
- ✅ Aplicación Hono inicializada
- ✅ Middleware configurado
- ✅ Routing definido
- ✅ Estructura de handlers establecida

---

### Tarea 2.2: Implementar Handlers de Proyectos

**Descripción:** Implementar todos los handlers REST para gestión de proyectos según el contrato de API.

**Especificaciones:**
- Handlers a implementar:
  - `GET /api/v1/proyectos`: Listar proyectos con paginación
  - `POST /api/v1/proyectos`: Crear nuevo proyecto
  - `GET /api/v1/proyectos/{proyecto_id}`: Obtener proyecto por ID
  - `PUT /api/v1/proyectos/{proyecto_id}`: Actualizar proyecto existente
  - `DELETE /api/v1/proyectos/{proyecto_id}`: Eliminar proyecto
- Validaciones:
  - Validar I-JSON antes de procesar
  - Validar que proyecto existe para actualizaciones/eliminaciones
  - Validar estados permitidos para transiciones
- Respuestas:
  - 200 OK con `{ data: ... }`
  - 201 Created con `{ data: ... }`
  - 204 No Content para eliminaciones exitosas
  - 400 Bad Request con `{ error: "..." }`
  - 404 Not Found con `{ error: "..." }`
  - 500 Internal Server Error con `{ error: "..." }`

**Pasos:**
1. Crear directorio src/workers/api/handlers/
2. Implementar handler para listar proyectos
3. Implementar handler para crear proyecto
4. Implementar handler para obtener proyecto
5. Implementar handler para actualizar proyecto
6. Implementar handler para eliminar proyecto
7. Implementar validaciones en cada handler
8. Implementar respuestas con formato correcto

**Criterios de Completación:**
- ✅ Todos los handlers de proyectos implementados
- ✅ Validaciones implementadas
- ✅ Respuestas con formato correcto
- ✅ Manejo de errores implementado

---

### Tarea 2.3: Implementar Handlers de Workflows

**Descripción:** Implementar handlers para ejecución y consulta de workflows.

**Especificaciones:**
- Handlers a implementar:
  - `POST /api/v1/proyectos/{proyecto_id}/workflows/ejecutar`: Ejecutar workflow
  - `GET /api/v1/proyectos/{proyecto_id}/workflows/ejecuciones`: Listar ejecuciones
  - `GET /api/v1/proyectos/{proyecto_id}/workflows/ejecuciones/{ejecucion_id}`: Obtener ejecución por ID
- Lógica de ejecución:
  - Validar estado del proyecto antes de ejecutar
  - Solicitar confirmación si hay análisis previos
  - Crear nueva ejecución en D1
  - Actualizar estado del proyecto a 'procesando_analisis'
- Estados de ejecución:
  - `iniciada`: Ejecución creada
  - `en_ejecucion`: En progreso
  - `finalizada_correctamente`: Completada sin errores
  - `finalizada_con_error`: Completada con errores

**Pasos:**
1. Crear directorio src/workers/api/handlers/workflows/
2. Implementar handler para ejecutar workflow
3. Implementar handler para listar ejecuciones
4. Implementar handler para obtener ejecución
5. Implementar validación de estado de proyecto
6. Implementar lógica de confirmación de reejecución
7. Implementar creación de ejecución en D1
8. Implementar actualización de estados

**Criterios de Completación:**
- ✅ Todos los handlers de workflows implementados
- ✅ Validación de estado implementada
- ✅ Lógica de confirmación implementada
- ✅ Creación de ejecución en D1 implementada
- ✅ Actualización de estados implementada

---

### Tarea 2.4: Implementar Handlers de Resultados

**Descripción:** Implementar handlers para consulta y recuperación de resultados de análisis.

**Especificaciones:**
- Handlers a implementar:
  - `GET /api/v1/proyectos/{proyecto_id}/resultados`: Obtener todos los resultados
  - `GET /api/v1/proyectos/{proyecto_id}/resultados/{tipo_informe}`: Obtener informe específico
- Tipos de informe:
  - `resumen`: Resumen del inmueble
  - `datos_clave`: Datos clave del inmueble
  - `activo_fisico`: Análisis físico
  - `activo_estrategico`: Análisis estratégico
  - `activo_financiero`: Análisis financiero
  - `activo_regulado`: Análisis regulatorio
  - `lectura_inversor`: Lectura para inversor
  - `lectura_emprendedor`: Lectura para emprendedor
  - `lectura_propietario`: Lectura para propietario
- Almacenamiento:
  - Recuperar informes Markdown desde R2
  - Servir contenido Markdown como respuesta

**Pasos:**
1. Crear directorio src/workers/api/handlers/resultados/
2. Implementar handler para obtener todos los resultados
3. Implementar handler para obtener informe específico
4. Implementar recuperación de archivos desde R2
5. Implementar serving de contenido Markdown

**Criterios de Completación:**
- ✅ Todos los handlers de resultados implementados
- ✅ Recuperación desde R2 implementada
- ✅ Serving de Markdown implementado
- ✅ Todos los tipos de informe soportados

---

### Tarea 2.5: Implementar Servicios

**Descripción:** Implementar servicios reutilizables para lógica de negocio y acceso a datos.

**Especificaciones:**
- Servicios a implementar:
  - `ProjectService`: Gestión de proyectos en D1
  - `ExecutionService`: Gestión de ejecuciones en D1
  - `StepService`: Gestión de pasos en D1
  - `StorageService`: Almacenamiento en R2
  - `SecretService`: Recuperación de secrets desde KV
  - `ValidationService`: Validación de I-JSON
- Operaciones por servicio:
  - CRUD completo para proyectos
  - CRUD para ejecuciones
  - CRUD para pasos
  - Upload/download para R2
  - Get para secrets
  - Schema validation para I-JSON

**Pasos:**
1. Crear directorio src/workers/api/services/
2. Implementar ProjectService con operaciones CRUD
3. Implementar ExecutionService con operaciones CRUD
4. Implementar StepService con operaciones CRUD
5. Implementar StorageService para R2
6. Implementar SecretService para KV
7. Implementar ValidationService para I-JSON
8. Implementar bindings de D1, R2, KV en cada servicio

**Criterios de Completación:**
- ✅ Todos los servicios implementados
- ✅ Operaciones CRUD definidas
- ✅ Bindings integrados en servicios
- ✅ Lógica de negocio encapsulada

---

### Tarea 2.6: Implementar Manejo de Errores

**Descripción:** Implementar manejo robusto de errores para el API Worker.

**Especificaciones:**
- Tipos de errores:
  - ValidationError: I-JSON inválido
  - NotFoundError: Recurso no encontrado
  - ConflictError: Conflicto de estado
  - DatabaseError: Error en D1
  - StorageError: Error en R2
  - ExternalServiceError: Error en servicio externo (OpenAI)
- Manejo:
  - Capturar y loggear todos los errores
  - Retornar respuestas con formato `{ error: "..." }`
  - Códigos HTTP apropiados (400, 404, 409, 500)
  - Mensajes de error descriptivos pero no exponer detalles sensibles

**Pasos:**
1. Crear directorio src/workers/api/errors/
2. Definir clases de error personalizadas
3. Implementar middleware de error handling
4. Implementar logging estructurado
5. Configurar códigos HTTP apropiados
6. Implementar sanitización de mensajes de error

**Criterios de Completación:**
- ✅ Clases de error definidas
- ✅ Middleware de error handling implementado
- ✅ Logging estructurado configurado
- ✅ Códigos HTTP apropiados
- ✅ Mensajes de error sanitizados

---

### Tarea 2.7: Implementar Logging

**Descripción:** Implementar logging estructurado para debugging y monitoreo del API Worker.

**Especificaciones:**
- Niveles de log:
  - `error`: Errores críticos
  - `warn`: Advertencias
  - `info`: Información general
  - `debug`: Detalles de debugging
- Formato de log:
  - Timestamp
  - Nivel de log
  - Mensaje estructurado
  - Contexto (request ID, user ID si aplica)
- Destino de logs:
  - Console de Cloudflare Workers
  - Posible integración con servicio externo en el futuro

**Pasos:**
1. Crear directorio src/workers/api/utils/
2. Implementar logger con niveles configurables
3. Integrar logger en todos los handlers
4. Integrar logger en servicios
5. Integrar logger en middleware
6. Configurar formato de log estructurado

**Criterios de Completación:**
- ✅ Logger implementado con niveles configurables
- ✅ Formato de log estructurado definido
- ✅ Logger integrado en todos los componentes
- ✅ Logging en console de Workers configurado

---

## Sprint 3: Workflow Orquestation

### Tarea 3.1: Configurar Proyecto Cloudflare Workflows

**Descripción:** Crear la configuración del Workflow Worker en wrangler.toml y definir la clase de workflow.

**Especificaciones:**
- Configuración en wrangler.toml:
  - `name`: "vaaia-workflow-worker"
  - `main`: "src/workers/workflow/index.ts"
  - `compatibility_date`: "2024-01-01"
- Bindings para Workflow Worker:
  - D1 database: `vaaia-db`
    - Binding name: `DB`
  - R2 bucket: `r2-almacen`
    - Binding name: `STORAGE`
  - KV namespace: `secrets-api-inmo`
    - Binding name: `SECRETS`
- Workflows:
  - Nombre: `analysis-workflow`
  - Clase: `AnalysisWorkflow`
  - Parámetros: proyecto_id, ejecucion_id

**Pasos:**
1. Actualizar wrangler.toml con configuración de workflow
2. Crear archivo src/workers/workflow/index.ts
3. Definir clase AnalysisWorkflow
4. Configurar bindings de D1, R2, KV
5. Definir parámetros del workflow

**Criterios de Completación:**
- ✅ wrangler.toml actualizado con configuración de workflow
- ✅ Clase AnalysisWorkflow definida
- ✅ Bindings configurados
- ✅ Parámetros del workflow definidos

---

### Tarea 3.2: Implementar Lógica de Orquestación

**Descripción:** Implementar la lógica principal de orquestación del workflow de 9 pasos.

**Especificaciones:**
- Pasos del workflow:
  1. `resumen`: Resumen del inmueble
  2. `datos_clave`: Datos clave del inmueble
  3. `activo_fisico`: Análisis físico
  4. `activo_estrategico`: Análisis estratégico
  5. `activo_financiero`: Análisis financiero
  6. `activo_regulado`: Análisis regulatorio
  7. `lectura_inversor`: Lectura para inversor
  8. `lectura_emprendedor`: Lectura para emprendedor
  9. `lectura_propietario`: Lectura para propietario
- Lógica de orquestación:
  - Crear ejecución en D1
  - Crear 9 pasos en estado 'pendiente'
  - Ejecutar pasos secuencialmente (1-9)
  - Manejar transiciones de estado
  - Detener workflow si algún paso falla
  - Actualizar estado del proyecto
- Estados de paso:
  - `pendiente`: Awaiting execution
  - `en_ejecucion`: Currently executing
  - `correcto`: Completed successfully
  - `error`: Failed with error

**Pasos:**
1. Crear directorio src/workers/workflow/steps/
2. Implementar lógica de creación de ejecución
3. Implementar lógica de creación de pasos
4. Implementar lógica de ejecución secuencial
5. Implementar manejo de transiciones de estado
6. Implementar lógica de detención ante error
7. Implementar actualización de estado de proyecto

**Criterios de Completación:**
- ✅ Lógica de orquestación implementada
- ✅ Creación de ejecución en D1 implementada
- ✅ Creación de pasos implementada
- ✅ Ejecución secuencial implementada
- ✅ Manejo de transiciones implementado
- ✅ Detención ante error implementada
- ✅ Actualización de estado de proyecto implementada

---

### Tarea 3.3: Implementar Integración con OpenAI

**Descripción:** Implementar la integración con OpenAI API para generación de informes.

**Especificaciones:**
- Configuración:
  - Recuperar OPENAI_API_KEY desde KV `secrets-api-inmo`
  - Configurar modelo de OpenAI (ej: gpt-4o-mini)
  - Configurar parámetros de API (max_tokens, temperature)
- Prompts:
  - Prompt específico para cada tipo de paso
  - I-JSON del inmueble como contexto
  - Formato de respuesta esperado (Markdown)
- Manejo de API:
  - Rate limiting con backoff exponencial
  - Reintentos automáticos con límite máximo
  - Timeout handling
  - Error handling robusto
- Tipos de paso y prompts:
  1. `resumen`: Prompt para resumen general
  2. `datos_clave`: Prompt para datos clave
  3. `activo_fisico`: Prompt para análisis físico
  4. `activo_estrategico`: Prompt para análisis estratégico
  5. `activo_financiero`: Prompt para análisis financiero
  6. `activo_regulado`: Prompt para análisis regulatorio
  7. `lectura_inversor`: Prompt para lectura inversor
  8. `lectura_emprendedor`: Prompt para lectura emprendedor
  9. `lectura_propietario`: Prompt para lectura propietario

**Pasos:**
1. Crear directorio src/workers/workflow/services/
2. Implementar OpenAIService para recuperación de API key
3. Implementar servicio de prompts
4. Implementar cliente HTTP para OpenAI
5. Implementar lógica de rate limiting
6. Implementar lógica de reintentos con backoff
7. Implementar timeout handling
8. Implementar prompts específicos para cada tipo de paso

**Criterios de Completación:**
- ✅ OpenAIService implementado
- ✅ Servicio de prompts implementado
- ✅ Cliente HTTP configurado
- ✅ Rate limiting implementado
- ✅ Reintentos con backoff implementados
- ✅ Timeout handling implementado
- ✅ Prompts específicos definidos para todos los pasos

---

### Tarea 3.4: Implementar Almacenamiento de Resultados

**Descripción:** Implementar almacenamiento de informes Markdown generados en R2 y actualización de rutas en D1.

**Especificaciones:**
- Estructura de almacenamiento en R2:
  - `r2-almacen/dir-api-inmo/{proyecto_id}/`
    - `{proyecto_id}.json`: I-JSON completo
    - `resumen.md`: Informe de resumen
    - `datos_clave.md`: Informe de datos clave
    - `activo_fisico.md`: Informe de análisis físico
    - `activo_estrategico.md`: Informe de análisis estratégico
    - `activo_financiero.md`: Informe de análisis financiero
    - `activo_regulado.md`: Informe de análisis regulatorio
    - `lectura_inversor.md`: Informe de lectura inversor
    - `lectura_emprendedor.md`: Informe de lectura emprendedor
    - `lectura_propietario.md`: Informe de lectura propietario
    - `log.txt`: Registro de errores
- Operaciones:
  - Upload: Subir informes Markdown
  - Download: Recuperar informes
  - Delete: Eliminar informes (para reejecución)
  - List: Listar archivos en directorio

**Pasos:**
1. Crear directorio src/workers/workflow/storage/
2. Implementar R2StorageService para operaciones CRUD
3. Implementar método para subir informes Markdown
4. Implementar método para recuperar informes
5. Implementar método para eliminar informes
6. Implementar método para listar archivos
7. Implementar actualización de rutas en pasos de D1

**Criterios de Completación:**
- ✅ R2StorageService implementado
- ✅ Operaciones CRUD implementadas
- ✅ Upload/download implementados
- ✅ Delete implementado
- ✅ List implementado
- ✅ Actualización de rutas en D1 implementada

---

### Tarea 3.5: Implementar Manejo de Errores en Workflow

**Descripción:** Implementar manejo robusto de errores para el Workflow Worker.

**Especificaciones:**
- Tipos de errores:
  - StepExecutionError: Error en ejecución de paso
  - OpenAIError: Error en llamada a OpenAI
  - StorageError: Error en R2
  - DatabaseError: Error en D1
- Manejo:
  - Capturar errores de cada paso
  - Actualizar estado de paso a 'error'
  - Actualizar estado de ejecución a 'finalizada_con_error'
  - Actualizar estado de proyecto a 'analisis_con_error'
  - Generar logs detallados en R2
  - Detener workflow inmediatamente ante error crítico
- Logging:
  - Loggear cada error con contexto completo
  - Incluir timestamp, tipo de error, mensaje
  - Almacenar logs en R2 como `log.txt`

**Pasos:**
1. Crear directorio src/workers/workflow/errors/
2. Definir clases de error específicas de workflow
3. Implementar manejo de errores en cada paso
4. Implementar actualización de estados ante error
5. Implementar generación de logs en R2
6. Implementar lógica de detención de workflow
7. Implementar logging estructurado

**Criterios de Completación:**
- ✅ Clases de error específicas definidas
- ✅ Manejo de errores en pasos implementado
- ✅ Actualización de estados ante error implementada
- ✅ Generación de logs en R2 implementada
- ✅ Lógica de detención de workflow implementada
- ✅ Logging estructurado configurado

---

## Sprint 4: Frontend Core — Integración con TailAdmin

### Tarea 4.1: Configurar Proyecto React

**Descripción:** Crear el proyecto React con Vite, TypeScript y Tailwind CSS v4.

**Especificaciones:**
- Configuración de Vite:
  - `@vitejs/plugin-react`: Plugin oficial de React
  - `typescript`: Soporte de TypeScript
  - `tailwindcss`: Plugin de Tailwind CSS
- Configuración de TypeScript:
  - `strict`: Modo estricto
  - `esModuleInterop`: true
  - `resolveJsonModule`: true
  - `paths`: Alias para imports absolutos
- Scripts:
  - `dev`: Servidor de desarrollo
  - `build`: Construcción para producción
  - `preview`: Preview local
  - `typecheck`: Verificación de tipos
  - `lint`: Verificación de código

**Pasos:**
1. Crear directorio src/frontend/
2. Crear archivo vite.config.ts
3. Crear archivo tsconfig.json
4. Crear archivo tailwind.config.js
5. Configurar plugin de React en Vite
6. Configurar TypeScript
7. Configurar Tailwind CSS
8. Definir scripts de desarrollo

**Criterios de Completación:**
- ✅ Proyecto React inicializado
- ✅ Vite configurado
- ✅ TypeScript configurado
- ✅ Tailwind CSS configurado
- ✅ Scripts definidos
- ✅ Estructura de directorios creada

---

### Tarea 4.2: Integrar TailAdmin

**Descripción:** Integrar la plantilla TailAdmin como base visual y estructural del frontend.

**Especificaciones:**
- Estrategia de integración:
  - Usar TailAdmin como "shell" y librería de bloques
  - No arrastrar páginas demo sin mapearlas
  - Adaptar componentes necesarios
  - Mantener estructura de rutas de TailAdmin
- Componentes de TailAdmin a adaptar:
  - Layout principal (sidebar, header)
  - Tablas de datos
  - Formularios de entrada
  - Componentes de UI (botones, inputs, cards)
  - Navegación
- Componentes a crear:
  - Página de listado de proyectos
  - Página de creación de proyecto
  - Página de detalles de proyecto
  - Página de resultados con pestañas

**Pasos:**
1. Clonar/adaptar estructura de TailAdmin
2. Configurar rutas principales del proyecto
3. Adaptar layout principal
4. Crear página de listado de proyectos
5. Crear página de creación de proyecto
6. Crear página de detalles de proyecto
7. Crear página de resultados con pestañas
8. Configurar navegación entre páginas

**Criterios de Completación:**
- ✅ TailAdmin integrado como base
- ✅ Estructura de rutas adaptada
- ✅ Layout principal adaptado
- ✅ Páginas principales creadas
- ✅ Navegación configurada
- ✅ Páginas específicas implementadas

---

### Tarea 4.3: Implementar Componentes de UI

**Descripción:** Implementar componentes de UI específicos para gestión de proyectos.

**Especificaciones:**
- Componentes a crear:
  - `ProjectList`: Tabla con listado de proyectos
  - `ProjectCard`: Card para cada proyecto
  - `ProjectForm`: Formulario para crear/editar proyecto
  - `ProjectDetail`: Página de detalles de proyecto
  - `ResultsViewer`: Visualizador de informes en pestañas
  - `StatusBadge`: Indicador de estado del proyecto
  - `LoadingSpinner`: Indicador de carga
  - `ErrorMessage`: Componente para mostrar errores
- Estilos:
  - Seguir sistema de Tailwind CSS
  - Responsive design
  - Dark mode si aplica

**Pasos:**
1. Crear directorio src/frontend/components/
2. Implementar ProjectList con paginación
3. Implementar ProjectCard con estados
4. Implementar ProjectForm con validación
5. Implementar ProjectDetail con navegación
6. Implementar ResultsViewer con pestañas
7. Implementar StatusBadge
8. Implementar LoadingSpinner
9. Implementar ErrorMessage

**Criterios de Completación:**
- ✅ Directorio de componentes creado
- ✅ Todos los componentes implementados
- ✅ Estilos de Tailwind aplicados
- ✅ Responsive design implementado
- ✅ Componentes reutilizables

---

### Tarea 4.4: Implementar Integración con API

**Descripción:** Implementar cliente HTTP y servicios para comunicación con el API Worker.

**Especificaciones:**
- Cliente HTTP:
  - Usar fetch API o axios
  - Configurar baseURL para API Worker
  - Configurar headers (Content-Type: application/json)
  - Manejo de estados de carga
  - Manejo de errores
- Servicios:
  - `ProjectService`: Servicio para operaciones de proyectos
  - `WorkflowService`: Servicio para ejecución de workflows
  - `ResultsService`: Servicio para recuperación de resultados
  - `AuthService`: (No requerido en MVP)
- Hooks de React:
  - `useProjects`: Hook para gestión de proyectos
  - `useWorkflow`: Hook para ejecución de workflows
  - `useResults`: Hook para recuperación de resultados

**Pasos:**
1. Crear directorio src/frontend/services/
2. Implementar cliente HTTP base
3. Implementar ProjectService
4. Implementar WorkflowService
5. Implementar ResultsService
6. Implementar hooks de React
7. Configurar interceptores para manejo de errores global
8. Implementar manejo de estados de carga

**Criterios de Completación:**
- ✅ Cliente HTTP implementado
- ✅ Todos los servicios implementados
- ✅ Hooks de React creados
- ✅ Interceptores configurados
- ✅ Manejo de estados de carga implementado

---

### Tarea 4.5: Implementar Políticas de Cero Hardcoding

**Descripción:** Implementar centralización de textos de UI y mensajes de error, evitando strings inline.

**Especificaciones:**
- Centralización de textos:
  - Crear catálogo de textos de UI
  - Mensajes de error desde configuración
  - Textos de validación
  - Labels de formularios
  - Placeholders
- Implementación:
  - No strings inline en componentes
  - Todos los textos desde catálogo o servicios
  - Mensajes de error dinámicos
  - Labels de botones configurables
- Archivos de configuración:
  - `src/frontend/config/texts.ts`: Catálogo de textos
  - `src/frontend/config/errors.ts`: Mensajes de error
  - `src/frontend/config/validation.ts`: Mensajes de validación

**Pasos:**
1. Crear directorio src/frontend/config/
2. Implementar catálogo de textos de UI
3. Implementar mensajes de error
4. Implementar mensajes de validación
5. Refactorizar componentes para usar textos centralizados
6. Eliminar todos los strings inline

**Criterios de Completación:**
- ✅ Directorio de configuración creado
- ✅ Catálogo de textos implementado
- ✅ Mensajes de error centralizados
- ✅ Mensajes de validación centralizados
- ✅ Componentes refactorizados
- ✅ Strings inline eliminados

---

## Sprint 5: Integración Frontend-Backend

### Tarea 5.1: Implementar Flujo de Creación de Proyecto

**Descripción:** Implementar el flujo completo de creación de proyecto desde frontend.

**Especificaciones:**
- Flujo:
  1. Usuario navega a página de creación
  2. Usuario pega I-JSON en textarea
  3. Frontend valida I-JSON
  4. Usuario confirma creación
  5. Frontend POST a API
  6. Frontend almacena I-JSON en R2 (opcional, vía API)
  7. Frontend muestra proyecto creado
  8. Usuario puede ejecutar workflow
- Validaciones en frontend:
  - Validar estructura JSON básica
  - Validar campos requeridos
  - Validar formato de datos
  - Mostrar errores de validación en línea
- Estados de UI:
  - Estado inicial: Formulario vacío
  - Estado validando: Validando I-JSON
  - Estado enviando: Enviando a API
  - Estado éxito: Proyecto creado
  - Estado error: Mostrar mensaje de error

**Pasos:**
1. Crear componente de formulario de creación
2. Implementar validación de I-JSON
3. Implementar llamada a API para crear proyecto
4. Implementar almacenamiento de I-JSON en R2
5. Implementar manejo de estados de UI
6. Implementar navegación tras creación exitosa
7. Implementar manejo de errores

**Criterios de Completación:**
- ✅ Formulario de creación implementado
- ✅ Validación de I-JSON implementada
- ✅ Llamada a API implementada
- ✅ Almacenamiento en R2 implementado
- ✅ Estados de UI implementados
- ✅ Navegación configurada
- ✅ Manejo de errores implementado

---

### Tarea 5.2: Implementar Flujo de Ejecución de Workflow

**Descripción:** Implementar el flujo completo de ejecución de workflow y visualización de resultados.

**Especificaciones:**
- Flujo:
  1. Usuario navega a detalles de proyecto
  2. Usuario hace clic en "Ejecutar Análisis"
  3. Frontend valida estado del proyecto
  4. Si hay análisis previos, solicita confirmación
  5. Usuario confirma ejecución
  6. Frontend POST a API para ejecutar workflow
  7. Frontend muestra estado "En ejecución"
  8. Frontend poll para verificar estado periódicamente
  9. Al completar, frontend muestra resultados
- Polling:
  - Intervalo: 5 segundos
  - Máximo de intentos: 120 (10 minutos)
  - Backoff exponencial entre reintentos
- Visualización de resultados:
  - Pestañas para cada tipo de informe
  - Renderizado de Markdown
  - Indicadores de estado de cada paso
- Estados de ejecución:
  - `iniciada`: Workflow iniciado
  - `en_ejecucion`: Ejecutando pasos
  - `finalizada_correctamente`: Completado
  - `finalizada_con_error`: Con errores

**Pasos:**
1. Crear componente de botón de ejecución
2. Implementar validación de estado
3. Implementar diálogo de confirmación
4. Implementar llamada a API para ejecutar workflow
5. Implementar polling de estado
6. Implementar visualización de resultados en pestañas
7. Implementar renderizado de Markdown
8. Implementar indicadores de estado de pasos

**Criterios de Completación:**
- ✅ Botón de ejecución implementado
- ✅ Validación de estado implementada
- ✅ Diálogo de confirmación implementado
- ✅ Llamada a API implementada
- ✅ Polling implementado
- ✅ Visualización de resultados implementada
- ✅ Renderizado de Markdown implementado
- ✅ Indicadores de estado implementados

---

### Tarea 5.3: Implementar Visualización de Resultados

**Descripción:** Implementar visualización completa de informes Markdown con navegación entre pestañas.

**Especificaciones:**
- Componentes:
  - `ResultsTabs`: Navegación por pestañas
  - `ReportViewer`: Visualizador de Markdown
  - `StepStatus`: Indicador de estado de cada paso
  - `DownloadButton`: Botón para descargar informe
- Pestañas:
  - Resumen
  - Datos Clave
  - Activo Físico
  - Activo Estratégico
  - Activo Financiero
  - Activo Regulado
  - Lectura Inversor
  - Lectura Emprendedor
  - Lectura Propietario
- Funcionalidades:
  - Renderizado de Markdown con syntax highlighting
  - Navegación entre informes
  - Descarga individual de informes
  - Visualización de progreso de ejecución

**Pasos:**
1. Crear componente ResultsTabs
2. Crear componente ReportViewer
3. Implementar renderizado de Markdown
4. Implementar navegación entre pestañas
5. Implementar botón de descarga
6. Implementar indicadores de estado de pasos
7. Implementar visualización de progreso de ejecución

**Criterios de Completación:**
- ✅ Componentes de visualización implementados
- ✅ Renderizado de Markdown implementado
- ✅ Navegación entre pestañas implementada
- ✅ Descarga de informes implementada
- ✅ Indicadores de estado implementados
- ✅ Visualización de progreso implementada

---

### Tarea 5.4: Implementar Gestión de Errores en Frontend

**Descripción:** Implementar manejo de errores en frontend para mostrar mensajes amigables.

**Especificaciones:**
- Tipos de errores:
  - NetworkError: Error de conexión con API
  - ValidationError: Error de validación de datos
  - NotFoundError: Recurso no encontrado
  - ConflictError: Conflicto de estado
  - WorkflowError: Error en ejecución de workflow
- Componentes:
  - `ErrorAlert`: Alerta para mostrar errores
  - `ErrorBoundary`: Boundary para capturar errores
  - `RetryButton`: Botón para reintentar operación
- Manejo:
  - Mostrar alertas con contexto claro
  - Proveer acción para recuperar del error
  - No exponer detalles técnicos al usuario
  - Loggear errores para debugging

**Pasos:**
1. Crear componente ErrorAlert
2. Implementar ErrorBoundary
3. Implementar RetryButton
4. Integrar con servicios de error
5. Implementar manejo de errores en hooks
6. Implementar logging de errores en frontend

**Criterios de Completación:**
- ✅ Componentes de error implementados
- ✅ ErrorBoundary configurado
- ✅ RetryButton implementado
- ✅ Manejo de errores en hooks implementado
- ✅ Logging de errores implementado
- ✅ Mensajes amigables al usuario

---

### Tarea 5.5: Implementar Optimizaciones

**Descripción:** Implementar optimizaciones para mejorar rendimiento y experiencia de usuario.

**Especificaciones:**
- Optimizaciones:
  - Lazy loading de informes Markdown
  - Caché de respuestas de API frecuentes
  - Paginación en listados de proyectos
  - Debouncing en búsquedas
  - Memoización de componentes pesados
- Caché:
  - Caché de lista de proyectos
  - Caché de detalles de proyecto
  - Caché de resultados
- Paginación:
  - 20 proyectos por página
  - Scroll infinito para mejor rendimiento
  - Navegación por páginas

**Pasos:**
1. Implementar caché de proyectos
2. Implementar caché de detalles
3. Implementar caché de resultados
4. Implementar paginación en listados
5. Implementar lazy loading de informes
6. Implementar debouncing en búsquedas
7. Implementar memoización de componentes

**Criterios de Completación:**
- ✅ Caché de proyectos implementado
- ✅ Caché de detalles implementado
- ✅ Caché de resultados implementado
- ✅ Paginación implementada
- ✅ Lazy loading implementado
- ✅ Debouncing implementado
- ✅ Memoización implementada

---

## Sprint 6: Testing End-to-End y Validación

### Tarea 6.1: Testing de API Worker

**Descripción:** Realizar pruebas completas del API Worker para validar funcionalidad.

**Especificaciones:**
- Pruebas unitarias:
  - Handlers de proyectos
  - Handlers de workflows
  - Handlers de resultados
  - Servicios (ProjectService, ExecutionService, etc.)
- Pruebas de integración:
  - Con D1 database
  - Con R2 storage
  - Con KV secrets
- Pruebas de validación:
  - I-JSON válido
  - I-JSON inválido
  - Estados permitidos
- Framework de testing:
  - Vitest para unit tests
  - Mock de D1, R2, KV para tests

**Pasos:**
1. Crear directorio tests/unit/api/
2. Escribir tests para handlers de proyectos
3. Escribir tests para handlers de workflows
4. Escribir tests para handlers de resultados
5. Escribir tests para servicios
6. Crear mocks para D1, R2, KV
7. Ejecutar tests con Vitest

**Criterios de Completación:**
- ✅ Tests unitarios escritos
- ✅ Mocks creados
- ✅ Tests ejecutados y pasan
- ✅ Cobertura de código aceptable

---

### Tarea 6.2: Testing de Workflow Worker

**Descripción:** Realizar pruebas completas del Workflow Worker para validar orquestación.

**Especificaciones:**
- Pruebas unitarias:
  - Lógica de orquestación
  - Creación de ejecución
  - Creación de pasos
  - Transiciones de estado
- Pruebas de integración:
  - Con OpenAI (mock)
  - Con D1 database
  - Con R2 storage
- Pruebas de flujo:
  - Ejecución secuencial completa
  - Manejo de errores
  - Detención ante error
- Framework de testing:
  - Vitest para unit tests
  - Mock de OpenAI para tests

**Pasos:**
1. Crear directorio tests/unit/workflow/
2. Escribir tests para lógica de orquestación
3. Escribir tests para integración con OpenAI
4. Escribir tests para manejo de errores
5. Crear mocks de OpenAI
6. Ejecutar tests con Vitest

**Criterios de Completación:**
- ✅ Tests unitarios escritos
- ✅ Mocks creados
- ✅ Tests ejecutados y pasan
- ✅ Cobertura de código aceptable

---

### Tarea 6.3: Testing de Frontend

**Descripción:** Realizar pruebas completas del frontend para validar integración y UX.

**Especificaciones:**
- Pruebas unitarias:
  - Componentes de UI
  - Servicios (ProjectService, WorkflowService, ResultsService)
  - Hooks de React
- Pruebas de integración:
  - Con API Worker (mock)
  - Navegación entre páginas
  - Validación de formularios
- Pruebas de E2E:
  - Flujo completo de creación de proyecto
  - Flujo de ejecución de workflow
  - Visualización de resultados
- Framework de testing:
  - Vitest + React Testing Library
  - Mock de API para tests E2E

**Pasos:**
1. Crear directorio tests/unit/frontend/
2. Escribir tests para componentes de UI
3. Escribir tests para servicios
4. Escribir tests para hooks
5. Escribir tests E2E completos
6. Crear mocks de API
7. Ejecutar tests con Vitest

**Criterios de Completación:**
- ✅ Tests unitarios escritos
- ✅ Tests E2E escritos
- ✅ Mocks creados
- ✅ Tests ejecutados y pasan
- ✅ Cobertura de código aceptable

---

### Tarea 6.4: Validación de Despliegue Local

**Descripción:** Validar que el proyecto puede desplegarse localmente con Wrangler.

**Especificaciones:**
- Despliegue local:
  - API Worker con `wrangler dev`
  - Workflow Worker con `wrangler dev`
  - Frontend con `vite dev`
- Verificaciones:
  - Bindings de wrangler configurados correctamente
  - D1 database accesible
  - R2 bucket accesible
  - KV namespace accesible
  - OPENAI_API_KEY accesible
- Comandos de despliegue:
  - `npm run dev:api` - Ejecutar API Worker localmente
  - `npm run dev:workflow` - Ejecutar Workflow Worker localmente
  - `npm run dev` - Ejecutar frontend localmente
  - `wrangler d1 execute` - Consultar D1 localmente

**Pasos:**
1. Verificar configuración de wrangler.toml
2. Verificar bindings configurados
3. Ejecutar API Worker localmente
4. Ejecutar Workflow Worker localmente
5. Ejecutar frontend localmente
6. Probar endpoints localmente
7. Consultar D1 localmente
8. Verificar acceso a recursos

**Criterios de Completación:**
- ✅ Configuración de wrangler verificada
- ✅ Bindings correctos
- ✅ API Worker ejecuta localmente
- ✅ Workflow Worker ejecuta localmente
- ✅ Frontend ejecuta localmente
- ✅ Endpoints probados
- ✅ D1 accesible
- ✅ Recursos accesibles

---

### Tarea 6.5: Validación de Integración con Recursos Existentes

**Descripción:** Verificar que la integración con recursos Cloudflare existentes funciona correctamente.

**Especificaciones:**
- Recursos a verificar:
  - KV namespace: `secrets-api-inmo`
    - Key: `OPENAI_API_KEY`
  - R2 bucket: `r2-almacen`
    - Directorio: `dir-api-inmo/`
  - Cloudflare Pages: `cb-consulting`
- Verificaciones:
  - OPENAI_API_KEY recuperable desde KV
  - R2 bucket accesible para lectura/escritura
  - Directorio `dir-api-inmo/` accesible
  - Cloudflare Pages accesible para despliegue
- Comandos de prueba:
  - `wrangler kv:key get --namespace=secrets-api-inmo --key=OPENAI_API_KEY`
  - `wrangler r2 object put r2-almacen dir-api-inmo/test.json`
  - `wrangler pages deployment list`

**Pasos:**
1. Probar recuperación de OPENAI_API_KEY desde KV
2. Probar lectura/escritura en R2
3. Probar acceso a directorio en R2
4. Verificar acceso a Cloudflare Pages
5. Verificar configuración de bindings
6. Probar integración completa

**Criterios de Completación:**
- ✅ OPENAI_API_KEY recuperable desde KV
- ✅ R2 accesible para operaciones
- ✅ Directorio en R2 accesible
- ✅ Cloudflare Pages accesible
- ✅ Bindings funcionando
- ✅ Integración con recursos verificada

---

> **Nota:** Este documento está basado en [`implementation-plan.md`](./implementation-plan.md) y en las especificaciones de [`01 architecture.md`](../fase03/01%20architecture.md), [`03 data-model.md`](../fase03/03%20data-model.md), [`02 api-contract.md`](../fase02/02%20api-contract.md).
