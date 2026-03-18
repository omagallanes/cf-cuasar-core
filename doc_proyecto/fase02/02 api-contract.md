# Contrato de API - VaaIA

> **Documento:** FASE 2 — Definición  
> **Fuente principal:** [`04 use-cases.md`](../fase01/04%20use-cases.md)  
> **Versión:** 1.0  
> **Fecha:** 2026-03-18

---

## Resumen

Este documento define el contrato de API entre el frontend y el backend de VaaIA para la gestión de proyectos y ejecución de workflows de análisis inmobiliario.

---

## Convenciones

### Formato de Respuesta

Todas las respuestas exitosas siguen este formato:

```json
{
  "data": { ... }
}
```

Todas las respuestas de error siguen este formato:

```json
{
  "error": "Mensaje de error"
}
```

### Códigos de Estado HTTP

| Código | Descripción |
|---------|-------------|
| 200 | OK - Solicitud exitosa |
| 201 | Created - Recurso creado exitosamente |
| 204 | No Content - Recurso eliminado exitosamente |
| 400 | Bad Request - Solicitud inválida |
| 404 | Not Found - Recurso no encontrado |
| 409 | Conflict - Conflicto de estado |
| 500 | Internal Server Error - Error interno del servidor |

---

## Endpoints

### 1. Proyectos

#### 1.1 Listar Proyectos

**GET** `/api/v1/proyectos`

Lista todos los proyectos con paginación opcional.

**Query Parameters:**

| Parámetro | Tipo | Obligatorio | Descripción |
|-----------|-------|-------------|-------------|
| `page` | Integer | No | Número de página (default: 1) |
| `limit` | Integer | No | Cantidad de resultados por página (default: 20) |
| `estado` | String | No | Filtrar por estado: `creado`, `procesando_analisis`, `analisis_con_error`, `analisis_finalizado` |

**Response 200:**

```json
{
  "data": [
    {
      "id": "uuid",
      "nombre": "Local en Sant Joan de la Penya",
      "descripcion": "Local comercial en zona de expansión",
      "estado": "analisis_finalizado",
      "asesor_responsable": "usuario@example.com",
      "fecha_creacion": "2026-03-18T10:00:00Z",
      "fecha_actualizacion": "2026-03-18T11:00:00Z",
      "fecha_analisis_inicio": "2026-03-18T10:30:00Z",
      "fecha_analisis_fin": "2026-03-18T11:00:00Z",
      "i_json_url": "https://r2-url/...",
      "resultados_disponibles": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45
  }
}
```

---

#### 1.2 Crear Proyecto

**POST** `/api/v1/proyectos`

Crea un nuevo proyecto a partir de un I-JSON.

**Request Body:**

```json
{
  "i_json": { ... },
  "nombre": "Nombre personalizado (opcional)",
  "asesor_responsable": "usuario@example.com (opcional)"
}
```

| Campo | Tipo | Obligatorio | Descripción |
|-------|-------|-------------|-------------|
| `i_json` | Object | Sí | Contenido completo del I-JSON del anuncio |
| `nombre` | String | No | Nombre personalizado del proyecto |
| `asesor_responsable` | String | No | Identificador del asesor responsable |

**Response 201:**

```json
{
  "data": {
    "id": "uuid",
    "nombre": "Local en Sant Joan de la Penya",
    "descripcion": "Local comercial en zona de expansión",
    "estado": "creado",
    "asesor_responsable": "usuario@example.com",
    "fecha_creacion": "2026-03-18T10:00:00Z",
    "fecha_actualizacion": "2026-03-18T10:00:00Z",
    "i_json_url": "https://r2-url/...",
    "resultados_disponibles": false
  }
}
```

**Response 400 (ValidationError):**

```json
{
  "error": "Error de validación",
  "detalles": [
    {
      "campo": "i_json",
      "mensaje": "El I-JSON es obligatorio"
    }
  ]
}
```

---

#### 1.3 Obtener Proyecto

**GET** `/api/v1/proyectos/{proyecto_id}`

Obtiene los detalles de un proyecto específico.

**Path Parameters:**

| Parámetro | Tipo | Obligatorio | Descripción |
|-----------|-------|-------------|-------------|
| `proyecto_id` | String (UUID) | Sí | Identificador único del proyecto |

**Response 200:**

```json
{
  "data": {
    "id": "uuid",
    "nombre": "Local en Sant Joan de la Penya",
    "descripcion": "Local comercial en zona de expansión",
    "estado": "analisis_finalizado",
    "asesor_responsable": "usuario@example.com",
    "fecha_creacion": "2026-03-18T10:00:00Z",
    "fecha_actualizacion": "2026-03-18T11:00:00Z",
    "fecha_analisis_inicio": "2026-03-18T10:30:00Z",
    "fecha_analisis_fin": "2026-03-18T11:00:00Z",
    "i_json_url": "https://r2-url/...",
    "resultados_disponibles": true
  }
}
```

