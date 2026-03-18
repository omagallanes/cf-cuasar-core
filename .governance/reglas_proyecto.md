# Reglas del Proyecto

> **Aplicación:** Estas reglas aplican a todos los agentes y colaboradores del proyecto.  
> **Versión:** 5.0  
> **Fuente de verdad:** Para valores específicos (nombres de recursos, bindings, variables), consultar `inventario_recursos.md`.

---

## Reglas Obligatorias

### R1 — No asumir valores no documentados

**Prioridad:** Crítica

Si hay duda sobre nombres de recursos, endpoints, contratos entre servicios o cualquier valor no documentado, **preguntar antes de generar código**.

- Solo el usuario puede asignar nombres de recursos Cloudflare.
- No inventar nombres de Workers, KV, D1, R2, Queues, Workflows u otros recursos.
- No asumir URLs, IDs de cuenta, o configuraciones de entorno.
- Consultar `inventario_recursos.md` antes de referenciar cualquier recurso.

---

### R2 — Cero hardcoding

**Prioridad:** Crítica

No codificar literales de `account_id`, URLs de servicios propios, credenciales, IDs de base de datos o cualquier valor que pueda variar entre entornos.

- Usar variables de entorno, bindings y/o KV para gestionar estos valores.
- En el frontend, usar variables con prefijo apropiado (ej. `VITE_*`) y leerlas de forma segura.
- Referenciar `inventario_recursos.md` para conocer los nombres de variables válidos.
- No incluir datos, consultas SQL, enlaces ni configuraciones fijas en el código.

---

### R3 — Gestión de secrets y credenciales

**Prioridad:** Crítica

Todas las claves, tokens y certificados deben guardarse en almacenamiento seguro (KV namespace, GitHub Secrets o `wrangler secret put`).

- En CI/CD, usar secrets de GitHub para inyectar valores en el entorno de build/despliegue.
- En desarrollo local, usar `wrangler secret put` o archivos `.dev.vars` / `.env` (nunca versionados).
- El contenido de secrets **no se versiona** en el repositorio.
- Para secrets accedidos en runtime, usar KV namespace dedicado (ver `inventario_recursos.md`).
- Usar plantillas `.dev.vars.example` y `.env.example` para documentación de variables requeridas.

---

### R4 — Accesores tipados para bindings

**Prioridad:** Alta

Cada aplicación o servicio debe proporcionar un módulo (ej. `env.ts` o `config.ts`) con funciones/accessors tipados para obtener bindings y variables.

- Evitar acceso directo a `env.X` o `process.env.Y` sin pasar por estos helpers.
- Centralizar la validación de variables requeridas en el módulo de configuración.

---

### R5 — Idioma y estilo

**Prioridad:** Alta

| Elemento | Idioma |
|----------|--------|
| Código (variables, funciones, tipos, comentarios) | Inglés |
| Documentación del proyecto y explicaciones de diseño | Español de España |
| Mensajes de error de APIs al cliente | Idioma del usuario final |
| Mensajes al usuario (i18n) | Sistema multidioma con `es-ES` por defecto |

---

### R6 — Convención de respuestas HTTP

**Prioridad:** Media

| Tipo | Estructura | Status |
|------|------------|--------|
| Éxito con payload | `{ data: ... }` | 2xx |
| Éxito sin payload | `{ message: "..." }` | 200/204 |
| Error | `{ error: "..." }` | 4xx/5xx |

- No exponer stack traces en producción.

---

### R7 — CORS y seguridad de orígenes

**Prioridad:** Media

Las aplicaciones que sirven a frontends deben respetar CORS.

- Los orígenes permitidos se configuran vía variables de entorno.
- Los encabezados deben aplicarse globalmente.
- Las preflight requests (OPTIONS) deben responderse correctamente.

---

### R8 — Configuración de despliegue

**Prioridad:** Crítica

- Evitar incluir `account_id` en archivos versionados; el CLI debe resolverlo mediante login.
- Declarar bindings de bases de datos, buckets, colas, etc., con los nombres acordados en `inventario_recursos.md`.
- Variables de entorno sensibles van en archivos discretos por entorno, no versionados.
- El método de despliegue activo debe estar documentado en `inventario_recursos.md` (Sección 0) y `.governance/metodo_despliegue.md`.

---

### R8.b — Método de despliegue explícito

**Prioridad:** Crítica

- El método de despliegue activo del proyecto debe estar **explícitamente definido** en `inventario_recursos.md` (Sección 0) y `.governance/metodo_despliegue.md`.
- El agente responsable del despliegue debe estar **inequívocamente identificado**.
- No debe haber ambigüedad sobre qué agente usar para desplegar.
- Métodos posibles:
  - **Despliegue directo:** `cloudflare-wrangler-deploy` (terminal, Codespaces)
  - **CI/CD automatizado:** `cloudflare-wrangler-actions` (GitHub Actions)
- El método puede variar entre proyectos; cada proyecto debe documentar el suyo.

---

### R9 — Migraciones de esquema de base de datos

**Prioridad:** Alta

Los cambios en el esquema de bases de datos se implementan mediante archivos de migración numerados (`001-initial.sql`, `002-add-table.sql`, etc.).

- No ejecutar DDL dinámico en el código en tiempo de ejecución.
- Las migraciones deben ser idempotentes cuando sea posible.

---

### R10 — Estrategia de pruebas