**Response 404:**

```json
{
  "error": "Proyecto no encontrado"
}
```

---

#### 1.4 Actualizar Proyecto

**PUT** `/api/v1/proyectos/{proyecto_id}`

Actualiza los datos de un proyecto existente.

**Path Parameters:**

| Parámetro | Tipo | Obligatorio | Descripción |
|-----------|-------|-------------|-------------|
| `proyecto_id` | String (UUID) | Sí | Identificador único del proyecto |

**Request Body:**

```json
{
  "nombre": "Nuevo nombre del proyecto",
  "descripcion": "Nueva descripción del proyecto"
}
```

**Response 200:**

```json
{
  "data": {
    "id": "uuid",
    "nombre": "Nuevo nombre del proyecto",
    "descripcion": "Nueva descripción del proyecto",
    "estado": "analisis_finalizado",
    "asesor_responsable": "usuario@example.com",
    "fecha_creacion": "2026-03-18T10:00:00Z",
    "fecha_actualizacion": "2026-03-18T12:00:00Z",
    "i_json_url": "https://r2-url/...",
    "resultados_disponibles": true
  }
}
```

---

#### 1.5 Eliminar Proyecto

**DELETE** `/api/v1/proyectos/{proyecto_id}`

Elimina un proyecto y todos sus datos asociados (D1 y R2).

**Path Parameters:**

| Parámetro | Tipo | Obligatorio | Descripción |
|-----------|-------|-------------|-------------|
| `proyecto_id` | String (UUID) | Sí | Identificador único del proyecto |

**Response 204:** No content (eliminado exitosamente)

**Response 404:**

```json
{
  "error": "Proyecto no encontrado"
}
```

---

### 2. Workflows

#### 2.1 Ejecutar Workflow de Análisis

**POST** `/api/v1/proyectos/{proyecto_id}/workflows/ejecutar`

Inicia la ejecución del workflow completo de análisis sobre un proyecto.

**Path Parameters:**

| Parámetro | Tipo | Obligatorio | Descripción |
|-----------|-------|-------------|-------------|
| `proyecto_id` | String (UUID) | Sí | Identificador único del proyecto |

**Request Body:**

```json
{
  "confirmar_reejecucion": true
}
```

| Campo | Tipo | Obligatorio | Descripción |
|-------|-------|-------------|-------------|
| `confirmar_reejecucion` | Boolean | No | Confirmación explícita para reejecutar el workflow (solo si hay análisis previos) |

**Response 200:**

```json
{
  "data": {
    "id": "uuid",
    "proyecto_id": "uuid",
    "estado": "en_ejecucion",
    "fecha_inicio": "2026-03-18T10:30:00Z",
    "fecha_fin": null,
    "error_mensaje": null
  },
  "message": "Workflow iniciado correctamente"
}
```

**Response 400:**

```json
{
  "error": "El proyecto ya tiene análisis previos. Confirme la reejecución."
}
```

**Response 409:**

```json
{
  "error": "El proyecto ya tiene un análisis en ejecución"
}
```

---

#### 2.2 Listar Ejecuciones de Workflow

**GET** `/api/v1/proyectos/{proyecto_id}/workflows/ejecuciones`

Obtiene el historial de ejecuciones de workflow para un proyecto.

**Path Parameters:**

| Parámetro | Tipo | Obligatorio | Descripción |
|-----------|-------|-------------|-------------|
| `proyecto_id` | String (UUID) | Sí | Identificador único del proyecto |

**Response 200:**

```json
{
  "data": [
    {
      "id": "uuid",
      "proyecto_id": "uuid",
      "estado": "finalizada_correctamente",
      "fecha_inicio": "2026-03-18T10:30:00Z",
      "fecha_fin": "2026-03-18T11:00:00Z",
      "error_mensaje": null
    }
  ]
}
```

---

#### 2.3 Obtener Ejecución de Workflow

**GET** `/api/v1/proyectos/{proyecto_id}/workflows/ejecuciones/{ejecucion_id}`

Obtiene los detalles de una ejecución específica, incluyendo todos los pasos.

**Path Parameters:**

| Parámetro | Tipo | Obligatorio | Descripción |
|-----------|-------|-------------|-------------|
| `proyecto_id` | String (UUID) | Sí | Identificador único del proyecto |
| `ejecucion_id` | String (UUID) | Sí | Identificador único de la ejecución |

**Response 200:**

```json
{
  "data": {
    "ejecucion": {
      "id": "uuid",
      "proyecto_id": "uuid",
      "estado": "finalizada_correctamente",
      "fecha_inicio": "2026-03-18T10:30:00Z",
      "fecha_fin": "2026-03-18T11:00:00Z",
      "error_mensaje": null
    },
    "pasos": [
      {
        "id": "uuid",
        "ejecucion_id": "uuid",
        "tipo_paso": "resumen",
        "orden": 1,
        "estado": "correcto",
        "fecha_inicio": "2026-03-18T10:30:05Z",
        "fecha_fin": "2026-03-18T10:30:20Z",
        "error_mensaje": null,
        "ruta_archivo_r2": "r2-almacen/dir-api-inmo/proyecto_id/resumen.md"
      },
      {
        "id": "uuid",
        "ejecucion_id": "uuid",
        "tipo_paso": "datos_clave",
        "orden": 2,
        "estado": "correcto",
        "fecha_inicio": "2026-03-18T10:30:25Z",
        "fecha_fin": "2026-03-18T10:30:45Z",
        "error_mensaje": null,
        "ruta_archivo_r2": "r2-almacen/dir-api-inmo/proyecto_id/datos_clave.md"
      }
      // ... más pasos
    ]
  }
}
```

---

### 3. Resultados

#### 3.1 Obtener Resultados de Análisis

**GET** `/api/v1/proyectos/{proyecto_id}/resultados`

Obtiene la lista de informes Markdown generados para un proyecto.

**Path Parameters:**

| Parámetro | Tipo | Obligatorio | Descripción |
|-----------|-------|-------------|-------------|
| `proyecto_id` | String (UUID) | Sí | Identificador único del proyecto |

**Response 200:**

```json
{
  "data": {
    "proyecto": {
      "id": "uuid",
      "nombre": "Local en Sant Joan de la Penya",
      "estado": "analisis_finalizado"
    },
    "informes": [
      {
        "tipo": "resumen",
        "titulo": "Resumen del inmueble",
        "url": "https://r2-url/.../resumen.md",
        "fecha_generacion": "2026-03-18T10:30:20Z"
      },
      {
        "tipo": "datos_clave",
        "titulo": "Datos clave del inmueble",
        "url": "https://r2-url/.../datos_clave.md",
        "fecha_generacion": "2026-03-18T10:30:45Z"
      }
      // ... más informes
    ]
  }
}
```

---

#### 3.2 Obtener Informe Específico

**GET** `/api/v1/proyectos/{proyecto_id}/resultados/{tipo_informe}`

Obtiene el contenido de un informe Markdown específico.

**Path Parameters:**

| Parámetro | Tipo | Obligatorio | Descripción |
|-----------|-------|-------------|-------------|
| `proyecto_id` | String (UUID) | Sí | Identificador único del proyecto |
| `tipo_informe` | String | Sí | Tipo de informe: `resumen`, `datos_clave`, `activo_fisico`, `activo_estrategico`, `activo_financiero`, `activo_regulado`, `lectura_inversor`, `lectura_emprendedor`, `lectura_propietario` |

**Response 200:**

```markdown
# Resumen del Inmueble

## Descripción
Local comercial en zona de expansión...

## Características Principales
- 212 m² construidos
- 203 m² útiles
- Construido en 1969
...
```

**Response 404:**

```json
{
  "error": "Informe no encontrado"
}
```

---

## Tipos de Datos

### Estado del Proyecto

```typescript
type EstadoProyecto = 'creado' | 'procesando_analisis' | 'analisis_con_error' | 'analisis_finalizado';
```

### Estado de Ejecución

```typescript
type EstadoEjecucion = 'iniciada' | 'en_ejecucion' | 'finalizada_correctamente' | 'finalizada_con_error';
```

### Estado de Paso

```typescript
type EstadoPaso = 'pendiente' | 'en_ejecucion' | 'correcto' | 'error';
```

### Tipo de Paso

```typescript
type TipoPaso = 'resumen' | 'datos_clave' | 'activo_fisico' | 'activo_estrategico' | 'activo_financiero' | 'activo_regulado' | 'lectura_inversor' | 'lectura_emprendedor' | 'lectura_propietario';
```

---

## Errores Comunes

| Código HTTP | Error | Descripción | Solución |
|-------------|-------|-------------|------------|
| 400 | ValidationError | Datos de solicitud inválidos | Verificar el formato de los datos enviados |
| 404 | NotFound | Recurso no encontrado | Verificar que el ID del recurso es correcto |
| 409 | Conflict | Conflicto de estado | El proyecto ya tiene un análisis en ejecución |
| 500 | InternalServerError | Error interno del servidor | Contactar soporte técnico |

---

> **Nota:** Este contrato de API está basado en [`04 use-cases.md`](../fase01/04%20use-cases.md) y [`feature-workflow-analisis.spec.md`](./feature-workflow-analisis.spec.md) como fuentes principales.