**Prioridad:** Alta

Usar un framework de test apropiado que ejecute el código en el entorno real o emulado.

- Configurar mocks y bindings en el archivo de configuración del test, no en cada caso de prueba.
- Ejecutar tests como parte del pipeline de CI.

---

### R11 — Calidad de código antes de commit

**Prioridad:** Alta

Ejecutar linters y typechecks; el proyecto debe compilarse sin errores.

- Resolver o silenciar advertencias relevantes en el commit que introduce nuevos archivos o dependencias.
- Incluir ejecución de tests si el proyecto tiene estrategia de pruebas activa.

---

### R12 — Convenciones de commit

**Prioridad:** Media

Cada commit debe tener:

- Un identificador proporcionado por el usuario (fecha/hora o número de ticket), salvo que el usuario responda "Orquestador Decide".
- Descripción detallada y comprensible sin revisar el diff.
- Registro explícito de todos los cambios: qué se modificó, archivos afectados, naturaleza del cambio (creación, modificación, eliminación, reorganización o corrección).

**Excepción:** Si el usuario responde "Orquestador Decide", el orquestador generará el identificador.

---

### R13 — Contratos entre servicios

**Prioridad:** Media

Documentar las rutas, métodos y formatos de request/response de cada endpoint consumido entre servicios.

- Registrar contratos en `inventario_recursos.md` o documento dedicado.
- Verificar disponibilidad antes de desplegar dependencias.

---


### R14 — Variables de entorno del frontend (basadas en `.env`)

**Prioridad:** Alta

* Declarar y documentar todas las variables expuestas al frontend en archivos `.env` versionados (`.env`, `.env.production`, `.env.preview`, etc.) y mantener un `.env.example` como contrato mínimo obligatorio.
* Prohibido depender de `.env.local` no documentados como única fuente de configuración.
* Validar la presencia de variables en tiempo de ejecución (runtime) y no en la carga del módulo.
* Registrar todas las variables en `inventario_recursos.md`, incluyendo entornos y nivel de sensibilidad.
* Garantizar consistencia entre entornos (`dev`, `preview`, `prod`) mediante archivos `.env` explícitos, evitando valores implícitos o no definidos.

 ---

### R15 — Inventario de recursos actualizado

**Prioridad:** Media

**Solo el agente `inventariador` puede actualizar `inventario_recursos.md`.**

- Ningún otro agente (ejecutores, orquestador, validador) tiene permiso para modificar el inventario directamente.
- **Los usuarios humanos TAMPOCO deben modificar el inventario directamente.**
- Los usuarios deben solicitar cambios en el inventario a través del orquestador, quien delegará en `inventariador`.
- El orquestador debe invocar al agente `inventariador` después de las pruebas y antes del commit cuando haya cambios en recursos.
- La consistencia del inventario debe verificarse mediante auditorías periódicas con el agente `inventory-auditor`.

**Ejemplo de prompt para solicitar cambios en el inventario:**

```
Necesito actualizar el inventario:
- Tipo de cambio: [crear/modificar/eliminar/corregir]
- Recurso: [nombre del recurso]
- Detalles: [descripción del cambio]

Por favor, invoca al inventariador para actualizar.
```

---

### R16 — Convención de nombres para bindings (opcional)

**Prioridad:** Baja

Si el proyecto usa bindings de Cloudflare, considerar convención con prefijo `CF_`:

- `CF_D1` para bases de datos D1
- `CF_KV` para almacenamiento KV
- `CF_R2` para almacenamiento R2
- `CF_AI` para Workers AI
- `CF_VECTORIZE` para Vectorize (opcional)
- `CF_QUEUES` para colas (opcional)

> **Nota:** Los nombres específicos se registran en `inventario_recursos.md`.

---

## Referencias a Documentos de Gobernanza

| Documento | Propósito |
|-----------|-----------|
| `reglas_proyecto.md` | Define todas las reglas del proyecto (este documento) |
| `inventario_recursos.md` | Fuente de verdad para recursos, bindings, variables y configuración |
| `.agents/orquestador.md` | Define el rol, responsabilidades y flujo de trabajo del agente orquestador |
| `.agents/inventariador.md` | Agente exclusivo para actualizar el inventario de recursos |
| `.agents/ejecutores/*` | Agentes ejecutores con criterios operativos específicos de cada dominio |

---

## Nota sobre Criterios Operativos de Dominio

Los **criterios operativos específicos de cada dominio técnico** residen en los agentes ejecutores correspondientes, no en este documento.

| Agente | Criterios Operativos |
|--------|---------------------|
| `cloudflare-workers` | Endpoints HTTP, CORS, validación de URLs, manejo de errores |
| `cloudflare-d1` | Migraciones numeradas, no DDL dinámico, queries parametrizadas |
| `cloudflare-kv` | TTL, expiración, patrones de caché y sesiones |
| `cloudflare-r2` | Acceso público/privado, URLs prefirmadas, metadatos HTTP |
| `cloudflare-workflows` | Estructura de workflows, pasos, reintentos |
| `cloudflare-ai` | Modelos de IA, endpoints de inferencia, gestión de tokens |
| `cloudflare-wrangler` | Configuración Wrangler, GitHub Actions, despliegues |
| `frontend-react` | Variables de entorno frontend, shadcn/ui, validación en runtime |

Consulta los archivos de agentes ejecutores para los criterios operativos específicos de cada dominio.
